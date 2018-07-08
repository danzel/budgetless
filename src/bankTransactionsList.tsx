import * as React from 'react';
import { Navbar, NavbarGroup, Alignment, ButtonGroup, Button, MenuItem, Checkbox, Popover, Menu } from '@blueprintjs/core';
import { MultiSelect } from '@blueprintjs/select';
import { BankAccount } from './entities';
import { lazyInject, Services, Database } from './services';


let BankAccountSelect = MultiSelect.ofType<BankAccount>();


interface State {
	accounts?: BankAccount[];

	selectedAccounts: BankAccount[];
}


export class BankTransactionsList extends React.Component<{}, State> {
	@lazyInject(Services.Database)
	database!: Promise<Database>;

	constructor(props: {}) {
		super(props);

		this.state = {
			selectedAccounts: []
		};

		this.load();
	}

	private async load() {
		let db = await this.database;

		let accounts = await db.bankAccounts.find({ order: { name: 'ASC' } });

		this.setState({
			accounts,
			selectedAccounts: accounts
		})
	}

	private isAccountSelected(account: BankAccount): boolean {
		return this.state.selectedAccounts.some(a => a == account);
	}

	private toggleAccount(event: React.MouseEvent, account: BankAccount) {
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

		event.preventDefault();
		//TODO ^^ This doesn't work
	}

	render() {

		if (!this.state.accounts) {
			return <div>Loading</div>;
		}

		let accountsButtonText = "All Accounts Selected";
		if (this.state.accounts.length != this.state.selectedAccounts.length) {
			if (this.state.selectedAccounts.length == 1) {
				accountsButtonText = "1 Account Selected";
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

					<Popover minimal
						target={<Button text={accountsButtonText} />}
						content={<Menu>
							{this.state.accounts.map(a => <MenuItem
								key={a.bankAccountId}
								text={a.name}
								icon={this.isAccountSelected(a) ? "tick" : "blank"}
								onClick={(e: React.MouseEvent) => this.toggleAccount(e, a)} />)}
						</Menu>}
					/>

					Category
				</NavbarGroup>
			</Navbar>
		</div>;
	}
}