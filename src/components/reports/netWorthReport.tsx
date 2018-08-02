import * as React from 'react';
import { LineChart, XAxis, YAxis, CartesianGrid, Tooltip, Line, ResponsiveContainer } from 'recharts';
import { BankAccount, Category, dateTransformer } from '../../entities';
import { DateRange } from '../filterBar';
import { lazyInject, Services, Database } from '../../services';
import { Not, IsNull, LessThan } from '../../../node_modules/typeorm';
import { Card, Elevation } from '../../../node_modules/@blueprintjs/core';

export interface NetWorthReportProps {
	selectedAccounts: BankAccount[];
	selectedCategory: Category;
	selectedDateRange: DateRange;
}

interface DataPoint {
	month: string;
	netWorth: number;
}

interface State {
	data?: DataPoint[];
}

export class NetWorthReport extends React.Component<NetWorthReportProps, State> {
	@lazyInject(Services.Database)
	database!: Database;

	constructor(props: NetWorthReportProps) {
		super(props);

		this.state = {};

		this.loadAmounts();
	}

	componentDidUpdate(prevProps: NetWorthReportProps) {
		const props = this.props;
		if (prevProps.selectedAccounts != props.selectedAccounts || prevProps.selectedCategory != props.selectedCategory || prevProps.selectedDateRange != props.selectedDateRange)
			this.loadAmounts();
	}

	private async loadAmounts() {
		let start = this.props.selectedDateRange.getStart();
		if (!start) {
			let firstTx = await this.database.transactions.find({
				order: {
					date: 'ASC'
				},
				take: 1
			})
			start = firstTx[0].date;
		}
		start = start.startOf('month');

		let end = this.props.selectedDateRange.getEnd();
		if (!end) {
			let lastTx = await this.database.transactions.find({
				order: {
					date: 'DESC'
				},
				take: 1
			})
			end = lastTx[0].date.add(1, 'month');
		}
		end = end.startOf('month')

		let data = new Array<DataPoint>();

		//TODO: It'd be faster to query all the transactions and figure it out from there, running a query per account per month is really slow
		//TODO: Category filter
		for (let date = start; date.isBefore(end); date = date.add(1, 'month')) {
			//Get the last value from the given month

			let queryEnd = date.add(1, 'month');

			let sum = 0;
			for (let i = 0; i < this.props.selectedAccounts.length; i++) {
				let a = this.props.selectedAccounts[i];

				let t = await this.database.transactions.find({
					where: {
						bankAccount: a,
						//TODO This doesnt work of course... balance: Not(IsNull()),
						date: LessThan(dateTransformer.to(queryEnd))
					},
					order: {
						date: "DESC",
						bankTransactionId: "DESC" //Within a day these should increment with time
					},
					take: 1
				});

				if (t.length > 0) {
					sum += t[0].balance;
				}
			}

			data.push({
				month: date.format("YYYY-MM"),
				netWorth: sum
			})
		}

		this.setState({
			data
		})
		console.log(data);
	}

	render() {
		if (!this.state.data) {
			return null;
		}

		return <div className="boxed-page" style={{marginLeft: 10, marginRight: 10}}>
			<h1>Net Worth</h1>
			<Card elevation={Elevation.THREE}>
				<ResponsiveContainer height={500} width='100%'>
					<LineChart data={this.state.data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
						<XAxis dataKey="month" />
						<YAxis />
						<CartesianGrid strokeDasharray="3 3" />
						<Tooltip formatter={(e: any) => e.toFixed(2)} />
						<Line type="monotone" dataKey="netWorth" stroke="#8884d8" activeDot={{ r: 8 }} />
					</LineChart>
				</ResponsiveContainer>
			</Card>
		</div>
	}
}