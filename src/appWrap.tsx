import * as React from 'react';
import { HashRouter } from 'react-router-dom';
import { lazyInject, Services, Database } from './services';
import { App } from './app';

interface State {
	databaseIsLoaded: boolean;
}

export class AppWrap extends React.Component<{}, State> {
	@lazyInject(Services.Database)
	database!: Database;

	constructor(props: {}) {
		super(props);

		this.state = {
			databaseIsLoaded: this.database.isReady
		};

		if (!this.database.isReady) {
			this.awaitDatabase();
		}
	}

	private async awaitDatabase() {
		await this.database.readyPromise;
		this.setState({
			databaseIsLoaded: true
		});
	}

	render() {
		if (!this.state.databaseIsLoaded) {
			return <span>Loading</span>;
		}
		return <HashRouter><App /></HashRouter>
	}
}