import * as React from 'react';
import { Button, MenuItem, Popover, Intent, Position, Toaster } from '@blueprintjs/core';
import { Select } from '@blueprintjs/select';
import { BankAccount, Category, BankTransaction, dateTransformer, CategoryRule, AddCategory, UncategorisedCategory, EveryCategory } from './entities';
import { lazyInject, Services, Database, ImportHelper } from './services';
import ReactTable, { Column } from 'react-table';
import * as dayjs from 'dayjs';
import { In, IsNull, FindConditions, Between } from 'typeorm';
import { DateRange, FilterBar, DateRanges, MoneyAmount } from './components';

let CategorySelect = Select.ofType<Category>();



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

	windowHeight: number;
}

const ClickPropagationStopper = (props: any) => <span onClick={e => e.stopPropagation()}>{props.children}</span>;

export class BankTransactionsList extends React.Component<{}, State> {
	@lazyInject(Services.Database)
	private database!: Database;

	@lazyInject(Services.Toaster)
	private toaster!: Toaster;

	constructor(props: {}) {
		super(props);

		this.resizeListener = this.resizeListener.bind(this);

		this.state = {
			selectedAccounts: [],
			selectedCategory: EveryCategory,
			selectedDateRange: DateRanges[0],
			transactions: [],
			disableAllTableSelects: false,
			windowHeight: window.innerHeight
		};

		this.load();
	}

	componentDidMount() {
		window.addEventListener('resize', this.resizeListener);
	}

	componentWillUnmount() {
		window.removeEventListener('resize', this.resizeListener);
	}

	private resizeListener() {
		this.setState({
			windowHeight: window.innerHeight
		})
	}

	private async load() {
		let categories = await this.database.categories.find({ order: { name: 'ASC' } })
		let accounts = await this.database.bankAccounts.find({ order: { name: 'ASC' } });

		this.setState({
			accounts,
			allCategories: categories,
			categoriesForFilter: [EveryCategory, UncategorisedCategory, ...categories],
			categoriesForSelecting: [UncategorisedCategory, ...categories, AddCategory],
			selectedAccounts: accounts
		}, () => this.loadTransactions());
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

		//Need to create the category
		if (rule.category.categoryId == AddCategory.categoryId) {
			rule.category = await this.addCategory(rule.category.name);
		}
		
		//Remove the existing category from the selected transaction so it gets applied
		this.state.createRuleTransaction!.category = null;
		await this.database.transactions.save(this.state.createRuleTransaction!)

		await this.database.rules.save(rule);

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
		let recreated = new BankTransaction(t.bankAccount, category, t.importFile, t.date, t.amount, t.description, t.balance);
		recreated.bankTransactionId = t.bankTransactionId;
		recreated.userNote = t.userNote;

		if (category.categoryId == UncategorisedCategory.categoryId) {
			recreated.category = null;
		}

		await this.database.transactions.save(recreated);

		//Replace the item with the new one
		this.setState({
			transactions: this.state.transactions.map(st => st == t ? recreated : st)
		});
	}

	private async addCategory(categoryName: string): Promise<Category> {
		let category = new Category(categoryName);
		await this.database.categories.save(category);

		let categories = [category].concat(this.state.allCategories!).sort((a, b) => a.name.localeCompare(b.name));

		this.setState({
			allCategories: categories,
			categoriesForFilter: [EveryCategory, UncategorisedCategory, ...categories],
			categoriesForSelecting: [UncategorisedCategory, ...categories, AddCategory]
		})

		return category;
	}

	private async addAndSetCategory(t: BankTransaction, categoryName: string) {
		await this.setTransactionCategory(t, await this.addCategory(categoryName));
	}

	private async loadTransactions() {
		let where: FindConditions<BankTransaction> = {
			bankAccount: In(this.state.selectedAccounts!.map(a => a.bankAccountId))
		};

		let start = this.state.selectedDateRange.getStart();
		let end = this.state.selectedDateRange.getEnd();
		if (start && end) {
			where.date = Between(dateTransformer.to(start), dateTransformer.to(end));
		}

		if (this.state.selectedCategory.categoryId == EveryCategory.categoryId) {
			//No category filter
		} else if (this.state.selectedCategory.categoryId == UncategorisedCategory.categoryId) {
			where.category = IsNull();
		} else {
			where.category = this.state.selectedCategory;
		}

		let transactions = await this.database.transactions.find({
			where,
			relations: [
				'bankAccount',
				'category',
				'importFile'
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
				Cell: d => <MoneyAmount amount={(d.value as number)} />
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
					key={(d.original as BankTransaction).bankTransactionId}
					disabled={this.state.disableAllTableSelects}
					items={categoriesForSelecting}
					onQueryChange={q => AddCategory.name = q}
					itemPredicate={(filter, c) => c.categoryId == AddCategory.categoryId || c.name.toLocaleLowerCase().includes(filter.toLocaleLowerCase())}
					itemRenderer={(c, p) => p.query == '' && c.categoryId == AddCategory.categoryId ? <span key={c.categoryId} style={{display: 'none'}} /> : <MenuItem
						active={p.modifiers.active}
						disabled={p.modifiers.disabled}
						key={c.categoryId}
						icon={c.categoryId == AddCategory.categoryId ? 'add' : undefined}
						text={c.categoryId == AddCategory.categoryId ? p.query : c.name}
						onClick={p.handleClick}
						labelElement={c.categoryId == UncategorisedCategory.categoryId ? undefined : <ClickPropagationStopper><Popover modifiers={{ hide: { enabled: false }, preventOverflow: { enabled: false } }} position={Position.BOTTOM_RIGHT} popoverWillOpen={() => this.prepareForCategoryPopover(c, d.original)}>
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
					onItemSelect={c => c.categoryId == AddCategory.categoryId ? this.addAndSetCategory(d.original, c.name) : this.setTransactionCategory(d.original, c)}
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
			<FilterBar accounts={this.state.accounts} categories={categoriesForFilter} selectDateRange={(d) => this.selectDateRange(d)} selectedAccounts={this.state.selectedAccounts} selectedCategory={this.state.selectedCategory} selectedDateRange={this.state.selectedDateRange} selectFilterCategory={(c) => this.selectFilterCategory(c)} toggleAccount={(a) => this.toggleAccount(a)}  />

			<ReactTable
				data={this.state.transactions}
				columns={columns}
				//https://github.com/react-tools/react-table/issues/552
				key={this.state.windowHeight}
				defaultPageSize={Math.floor((this.state.windowHeight - 100 - 29 - 47) / 45) }
				PadRowComponent={() => <div style={{height:30}} />}
				showPageSizeOptions={false}
			/>
		</div>;
	}
}