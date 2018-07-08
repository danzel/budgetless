import * as React from 'react';
import { Navbar, NavbarGroup, Alignment, ButtonGroup, Button, MenuItem, Checkbox, Popover, Menu, PopoverInteractionKind, NavbarDivider } from '@blueprintjs/core';
import { Select } from '@blueprintjs/select';
import { BankAccount, Category } from './entities';
import { lazyInject, Services, Database } from './services';


let CategorySelect = Select.ofType<Category>();

const everyCategory = new Category("Everything");
const uncategorisedCategory = new Category("Uncategorised");

interface State {
	accounts?: BankAccount[];
	categories?: Category[];

	selectedAccounts: BankAccount[];

	selectedCategory: Category;
}


export class BankTransactionsList extends React.Component<{}, State> {
	@lazyInject(Services.Database)
	database!: Promise<Database>;

	constructor(props: {}) {
		super(props);

		this.state = {
			selectedAccounts: [],
			selectedCategory: everyCategory
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
		})
	}

	private isAccountSelected(account: BankAccount): boolean {
		return this.state.selectedAccounts.some(a => a == account);
	}

	private toggleAccount(account: BankAccount) {
		if (this.state.selectedAccounts.some(a => a == account)) {
			this.setState({
				selectedAccounts: this.state.selectedAccounts.filter(a => a != account)
			});
		} else {
			let a = this.state.selectedAccounts.slice();
			a.push(account);
			this.setState({
				selectedAccounts: a
			});
		}
	}

	private selectCategory(c: Category) {
		this.setState({
			selectedCategory: c
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
						<Button text="TODO Show selected" />
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
			
		</div>;
	}
}