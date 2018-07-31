import * as React from 'react';
import { FilterBar, DateRange, DateRanges } from './components/filterBar';
import { BankAccount, Category, EveryCategory, UncategorisedCategory, dateTransformer } from './entities';
import { lazyInject, Services, Database } from './services';
import { PieChart, Cell, Pie, Tooltip, LineChart, Line, XAxis, YAxis, Legend } from 'recharts';
import { NavbarGroup, Alignment, NavbarDivider, ButtonGroup, Button, Icon } from '../node_modules/@blueprintjs/core';
import { ExpenseIncomeReport } from './components/reports/expenseIncomeReport';
import { ReportsMode } from './components/reports/reportsMode';

interface State {
	accounts?: BankAccount[];
	categoriesForFilter?: Category[];

	selectedAccounts: BankAccount[];
	selectedCategory: Category;
	selectedDateRange: DateRange;

	mode: ReportsMode;
}

export class Reports extends React.Component<{}, State> {
	@lazyInject(Services.Database)
	database!: Database;

	constructor(props: any) {
		super(props);

		this.state = {
			selectedAccounts: [],
			selectedCategory: EveryCategory,
			selectedDateRange: DateRanges[0],

			mode: ReportsMode.Expense
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
		});
	}

	private selectDateRange(d: DateRange) {
		this.setState({
			selectedDateRange: d
		});
	}

	private selectFilterCategory(c: Category) {
		this.setState({
			selectedCategory: c
		});
	}

	private toggleAccount(account: BankAccount) {
		if (this.state.selectedAccounts.some(a => a == account)) {
			this.setState({
				selectedAccounts: this.state.selectedAccounts.filter(a => a != account),
			});
		} else {
			this.setState({
				selectedAccounts: [account, ...this.state.selectedAccounts],
			});
		}
	}



	render() {
		if (!this.state.accounts || !this.state.categoriesForFilter) {
			return <div>Loading</div>;
		}


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

			<ExpenseIncomeReport mode={this.state.mode} selectedAccounts={this.state.selectedAccounts} selectedCategory={this.state.selectedCategory} selectedDateRange={this.state.selectedDateRange} />
		</div>;
	}
}