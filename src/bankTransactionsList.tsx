import * as React from 'react';
import { Navbar, NavbarGroup, Alignment, ButtonGroup, Button, MenuItem, Checkbox, Popover, Menu, PopoverInteractionKind, NavbarDivider, Intent, Position, Toaster } from '@blueprintjs/core';
import { Select, Suggest } from '@blueprintjs/select';
import { BankAccount, Category, BankTransaction, dateTransformer, CategoryRule } from './entities';
import { lazyInject, Services, Database, ImportHelper } from './services';
import ReactTable, { Column } from 'react-table';
import * as dayjs from 'dayjs';
import { In, IsNull, FindConditions, Between } from 'typeorm';
import * as commaNumber from 'comma-number';
import { Transaction } from 'electron';

interface DateRange {
	name: string;
	start: () => dayjs.Dayjs;
	end: () => dayjs.Dayjs;
}

let CategorySelect = Select.ofType<Category>();

const everyCategory = new Category("Everything");
everyCategory.categoryId = -1;
const uncategorisedCategory = new Category("Uncategorised");
uncategorisedCategory.categoryId = -2;
const addCategory = new Category("+");
addCategory.categoryId = -3;

const dateRanges = new Array<DateRange>(
	{ name: 'This Month', start: () => dayjs().startOf('month'), end: () => dayjs().endOf('month') },
	{ name: 'Last Month', start: () => dayjs().subtract(1, 'month').startOf('month'), end: () => dayjs().subtract(1, 'month').endOf('month') },
	{ name: 'This Year', start: () => dayjs().startOf('year'), end: () => dayjs().endOf('year') },
	{ name: 'Last Year', start: () => dayjs().subtract(1, 'year').startOf('year'), end: () => dayjs().subtract(1, 'year').endOf('year') },
);


interface State {
	accounts?: BankAccount[];

	allCategories?: Category[];
	categoriesForFilter?: Category[];
	categoriesForSelecting?: Category[];

	selectedAccounts: BankAccount[];
	selectedCategory: Category;
	selectedDateRange: DateRange;

	transactions: BankTransaction[];

	disableAllTableSelects: boolean;

	createRuleCategory?: Category;
	createRuleDescription?: string;
	createRuleTransaction?: BankTransaction;
}

const ClickPropagationStopper = (props: any) => <span onClick={e => e.stopPropagation()}>{props.children}</span>;

export class BankTransactionsList extends React.Component<{}, State> {
	@lazyInject(Services.Database)
	database!: Promise<Database>;

	@lazyInject(Services.Toaster)
	private toaster!: Toaster;

	constructor(props: {}) {
		super(props);

		this.state = {
			selectedAccounts: [],
			selectedCategory: everyCategory,
			selectedDateRange: dateRanges[0],
			transactions: [],
			disableAllTableSelects: false
		};

		this.load();
	}

	private async load() {
		let db = await this.database;

		let categories = await db.categories.find({ order: { name: 'ASC' } })
		let accounts = await db.bankAccounts.find({ order: { name: 'ASC' } });

		this.setState({
			accounts,
			allCategories: categories,
			categoriesForFilter: [everyCategory, uncategorisedCategory, ...categories],
			categoriesForSelecting: [uncategorisedCategory, ...categories, addCategory],
			selectedAccounts: accounts
		}, () => this.loadTransactions());
	}

	private isAccountSelected(account: BankAccount): boolean {
		return this.state.selectedAccounts.some(a => a == account);
	}

	private toggleAccount(account: BankAccount) {
		if (this.state.selectedAccounts.some(a => a == account)) {
			this.setState({
				selectedAccounts: this.state.selectedAccounts.filter(a => a != account),
				transactions: []
			}, () => this.loadTransactions());
		} else {
			this.setState({
				selectedAccounts: [account, ...this.state.selectedAccounts],
				transactions: []
			}, () => this.loadTransactions());
		}
	}

	private selectFilterCategory(c: Category) {
		this.setState({
			selectedCategory: c,
			transactions: []
		}, () => this.loadTransactions());
	}

	private selectDateRange(dateRange: DateRange) {
		this.setState({
			selectedDateRange: dateRange,
			transactions: []
		}, () => this.loadTransactions());
	}

	private prepareForCategoryPopover(category: Category, transaction: BankTransaction) {
		let desc = transaction.description;

		//If it has a time at the end, remove it
		if (desc.match(/-\d\d:\d\d ;$/)) {
			desc = desc.substr(0, desc.length - 8);
		}
		if (desc.endsWith(' ;')) {
			desc = desc.substr(0, desc.length - 2);
		}

		this.setState({
			createRuleCategory: category,
			createRuleDescription: desc,
			createRuleTransaction: transaction,
		})
	}

	private async addRule() {

		let rule = new CategoryRule(this.state.createRuleCategory!, this.state.createRuleDescription!);
		if (!rule.matches(this.state.createRuleTransaction!)) {
			this.toaster.show({
				intent: Intent.DANGER,
				message: "This rule doesn't match this transaction"
			});
			return;
		}

		let db = await this.database;

		//Need to create the category
		if (rule.category.categoryId == addCategory.categoryId) {
			rule.category = await this.addCategory(rule.category.name);
		}
		
		//Remove the existing category from the selected transaction so it gets applied
		this.state.createRuleTransaction!.category = null;
		await db.transactions.save(this.state.createRuleTransaction!)

		await db.rules.save(rule);

		this.setState({
			createRuleCategory: undefined,
			createRuleDescription: undefined,
			createRuleTransaction: undefined
		});

		let changed = await new ImportHelper(this.database).applyRuleToDatabase(rule);

		//Update the currently loaded transactions
		let updatedTransactions = this.state.transactions.map(t => {
			let matched = changed.find(tx => t.bankTransactionId == tx.bankTransactionId);

			if (matched) {
				matched.bankAccount = t.bankAccount; //This isn't loaded in applyRule, so copy it over
				return matched;
			}
			return t;
		});
		this.setState({
			transactions: updatedTransactions,
			disableAllTableSelects: true //Hack to close the select
		}, () => this.setState({ disableAllTableSelects: false }));
	}

	private async setTransactionCategory(t: BankTransaction, category: Category) {
		//recreate it so we can replace it in the react state
		let recreated = new BankTransaction(t.bankAccount, category, t.date, t.amount, t.description, t.balance);
		recreated.bankTransactionId = t.bankTransactionId;
		recreated.calculatedBalance = t.calculatedBalance;
		recreated.userNote = t.userNote;

		if (category.categoryId == uncategorisedCategory.categoryId) {
			recreated.category = null;
		}

		let db = await this.database;
		await db.transactions.save(recreated);

		//Replace the item with the new one
		this.setState({
			transactions: this.state.transactions.map(st => st == t ? recreated : st)
		});
	}

	private async addCategory(categoryName: string): Promise<Category> {
		let category = new Category(categoryName);
		await (await this.database).categories.save(category);

		let categories = [category].concat(this.state.allCategories!).sort((a, b) => a.name.localeCompare(b.name));

		this.setState({
			allCategories: categories,
			categoriesForFilter: [everyCategory, uncategorisedCategory, ...categories],
			categoriesForSelecting: [uncategorisedCategory, ...categories, addCategory]
		})

		return category;
	}

	private async addAndSetCategory(t: BankTransaction, categoryName: string) {
		await this.setTransactionCategory(t, await this.addCategory(categoryName));
	}

	private async loadTransactions() {
		let db = await this.database;

		let where: FindConditions<BankTransaction> = {
			bankAccount: In(this.state.selectedAccounts!.map(a => a.bankAccountId)),
			date: Between(dateTransformer.to(this.state.selectedDateRange.start()), dateTransformer.to(this.state.selectedDateRange.end())),
		};
		if (this.state.selectedCategory.categoryId == everyCategory.categoryId) {
			//No category filter
		} else if (this.state.selectedCategory.categoryId == uncategorisedCategory.categoryId) {
			where.category = IsNull();
		} else {
			where.category = this.state.selectedCategory;
		}

		let transactions = await db.transactions.find({
			where,
			relations: [
				'bankAccount',
				'category'
			],
			order: {
				date: 'DESC'
			}
		});

		this.setState({
			transactions
		});
	}

	render() {
		const categoriesForFilter = this.state.categoriesForFilter;
		const categoriesForSelecting = this.state.categoriesForSelecting;
		if (!this.state.accounts || !categoriesForFilter || !categoriesForSelecting) {
			return <div>Loading</div>;
		}

		let accountsButtonText = "All Accounts Selected";
		if (this.state.accounts.length != this.state.selectedAccounts.length) {
			if (this.state.selectedAccounts.length == 1) {
				accountsButtonText = this.state.selectedAccounts[0].name;
			} else {
				accountsButtonText = this.state.selectedAccounts.length + " Accounts Selected";
			}
		}

		const columns: Column[] = [
			{
				Header: 'Date',
				width: 90,
				accessor: 'date',
				Cell: d => (d.value as dayjs.Dayjs).format("YYYY-MM-DD")
			},
			{
				Header: 'Amount',
				width: 100,
				accessor: 'amount',
				className: 'amount',
				Cell: d => {
					let amount = (d.value as number);
					let className = amount >= 0 ? 'income' : 'expense';
					let amountStr = commaNumber(Math.abs(amount).toFixed(2));
					if (amount > 0) {
						amountStr = '+ ' + amountStr;
					} else {
						amountStr = '- ' + amountStr;
					}

					return <span className={className}>{amountStr} </span>
				}
			},
			{
				Header: 'Description',
				accessor: 'description'
			},
			{
				Header: 'Category',
				width: 150,
				accessor: 'category',
				Cell: d => <CategorySelect
					disabled={this.state.disableAllTableSelects}
					items={categoriesForSelecting}
					onQueryChange={q => addCategory.name = q}
					itemPredicate={(filter, c) => c.categoryId == addCategory.categoryId || c.name.toLocaleLowerCase().includes(filter.toLocaleLowerCase())}
					itemRenderer={(c, p) => p.query == '' && c.categoryId == addCategory.categoryId ? <span key={c.categoryId} style={{display: 'none'}} /> : <MenuItem
						active={p.modifiers.active}
						disabled={p.modifiers.disabled}
						key={c.categoryId}
						icon={c.categoryId == addCategory.categoryId ? 'add' : undefined}
						text={c.categoryId == addCategory.categoryId ? p.query : c.name}
						onClick={p.handleClick}
						labelElement={c.categoryId == uncategorisedCategory.categoryId ? undefined : <ClickPropagationStopper><Popover modifiers={{ hide: { enabled: false }, preventOverflow: { enabled: false } }} position={Position.BOTTOM_RIGHT} popoverWillOpen={() => this.prepareForCategoryPopover(c, d.original)}>
							<Button icon="automatic-updates" title="Create an automatic rule" />
							<div style={{ padding: 20 }}>
								<h5>Automatic Rule</h5>
								Automatically assign category when description matches <br />
								<div>
									<input className="pt-input pt-fill" value={this.state.createRuleDescription} onChange={e => this.setState({ createRuleDescription: e.currentTarget.value })} />
									<Button intent={Intent.PRIMARY} text="Add Rule" onClick={() => this.addRule()} />
								</div>
							</div>
						</Popover></ClickPropagationStopper>} />}
					onItemSelect={c => c.categoryId == addCategory.categoryId ? this.addAndSetCategory(d.original, c.name) : this.setTransactionCategory(d.original, c)}
				>
					<Button text={(d.value ? d.value.name : "Uncategorised")} />
				</CategorySelect>
			},
			{
				Header: 'Account',
				width: 100,
				accessor: 'bankAccount',
				Cell: d => (d.value as BankAccount).name
			}
		];
		return <div className="bank-transactions-list">
			<Navbar>
				<NavbarGroup align={Alignment.LEFT}>

					<ButtonGroup>
						<Button icon="chevron-left" />
						<Popover>
							<Button icon="calendar" text={this.state.selectedDateRange.name} />
							<Menu>
								{dateRanges.map(d => <MenuItem
									key={d.name}
									text={d.name}
									onClick={() => this.selectDateRange(d)}
								/>
								)}
							</Menu>
						</Popover>
						<Button icon="chevron-right" />
					</ButtonGroup>

					<NavbarDivider />

					<Popover>
						<Button icon="bank-account" text={accountsButtonText} />
						<Menu>
							{this.state.accounts.map(a => <MenuItem
								shouldDismissPopover={false}
								key={a.bankAccountId}
								text={a.name}
								icon={this.isAccountSelected(a) ? "tick" : "blank"}
								onClick={() => this.toggleAccount(a)} />)}
						</Menu>
					</Popover>

					<NavbarDivider />

					<CategorySelect
						items={categoriesForFilter}
						itemPredicate={(filter, c) => c.name.toLocaleLowerCase().includes(filter.toLocaleLowerCase())}
						itemRenderer={(c, p) => <MenuItem active={p.modifiers.active} disabled={p.modifiers.disabled} key={c.categoryId} text={c.name} onClick={p.handleClick} />}
						onItemSelect={c => this.selectFilterCategory(c)}
					>
						<Button text={this.state.selectedCategory.name} icon="tag" />
					</CategorySelect>

				</NavbarGroup>
			</Navbar>

			<ReactTable
				data={this.state.transactions}
				columns={columns}
			/>
		</div>;
	}
}