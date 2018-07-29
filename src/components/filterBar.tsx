import * as React from 'react';
import * as dayjs from 'dayjs';
import { Navbar, NavbarGroup, Alignment, ButtonGroup, Button, Popover, Menu, MenuItem, NavbarDivider } from '@blueprintjs/core';
import { Select } from '@blueprintjs/select';

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
	constructor (private start: dayjs.Dayjs | null, private end: dayjs.Dayjs | null, private name?: string) {
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

}

export class FilterBar extends React.Component<FilterBarProps, State> {

	private isAccountSelected(account: BankAccount): boolean {
		return this.props.selectedAccounts.some(a => a == account);
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

		return <Navbar>
			<NavbarGroup align={Alignment.LEFT}>

				<ButtonGroup>
					<Button icon="chevron-left" onClick={() => this.props.selectDateRange(this.props.selectedDateRange.createPrevious())} />
					<Popover>
						<Button icon="calendar" text={this.props.selectedDateRange.getName()} />
						<Menu>
							{DateRanges.map((d, i) => <MenuItem
								key={i}
								text={d.getName()}
								onClick={() => this.props.selectDateRange(d)}
							/>
							)}
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