import * as React from 'react';
import Dropzone, { ImageFile } from 'react-dropzone';
import { NonIdealState } from '@blueprintjs/core';
import { OfxParser, lazyInject, Services } from '../services';

import './import.css';
import { Database } from '../services/database';

interface State {
	dropzoneActive: boolean;
}

export class Import extends React.Component<{}, State> {

	@lazyInject(Services.Database)
	private database!: Promise<Database>;

	constructor(props: any) {
		super(props);

		this.state = { dropzoneActive: false };
	}

	async onDrop(arg0: ImageFile[]) {
		console.log((await this.database).bankAccounts);
		
		this.setState({
			dropzoneActive: false
		});

		let text = await new Response(arg0[0]).text();
		let result = new OfxParser().parse(text);
		console.log(result.bankAccountNumber);
		console.log(result.transactions.length);
	}

	onDragEnter() {
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
		return <Dropzone style={{ position: 'relative', width: '100%', height: 'calc(100% - 50px)' }} className={this.state.dropzoneActive ? 'dropzone-active' : ''} onDrop={d => this.onDrop(d)} onDragEnter={() => this.onDragEnter()} onDragLeave={() => this.onDragLeave()}>
			<NonIdealState visual='import' title="Import a file" description="Drag a file on or click to browse" />
		</Dropzone>;
	}
}