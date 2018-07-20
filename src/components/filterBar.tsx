import * as React from 'react';
import * as dayjs from 'dayjs';
import { Navbar, NavbarGroup, Alignment, ButtonGroup, Button, Popover, Menu, MenuItem, NavbarDivider } from '@blueprintjs/core';
import { Select } from '@blueprintjs/select';

import { Category, BankAccount } from '../entities';

let CategorySelect = Select.ofType<Category>();

export interface DateRange {
	name: string;
	start: () => dayjs.Dayjs | null;
	end: () => dayjs.Dayjs | null;
}

export const DateRanges = new Array<DateRange>(
	{ name: 'This Month', start: () => dayjs().startOf('month'), end: () => dayjs().endOf('month') },
	{ name: 'Last Month', start: () => dayjs().subtract(1, 'month').startOf('month'), end: () => dayjs().subtract(1, 'month').endOf('month') },
	{ name: 'This Year', start: () => dayjs().startOf('year'), end: () => dayjs().endOf('year') },
	{ name: 'Last Year', start: () => dayjs().subtract(1, 'year').startOf('year'), end: () => dayjs().subtract(1, 'year').endOf('year') },
	{ name: 'All Time', start: () => null, end: () => null }
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
					<Button icon="chevron-left" />
					<Popover>
						<Button icon="calendar" text={this.props.selectedDateRange.name} />
						<Menu>
							{DateRanges.map(d => <MenuItem
								key={d.name}
								text={d.name}
								onClick={() => this.props.selectDateRange(d)}
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
		</Navbar>

	}
}