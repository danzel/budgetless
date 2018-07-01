import * as React from 'react';
import { lazyInject, Database, Services } from '../services';
import { BankAccount } from '../entities';
import { Card, ControlGroup, InputGroup, Button, Intent } from '@blueprintjs/core';

import './manageAccounts.css';

interface State {
	accounts?: BankAccount[];

	createAccountNumber: string;
	createAccountName: string;
}

export class ManageAccounts extends React.Component<{}, State> {
	@lazyInject(Services.Database)
	database!: Promise<Database>;

	constructor(props: {}) {
		super(props);

		this.state = {
			createAccountNumber: '',
			createAccountName: ''
		};

		this.load();
	}

	async load() {
		let accounts = await (await this.database).bankAccounts.find();
		accounts.sort((a, b) => a.bankAccountNumber.localeCompare(b.bankAccountNumber));
		this.setState({ accounts });
	}

	async addAccount() {
		if (!this.state.createAccountNumber) {
			alert('Please enter an Account Number');
			return;
		}
		if (!this.state.createAccountName) {
			alert("Please enter an Account Name");
			return;
		}

		if (this.state.accounts && this.state.accounts.some(a => a.bankAccountNumber == this.state.createAccountNumber)) {
			alert("This account number already exists");
			return;
		}

		await (await this.database).bankAccounts.insert({
			bankAccountNumber: this.state.createAccountNumber,
			name: this.state.createAccountName
		});

		await this.load();

		this.setState({
			createAccountName: '',
			createAccountNumber: ''
		});
	}

	async deleteAccount(a: BankAccount) {
		if (!confirm("Are you sure you want to delete this account? All transactions in it will be deleted")) {
			return;
		}

		await (await this.database).bankAccounts.delete(a);

		await this.load();
	}

	render() {
		if (!this.state.accounts) {
			return <div>Loading</div>;
		}

		return <div className="manage-accounts">
			<h1>Manage Accounts</h1>
			<Card >
				<h3>Accounts</h3>
				<table className="pt-html-table pt-html-table-striped">
					<thead>
						<tr>
							<th>Number</th>
							<th>Name</th>
						</tr>
					</thead>
					<tbody>
						{this.state.accounts.map(a => <tr key={a.bankAccountId}>
							<td>{a.bankAccountNumber}</td>
							<td>{a.name}</td>
							<td><Button minimal intent={Intent.DANGER} icon="delete" onClick={() => this.deleteAccount(a)} /></td>
						</tr>)}
					</tbody>
				</table>
			</Card>
			<Card>
				<h3>Add Account</h3>
				<ControlGroup vertical>
					<InputGroup leftIcon="bank-account" placeholder="Account Number" value={this.state.createAccountName} onChange={(e: React.ChangeEvent<HTMLInputElement>) => this.setState({ createAccountName: e.target.value })} />
					<InputGroup leftIcon="bookmark" placeholder="Name" value={this.state.createAccountNumber} onChange={(e: React.ChangeEvent<HTMLInputElement>) => this.setState({ createAccountNumber: e.target.value })} />
					<Button large text="Add Account" intent={Intent.PRIMARY} onClick={() => this.addAccount()} />
				</ControlGroup>
			</Card>
		</div>;
	}
}