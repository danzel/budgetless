import * as React from 'react';
import { NonIdealState, Tag, Intent, Button, Toaster, Tooltip, Icon, Callout, Card, Spinner } from '@blueprintjs/core';
import { OfxParser, lazyInject, Services, Database, ImportHelper, ParseTransaction, History, BalanceRecalculator } from './services';
import { BankAccount, BankTransaction } from './entities';
import { ImportFile } from './entities/importFile';
import { CreateAccount } from './components/createAccount';

interface State {
	dropzoneActive: boolean;

	bankAccount?: BankAccount;
	duplicates?: ParseTransaction[];

	importFile?: ImportFile;
	transactions?: BankTransaction[];

	addAccountNumber?: string;
}

export class Import extends React.Component<{}, State> {

	@lazyInject(Services.BalanceRecalculator)
	private balanceRecalculator!: BalanceRecalculator;

	@lazyInject(Services.Database)
	private database!: Database;

	@lazyInject(Services.Toaster)
	private toaster!: Toaster;

	@lazyInject(Services.OfxParser)
	private ofxParser!: OfxParser;

	constructor(props: any) {
		super(props);

		this.state = { dropzoneActive: false };
	}

	onDrop(ev: React.DragEvent) {
		console.log('on drop');
		ev.preventDefault();

		this.onDropAsync(ev.dataTransfer.files[0]);
	}

	async onDropAsync(file: File) {
		this.setState({
			dropzoneActive: false
		});

		if (file.name.toLowerCase().endsWith(".ofx")) {
			//Import as OFX
			try {
				let text = await new Response(file).text();
				let parsed = this.ofxParser.parse(file.name, text);
				let helper = new ImportHelper(this.database);
				let result = await helper.dupeCheck(parsed);

				this.setState({
					bankAccount: (await this.database.bankAccounts.find({ where: { bankAccountNumber: parsed.bankAccountNumber } }))[0],
					duplicates: result.duplicates,
					importFile: parsed.importFile,
					transactions: result.newTransactions
				});
			} catch (e) {
				const err: Error = e;
				let fixAction = undefined;
				if (err.message.startsWith(ImportHelper.BankAccountNotFoundMessageStart)) {
					let acc = err.message.substr(ImportHelper.BankAccountNotFoundMessageStart.length);
					fixAction = { text: 'Add', onClick: () => this.setState({ addAccountNumber: acc }) };
				}

				this.toaster.show({
					intent: Intent.DANGER,
					message: (err as Error).message,
					action: fixAction
				});
			}
		} else if (file.name.toLowerCase().endsWith(".csv")) {
			//Assume buxfer CSV
			this.toaster.show({
				intent: Intent.DANGER,
				message: "Not sure how to import this file, did you mean to use the buxfer importer instead?"
			});

		} else {
			this.toaster.show({
				intent: Intent.DANGER,
				message: "Not sure how to import this file, doesn't have a .ofx extension"
			});
		}
	}

	async import() {
		let toastId = this.toaster.show({
			message: <><Spinner small /> Saving transactions</>,
			timeout: 0
		});

		await this.database.entityManager.save([this.state.importFile, this.state.importFile!.importFileContents, ...this.state.transactions!]);

		await this.balanceRecalculator.recalculateAccountBalanceFromInitialZero(this.state.bankAccount!);

		this.toaster.dismiss(toastId);

		this.toaster.show({
			intent: Intent.SUCCESS,
			message: 'Saved ' + this.state.transactions!.length + ' transactions'
		})

		this.setState({
			transactions: undefined,
			duplicates: undefined,
			bankAccount: undefined
		})
	}

	onDragEnter(ev: React.DragEvent) {
		ev.preventDefault();
		this.setState({
			dropzoneActive: true
		})
	}

	onDragLeave() {
		this.setState({
			dropzoneActive: false
		})
	}

	render() {
		if (this.state.addAccountNumber) {
			return <Card><CreateAccount accountNumber={this.state.addAccountNumber} accountCreated={() => this.setState({ addAccountNumber: undefined })} /></Card>
		}
		if (!this.state.bankAccount || !this.state.duplicates || !this.state.transactions) {
			return <div style={{ position: 'relative', width: '100%', height: 'calc(100% - 50px)' }} className={this.state.dropzoneActive ? 'dropzone-active' : ''} onDrop={d => this.onDrop(d)} onDragOver={e => this.onDragEnter(e)} onDragLeave={() => this.onDragLeave()}>
				<NonIdealState visual='import' title="Drag on a file to import">
					<Callout style={{ textAlign: 'left' }} intent={Intent.PRIMARY}>
						Supported Files types:
							<ul>
							<li>OFX</li>
						</ul>
						Buxfer transactions can be imported in the tools menu.
					</Callout>
				</NonIdealState>
			</div>;
		}

		let categoryCount = new Map<string, number>();
		this.state.transactions.forEach(t => {
			let cat = t.category ? t.category.name : 'uncategorised';

			let count = categoryCount.get(cat) || 0;
			count++;
			categoryCount.set(cat, count);
		});

		return <div className="import">
			<h2>Import</h2>
			Will import <Tag large intent={Intent.SUCCESS}>{this.state.transactions.length}</Tag> transactions in to account <Tag large>{this.state.bankAccount.name} ({this.state.bankAccount.bankAccountNumber})</Tag>. Ignoring <Tag large intent={Intent.DANGER}>{this.state.duplicates.length}</Tag> duplicates.<br />
			<Button text="Import" intent={Intent.PRIMARY} onClick={() => this.import()} />

			<table className="pt-html-table pt-html-table-bordered">
				<thead>
					<tr><th>Category</th><th>Count</th></tr>
				</thead>
				<tbody>
					{Array.from(categoryCount).map(c => <tr key={c[0]}><td>{c[0]}</td><td>{c[1]}</td></tr>)}
				</tbody>
			</table>

		</div>;
	}
}