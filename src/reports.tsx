import * as React from 'react';
import * as commaNumber from 'comma-number';
import { FilterBar, DateRange, DateRanges } from './components/filterBar';
import { BankAccount, Category, EveryCategory, UncategorisedCategory, dateTransformer } from './entities';
import { lazyInject, Services, Database } from './services';
import { PieChart, Cell, Pie, Tooltip, LineChart, Line, XAxis, YAxis, Legend } from 'recharts';
import { NavbarGroup, Alignment, NavbarDivider, ButtonGroup, Button, Icon } from '../node_modules/@blueprintjs/core';

//https://graphicdesign.stackexchange.com/questions/3682/where-can-i-find-a-large-palette-set-of-contrasting-colors-for-coloring-many-d
const Colors = [
	'#e6194b',
	'#3cb44b',
	'#ffe119',
	'#0082c8',
	'#f58231',
	'#911eb4',
	'#46f0f0',
	'#f032e6',
	'#d2f53c',
	'#fabebe',
	'#008080',
	'#e6beff',
	'#aa6e28',
	'#fffac8',
	'#800000',
	'#aaffc3',
	'#808000',
	'#ffd8b1',
	'#000080',
	'#808080',
	'#FFFFFF',
	'#000000'
];

interface BankTransactionGroup {
	name?: string;
	totalAmount: number;
}

enum ReportsMode {
	Expense,
	Income,
	NetWorth
}

interface State {
	accounts?: BankAccount[];
	categoriesForFilter?: Category[];

	selectedAccounts: BankAccount[];
	selectedCategory: Category;
	selectedDateRange: DateRange;

	mode: ReportsMode;
	results: BankTransactionGroup[];
}

export class Reports extends React.Component<{}, State> {
	@lazyInject(Services.Database)
	database!: Database;

	constructor(props: any) {
		super(props);

		this.state = {
			selectedAccounts: [],
			selectedCategory: EveryCategory,
			selectedDateRange: DateRanges[1], //todo 0

			mode: ReportsMode.Expense,
			results: []
		};

		this.load();
	}

	private async load() {
		let categories = await this.database.categories.find({ order: { name: 'ASC' } })
		let accounts = await this.database.bankAccounts.find({ order: { name: 'ASC' } });

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
		if (this.state.selectedAccounts.length == 0) {
			this.setState({
				results: []
			});
			return;
		}

		//Gotta do this group by manually as "IN" using typeorm QueryBuilder makes bad SQL

		let query = "SELECT name, SUM(amount) AS totalAmount " +
			"FROM bank_transaction " +
			"LEFT JOIN category ON categoryCategoryId=categoryId ";

		//bankAccount
		query += "WHERE bankAccountBankAccountId IN (?";
		for (let i = 1; i < this.state.selectedAccounts.length; i++) {
			query += ",?";
		}
		query += ") ";
		let parameters: any[] = this.state.selectedAccounts.map(a => a.bankAccountId);

		//selectedDateRange
		let start = this.state.selectedDateRange.start();
		let end = this.state.selectedDateRange.end();
		if (start && end) {
			query += "AND date >= ? AND date <= ? ";
			parameters.push(dateTransformer.to(start));
			parameters.push(dateTransformer.to(end));
		}

		//selectedCategory
		if (this.state.selectedCategory.categoryId == EveryCategory.categoryId) {
			//No category filter
		} else if (this.state.selectedCategory.categoryId == UncategorisedCategory.categoryId) {
			query += "AND categoryCategoryId IS NULL ";
		} else {
			query += "AND categoryCategoryId=? ";
			parameters.push(this.state.selectedCategory.categoryId);
		}

		query += " GROUP BY name";
		let res: BankTransactionGroup[] = await this.database.connection.query(query, parameters);
		console.log(res.length);
		console.log(res);

		res.forEach(r => {
			if (!r.name) {
				r.name = 'Uncategorised';
			}
		});

		this.setState({
			results: res
		});
	}

	render() {
		if (!this.state.accounts || !this.state.categoriesForFilter) {
			return <div>Loading</div>;
		}

		var results = this.state.results;
		switch (this.state.mode) {
			case ReportsMode.Expense:
				results = results.filter(r => r.totalAmount < 0);
				results = results.map(r => { return { name: r.name, totalAmount: -r.totalAmount } });

				break;
			case ReportsMode.Income:
				results = results.filter(r => r.totalAmount >= 0);
				break;
			default:
				console.log("Mode not implemented: ", this.state.mode);
		}
		results.sort((a, b) => b.totalAmount - a.totalAmount);

		var sum = 0;
		results.forEach(r => sum += r.totalAmount);

		return <div className="reports">
			<FilterBar accounts={this.state.accounts} categories={this.state.categoriesForFilter} selectedAccounts={this.state.selectedAccounts} selectedCategory={this.state.selectedCategory} selectedDateRange={this.state.selectedDateRange}
				selectDateRange={d => this.selectDateRange(d)}
				selectFilterCategory={c => this.selectFilterCategory(c)}
				toggleAccount={a => this.toggleAccount(a)}>
				<NavbarGroup align={Alignment.LEFT}>
					<NavbarDivider />
					<ButtonGroup>
						<Button text="Expense" active={this.state.mode == ReportsMode.Expense} onClick={() => this.setState({ mode: ReportsMode.Expense })} />
						<Button text="Income" active={this.state.mode == ReportsMode.Income} onClick={() => this.setState({ mode: ReportsMode.Income })} />
						<Button text="Net Worth" active={this.state.mode == ReportsMode.NetWorth} onClick={() => this.setState({ mode: ReportsMode.NetWorth })} />
					</ButtonGroup>
				</NavbarGroup>
			</FilterBar>

			<div>
				<div className='column'>
					{this.renderChart(results, sum)}
				</div>
				<div className='column'>
					<table className="pt-table">
						<tbody>
							{results.map((r, i) => <tr key={r.name}>
								<td><Icon icon='symbol-circle' color={Colors[i % Colors.length]} /></td>
								<td>{r.name}</td>
								<td>{commaNumber(r.totalAmount.toFixed(2))}</td>
								<td>{Math.floor(100 * r.totalAmount / sum)}%</td>
							</tr>)}
						</tbody>
					</table>
				</div>
			</div>
		</div>;
	}

	renderChart(results: BankTransactionGroup[], sum: number) {
		if (results.length == 0) {
			return "No results";
		}

		results = results.map(r => { return { name: r.name + ' (' + Math.floor(100 * r.totalAmount / sum) + '%)', totalAmount: r.totalAmount } });

		return <>
			<PieChart width={400} height={400}>
				<Pie
					isAnimationActive={false}
					data={results}
					dataKey='totalAmount'
					outerRadius='100%'
					fill='#ff0000'
					startAngle={90}
					endAngle={90 + 360}
				>
					{results.map((r, i) => <Cell key={i} fill={Colors[i % Colors.length]} />)}
				</Pie>
				<Tooltip formatter={(e: any) => e.toFixed(2)} />
			</PieChart>
		</>
	}
}