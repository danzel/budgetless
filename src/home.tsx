import * as React from 'react';
import { Card, Elevation, Callout, Intent } from '@blueprintjs/core';
import { lazyInject, Services, Database } from './services';

export class Home extends React.Component<{}, {}> {
	@lazyInject(Services.Database)
	database!: Database;

	render() {
		return <div className="manage-rules boxed-page">
			<div className="thin">
				<h1>Home</h1>
				<Card elevation={Elevation.THREE} style={{ overflowY: 'auto' }}>
					<p>Welcome to budgetless.</p>
					<Callout intent={Intent.PRIMARY} icon='info-sign'>
						Your data is being saved in
						<pre>{this.database.databaseLocation}</pre>
					</Callout>

					<b>TODO: Should have some help/intro text here :)</b>
				</Card>
			</div>
		</div>;
	}
}