import * as React from 'react';
import { lazyInject, Database, Services } from './services';
import { BankAccount } from './entities';
import { Card, Button, Intent, Toaster, Elevation } from '@blueprintjs/core';
import { CreateAccount } from './components/createAccount';

interface State {
	accounts?: BankAccount[];
}

export class ManageAccounts extends React.Component<{}, State> {
	@lazyInject(Services.Database)
	database!: Database;

	constructor(props: {}) {
		super(props);

		this.state = {
		};

		this.load();
	}

	async load() {
		let accounts = await this.database.bankAccounts.find();
		accounts.sort((a, b) => a.bankAccountNumber.localeCompare(b.bankAccountNumber));
		this.setState({ accounts });
	}


	async deleteAccount(a: BankAccount) {
		if (!confirm("Are you sure you want to delete this account? All transactions in it will be deleted")) {
			return;
		}

		await this.database.bankAccounts.delete(a);

		await this.load();
	}

	render() {
		if (!this.state.accounts) {
			return <div>Loading</div>;
		}

		return <div className="manage-accounts boxed-page">
			<div className="thin">
				<h1>Manage Accounts</h1>
				<Card elevation={Elevation.THREE} style={{ overflowY: 'auto' }}>
					<h3>Accounts</h3>
					<table className="pt-html-table pt-html-table-striped pt-fill">
						<thead>
							<tr>
								<th>Name</th>
								<th>Number</th>
							</tr>
						</thead>
						<tbody>
							{this.state.accounts.map(a => <tr key={a.bankAccountId}>
								<td style={{ width: '100%' }}>{a.name}</td>
								<td style={{ whiteSpace: 'nowrap' }}>{a.bankAccountNumber}</td>
								<td><Button minimal intent={Intent.DANGER} icon="delete" onClick={() => this.deleteAccount(a)} /></td>
							</tr>)}
						</tbody>
					</table>
				</Card>
				<Card elevation={Elevation.THREE}>
					<CreateAccount accountCreated={() => this.load()} />
				</Card>
			</div>
		</div>;
	}
}