import * as React from 'react';
import { FilterBar, DateRange, DateRanges } from './components/filterBar';
import { BankAccount, Category, EveryCategory, UncategorisedCategory, dateTransformer } from './entities';
import { lazyInject, Services, Database } from './services';


interface BankTransactionGroup {
	name?: string;
	totalAmount: number;
}

interface State {
	accounts?: BankAccount[];
	categoriesForFilter?: Category[];

	selectedAccounts: BankAccount[];
	selectedCategory: Category;
	selectedDateRange: DateRange;

	results: BankTransactionGroup[];
}

export class Reports extends React.Component<{}, State> {
	@lazyInject(Services.Database)
	database!: Promise<Database>;

	constructor(props: any) {
		super(props);

		this.state = {
			selectedAccounts: [],
			selectedCategory: EveryCategory,
			selectedDateRange: DateRanges[0],

			results: []
		};

		this.load();
	}

	private async load() {
		let db = await this.database;

		let categories = await db.categories.find({ order: { name: 'ASC' } })
		let accounts = await db.bankAccounts.find({ order: { name: 'ASC' } });

		this.setState({
			accounts,
			categoriesForFilter: [EveryCategory, UncategorisedCategory, ...categories],
			selectedAccounts: accounts
		}, () => this.loadAmounts());
	}

	private selectDateRange(d: DateRange) {
		this.setState({
			selectedDateRange: d,
			results: []
		}, () => this.loadAmounts());
	}

	private selectFilterCategory(c: Category) {
		this.setState({
			selectedCategory: c,
			results: []
		}, () => this.loadAmounts());
	}

	private toggleAccount(account: BankAccount) {
		if (this.state.selectedAccounts.some(a => a == account)) {
			this.setState({
				selectedAccounts: this.state.selectedAccounts.filter(a => a != account),
				results: []
			}, () => this.loadAmounts());
		} else {
			this.setState({
				selectedAccounts: [account, ...this.state.selectedAccounts],
				results: []
			}, () => this.loadAmounts());
		}
	}

	private async loadAmounts() {
		let db = await this.database;

		//Gotta do this group by manually as "IN" using typeorm QueryBuilder makes bad SQL

		let query = "SELECT name, SUM(amount) AS totalAmount " +
			"FROM bank_transaction " +
			"LEFT JOIN category ON categoryCategoryId=categoryId " +
			"WHERE bankAccountBankAccountId IN (";
		for (let i = 0; i < this.state.selectedAccounts.length; i++){
			if (i == 0) {
				query += "?";
			} else {
				query += ",?";
			}
		}
		query += ") ";
		let parameters = this.state.selectedAccounts.map(a => a.bankAccountId);

		//TODO: selectedDateRange
		//TODO: category

		query += " GROUP BY name";
		let res: BankTransactionGroup[] = await db.connection.query(query, parameters);
		console.log(res.length);
		console.log(res);
	}

	render() {
		if (!this.state.accounts || !this.state.categoriesForFilter) {
			return <div>Loading</div>;
		}

		return <div className="reports">
			<FilterBar accounts={this.state.accounts} categories={this.state.categoriesForFilter} selectedAccounts={this.state.selectedAccounts} selectedCategory={this.state.selectedCategory} selectedDateRange={this.state.selectedDateRange}
				selectDateRange={d => this.selectDateRange(d)}
				selectFilterCategory={c => this.selectFilterCategory(c)}
				toggleAccount={a => this.toggleAccount(a)} />
		</div>;
	}
}