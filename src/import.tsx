import * as React from 'react';
import { NonIdealState } from '@blueprintjs/core';
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
		console.log((await this.database).bankAccounts);

		this.setState({
			dropzoneActive: false
		});

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
			alert((err as Error).message)
		}
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
				<NonIdealState visual='import' title="Import a file" description="Drag a file on or click to browse" />
			</div>;
		}

		return <div>
			{this.state.bankAccount.name} / {this.state.duplicates.length} / {this.state.transactions.length}
		</div>;
	}
}