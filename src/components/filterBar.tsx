import * as React from 'react';
import * as dayjs from 'dayjs';
import { Navbar, NavbarGroup, Alignment, ButtonGroup, Button, Popover, Menu, MenuItem, NavbarDivider, Position, Intent } from '@blueprintjs/core';
import { Select } from '@blueprintjs/select';
import { DateRangePicker } from '@blueprintjs/datetime';

import { Category, BankAccount } from '../entities';

let CategorySelect = Select.ofType<Category>();

type DateRangeLength = 'month' | 'year';

export interface DateRange {
	getName(): string;
	getStart(): dayjs.Dayjs | null;
	getEnd(): dayjs.Dayjs | null;

	createPrevious(): DateRange;
	createNext(): DateRange;
}
class GeneratedDateRange implements DateRange {
	constructor(private length: DateRangeLength, private offset: number) {
	}

	getName(): string {
		switch (this.length) {

			case 'month':
				if (this.offset == 0) {
					return 'This Month';
				}
				if (this.offset == -1) {
					return 'Last Month'
				}

				return this.getStart()!.format('YYYY-MM');
			case 'year':
				if (this.offset == 0) {
					return 'This Year';
				}
				if (this.offset == -1) {
					return 'Last Year';
				}
				return this.getStart().format('YYYY');
			default:
				throw new Error('Not sure how to name this DRL ' + this.length)
		}
	}

	getStart(): dayjs.Dayjs {
		return dayjs().startOf(this.length).add(this.offset, this.length);
	}

	getEnd(): dayjs.Dayjs {
		return dayjs().startOf(this.length).add(this.offset, this.length).add(1, this.length);
	}

	createPrevious(): DateRange {
		return new GeneratedDateRange(this.length, this.offset - 1);
	}

	createNext(): DateRange {
		return new GeneratedDateRange(this.length, this.offset + 1);
	}
}
class StaticDateRange implements DateRange {
	constructor(private start: dayjs.Dayjs | null, private end: dayjs.Dayjs | null, private name?: string) {
	}

	getName() {
		if (this.name) {
			return this.name;
		}

		return this.start!.format('YYYY-MM-DD') + " - " + this.end!.format('YYYY-MM-DD');
	}

	getStart() { return this.start; }
	getEnd() { return this.end; }

	createPrevious() { return this; }
	createNext() { return this; }
}

export const DateRanges = new Array<DateRange>(
	new GeneratedDateRange('month', 0),
	new GeneratedDateRange('month', -1),
	new GeneratedDateRange('year', 0),
	new GeneratedDateRange('year', -1),
	new StaticDateRange(null, null, 'All Time')
);

export interface FilterBarProps {
	accounts: BankAccount[];
	categories: Category[];

	selectedAccounts: BankAccount[];
	selectedCategory: Category;
	selectedDateRange: DateRange;

	toggleAccount: (account: BankAccount) => void;
	selectFilterCategory: (c: Category) => void;
	selectDateRange: (d: DateRange) => void;
}

interface State {
	customDateRange: [Date | undefined, Date | undefined]
}

export class FilterBar extends React.Component<FilterBarProps, State> {
	constructor(props: FilterBarProps) {
		super(props);

		this.state = {
			customDateRange: [undefined, undefined]
		};
	}

	private isAccountSelected(account: BankAccount): boolean {
		return this.props.selectedAccounts.some(a => a == account);
	}

	private loadCustomDateRange() {
		this.props.selectDateRange(new StaticDateRange(dayjs(this.state.customDateRange[0]), dayjs(this.state.customDateRange[1])));
	}

	render() {
		let accountsButtonText = "All Accounts Selected";
		if (this.props.accounts.length != this.props.selectedAccounts.length) {
			if (this.props.selectedAccounts.length == 1) {
				accountsButtonText = this.props.selectedAccounts[0].name;
			} else {
				accountsButtonText = this.props.selectedAccounts.length + " Accounts Selected";
			}
		}

		const canLoadCustom = !!(this.state.customDateRange[0] && this.state.customDateRange[1]);
		let customButtonText = canLoadCustom ? "Load " + dayjs(this.state.customDateRange[0]!).format("YYYY-MM-DD") + " to " + dayjs(this.state.customDateRange[1]!).format("YYYY-MM-DD")
			: "Select date range";

		return <Navbar>
			<NavbarGroup align={Alignment.LEFT}>

				<ButtonGroup>
					<Button icon="chevron-left" onClick={() => this.props.selectDateRange(this.props.selectedDateRange.createPrevious())} />
					<Popover key={this.props.selectedDateRange.getName()} position={Position.BOTTOM}>
						<Button icon="calendar" text={this.props.selectedDateRange.getName()} />
						<Menu className="filter-bar-date-menu">
							{DateRanges.map((d, i) => <MenuItem
								key={i}
								text={d.getName()}
								onClick={() => this.props.selectDateRange(d)}
							/>)}
							<Popover position={Position.RIGHT_BOTTOM}>
								<MenuItem text="Custom" shouldDismissPopover={false} />
								<>
									{/* TODO: Specify mindate from the database */}
									<DateRangePicker contiguousCalendarMonths={false} shortcuts={false} onChange={dates => this.setState({ customDateRange: dates })} />
									<Button text={customButtonText} fill disabled={!canLoadCustom} intent={Intent.PRIMARY} onClick={() => this.loadCustomDateRange()} />
								</>
							</Popover>
						</Menu>
					</Popover>
					<Button icon="chevron-right" onClick={() => this.props.selectDateRange(this.props.selectedDateRange.createNext())} />
				</ButtonGroup>

				<NavbarDivider />

				<Popover>
					<Button icon="bank-account" text={accountsButtonText} />
					<Menu>
						{this.props.accounts.map(a => <MenuItem
							shouldDismissPopover={false}
							key={a.bankAccountId}
							text={a.name}
							icon={this.isAccountSelected(a) ? "tick" : "blank"}
							onClick={() => this.props.toggleAccount(a)} />)}
					</Menu>
				</Popover>

				<NavbarDivider />

				<CategorySelect
					items={this.props.categories}
					itemPredicate={(filter, c) => c.name.toLocaleLowerCase().includes(filter.toLocaleLowerCase())}
					itemRenderer={(c, p) => <MenuItem active={p.modifiers.active} disabled={p.modifiers.disabled} key={c.categoryId} text={c.name} onClick={p.handleClick} />}
					onItemSelect={c => this.props.selectFilterCategory(c)}
				>
					<Button text={this.props.selectedCategory.name} icon="tag" />
				</CategorySelect>

			</NavbarGroup>
			{this.props.children}
		</Navbar>

	}
}