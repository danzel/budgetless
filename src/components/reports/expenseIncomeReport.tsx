import * as React from 'react';
import * as commaNumber from 'comma-number';
import { Icon, NonIdealState, Card, Elevation } from '@blueprintjs/core';
import { ReportsMode } from './reportsMode';
import { PieChart, Pie, Cell, Tooltip } from 'recharts';
import { dateTransformer, EveryCategory, UncategorisedCategory, BankAccount, Category } from '../../entities';
import { DateRange } from '../filterBar';
import { lazyInject, Services, QueryHelper } from '../../services';

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

export interface ExpenseIncomeReportProps {
	mode: ReportsMode;
	selectedAccounts: BankAccount[];
	selectedCategory: Category;
	selectedDateRange: DateRange;
}
interface State {
	results?: BankTransactionGroup[];
}

export class ExpenseIncomeReport extends React.Component<ExpenseIncomeReportProps, State> {
	@lazyInject(Services.QueryHelper)
	queryHelper!: QueryHelper;

	constructor(props: ExpenseIncomeReportProps) {
		super(props);

		this.state = {};

		this.loadAmounts();
	}

	componentDidUpdate(prevProps: ExpenseIncomeReportProps) {
		const props = this.props;
		if (prevProps.mode != props.mode || prevProps.selectedAccounts != props.selectedAccounts || prevProps.selectedCategory != props.selectedCategory || prevProps.selectedDateRange != props.selectedDateRange)
			this.loadAmounts();
	}

	private async loadAmounts() {
		if (this.props.selectedAccounts.length == 0) {
			this.setState({
				results: []
			});
			return;
		}

		let start = this.props.selectedDateRange.getStart();
		let end = this.props.selectedDateRange.getEnd();
		let dr = start && end ? { start, end } : undefined;
		let catSum = await this.queryHelper.calculateCategorySum(dr, this.props.selectedCategory, this.props.selectedAccounts);

		this.setState({
			results: catSum.map(s => { return { name: s.category.name, totalAmount: s.totalAmount } })
		});
	}

	render() {
		let results = this.state.results;

		if (!results) {
			return null;
		}

		switch (this.props.mode) {
			case ReportsMode.Expense:
				results = results.filter(r => r.totalAmount < 0);
				results = results.map(r => { return { name: r.name, totalAmount: -r.totalAmount } });

				break;
			case ReportsMode.Income:
				results = results.filter(r => r.totalAmount >= 0);
				break;
			default:
				console.log("Mode not implemented: ", this.props.mode);
		}
		results.sort((a, b) => b.totalAmount - a.totalAmount);

		var sum = 0;
		results.forEach(r => sum += r.totalAmount);

		if (results.length == 0) {
			return <NonIdealState title="No Results" visual="graph-remove" />;
		}

		return <div className="boxed-page">
			<div className="thin">
				<h1>{this.props.mode == ReportsMode.Expense ? "Expenses" : "Income"}</h1>
				<Card elevation={Elevation.THREE}>
					<div className='column' style={{ paddingRight: 40 }}>
						{this.renderChart(results, sum)}
					</div>
					<div className='column' style={{ overflowY: 'auto' }}>
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
				</Card>
			</div>
		</div>;

	}

	private renderChart(results: BankTransactionGroup[], sum: number) {
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