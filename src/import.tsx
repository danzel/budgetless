import * as React from 'react';
import { NonIdealState } from '@blueprintjs/core';
import { OfxParser, lazyInject, Services, Database } from './services';

interface State {
	dropzoneActive: boolean;
	lastbankAccount: string;
}

export class Import extends React.Component<{}, State> {

	@lazyInject(Services.Database)
	private database!: Promise<Database>;

	constructor(props: any) {
		super(props);

		this.state = { dropzoneActive: false, lastbankAccount: 'none' };
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

		let text = await new Response(file).text();
		let result = new OfxParser().parse(text);
		this.setState({ lastbankAccount: result.bankAccountNumber });
		console.log(result.bankAccountNumber);
		console.log(result.transactions.length);
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
		return <div style={{ position: 'relative', width: '100%', height: 'calc(100% - 50px)' }} className={this.state.dropzoneActive ? 'dropzone-active' : ''} onDrop={d => this.onDrop(d)} onDragOver={e => this.onDragEnter(e)} onDragLeave={() => this.onDragLeave()}>
			<NonIdealState visual='import' title="Import a file" description="Drag a file on or click to browse" />
			<span>{this.state.lastbankAccount}</span>
		</div>;
	}
}