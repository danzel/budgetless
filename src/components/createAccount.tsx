import * as React from "react";
import { ControlGroup, InputGroup, Button, Intent, Toaster } from "../../node_modules/@blueprintjs/core";
import { lazyInject, Services, Database } from "../services";

export interface CreateAccountProps {
	accountNumber?: string;

	accountCreated: () => void;
}

interface State {
	createAccountNumber: string;
	createAccountName: string;
}

export class CreateAccount extends React.Component<CreateAccountProps, State> {
	@lazyInject(Services.Database)
	database!: Database;

	@lazyInject(Services.Toaster)
	private toaster!: Toaster;

	constructor(props: CreateAccountProps) {
		super(props);

		this.state = {
			createAccountName: '',
			createAccountNumber: ''
		}
	}

	static getDerivedStateFromProps(props: CreateAccountProps) {
		if (props.accountNumber) {
			return {
				createAccountNumber: props.accountNumber
			}
		}
		return null;
	}

	async addAccount() {
		if (!this.state.createAccountNumber) {
			this.toaster.show({
				intent: Intent.DANGER,
				message: 'Please enter an Account Number'
			});
			return;
		}
		if (!this.state.createAccountName) {
			this.toaster.show({
				intent: Intent.DANGER,
				message: "Please enter an Account Name"
			});
			return;
		}
		if (!this.state.createAccountNumber.match('^([0-9-])*$')) {
			this.toaster.show({
				intent: Intent.DANGER,
				message: "Invalid Account Name, expected only numbers and -"
			});
			return;
		}

		var existing = await this.database.bankAccounts.findOne({
			where: {
				bankAccountNumber: this.state.createAccountNumber
			}
		});

		if (existing) {
			this.toaster.show({
				intent: Intent.DANGER,
				message: "This account number already exists"
			});
			return;
		}

		await this.database.bankAccounts.insert({
			bankAccountNumber: this.state.createAccountNumber,
			name: this.state.createAccountName
		});

		this.props.accountCreated();

		this.setState({
			createAccountName: '',
			createAccountNumber: ''
		});

		this.toaster.show({
			message: 'Account Created',
			intent: Intent.SUCCESS
		});
	}

	render() {
		return <>
			<h3>Add Account</h3>
			<ControlGroup vertical>
				<InputGroup leftIcon="bank-account" placeholder="Account Number" value={this.state.createAccountNumber} onChange={(e: React.ChangeEvent<HTMLInputElement>) => this.setState({ createAccountNumber: e.target.value })} />
				<InputGroup leftIcon="bookmark" placeholder="Name" value={this.state.createAccountName} onChange={(e: React.ChangeEvent<HTMLInputElement>) => this.setState({ createAccountName: e.target.value })} />
				<Button large text="Add Account" intent={Intent.PRIMARY} onClick={() => this.addAccount()} />
			</ControlGroup>
		</>
	}
}