import * as React from 'react';
import { Navbar, NavbarGroup, Alignment, ButtonGroup, Button, MenuItem, Checkbox, Popover, Menu, PopoverInteractionKind, NavbarDivider } from '@blueprintjs/core';
import { Select } from '@blueprintjs/select';
import { BankAccount, Category, BankTransaction, dateTransformer } from './entities';
import { lazyInject, Services, Database } from './services';
import ReactTable, { Column } from 'react-table';
import * as dayjs from 'dayjs';
import { In, IsNull, FindConditions, Between } from 'typeorm';
import * as commaNumber from 'comma-number';

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

const dateRanges = new Array<DateRange>(
	{ name: 'This Month', start: () => dayjs().startOf('month'), end: () => dayjs().endOf('month') },
	{ name: 'Last Month', start: () => dayjs().subtract(1, 'month').startOf('month'), end: () => dayjs().subtract(1, 'month').endOf('month') },
	{ name: 'This Year', start: () => dayjs().startOf('year'), end: () => dayjs().endOf('year') },
	{ name: 'Last Year', start: () => dayjs().subtract(1, 'year').startOf('year'), end: () => dayjs().subtract(1, 'year').endOf('year') },
);

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
		Cell: d => d.value ? (d.value as Category).name : "Uncategorised"
	},
	{
		Header: 'Account',
		width: 100,
		accessor: 'bankAccount',
		Cell: d => (d.value as BankAccount).name
	}
];

interface State {
	accounts?: BankAccount[];
	categories?: Category[];

	selectedAccounts: BankAccount[];
	selectedCategory: Category;
	selectedDateRange: DateRange;

	transactions: BankTransaction[];
}


export class BankTransactionsList extends React.Component<{}, State> {
	@lazyInject(Services.Database)
	database!: Promise<Database>;

	constructor(props: {}) {
		super(props);

		this.state = {
			selectedAccounts: [],
			selectedCategory: everyCategory,
			selectedDateRange: dateRanges[0],
			transactions: []
		};

		this.load();
	}

	private async load() {
		let db = await this.database;

		let categories = await db.categories.find({ order: { name: 'ASC' } })
		let accounts = await db.bankAccounts.find({ order: { name: 'ASC' } });

		this.setState({
			accounts,
			categories: [everyCategory, uncategorisedCategory, ...categories],
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

	private selectCategory(c: Category) {
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
		console.log(transactions.length);

		this.setState({
			transactions
		});
	}

	render() {
		if (!this.state.accounts || !this.state.categories) {
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
						items={this.state.categories}
						itemPredicate={(filter, c) => c.name.toLocaleLowerCase().includes(filter.toLocaleLowerCase())}
						itemRenderer={(c, p) => <MenuItem active={p.modifiers.active} disabled={p.modifiers.disabled} key={c.categoryId} text={c.name} onClick={p.handleClick} />}
						onItemSelect={c => this.selectCategory(c)}
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