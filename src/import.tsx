import * as React from 'react';
import { NonIdealState, Tag, Intent, Button, Toaster, Tooltip, Icon, Callout } from '@blueprintjs/core';
import { OfxParser, lazyInject, Services, Database, ImportHelper, ParseTransaction } from './services';
import { BankAccount, BankTransaction } from './entities';

interface State {
	dropzoneActive: boolean;

	bankAccount?: BankAccount;
	duplicates?: ParseTransaction[];
	transactions?: BankTransaction[];
}

export class Import extends React.Component<{}, State> {

	@lazyInject(Services.Database)
	private database!: Promise<Database>;

	@lazyInject(Services.Toaster)
	private toaster!: Toaster;

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
				let parsed = new OfxParser().parse(text);
				let helper = new ImportHelper(this.database);
				let result = await helper.dupeCheck(parsed);

				this.setState({
					bankAccount: (await (await this.database).bankAccounts.find({ where: { bankAccountNumber: parsed.bankAccountNumber } }))[0],
					duplicates: result.duplicates,
					transactions: result.newTransactions
				});
			} catch (err) {
				this.toaster.show({
					intent: Intent.DANGER,
					message: (err as Error).message
				})
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
		let db = (await this.database);

		db.transactions.save(this.state.transactions!);

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