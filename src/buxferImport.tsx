import * as React from 'react';
import { Callout, Intent } from '@blueprintjs/core';

export class BuxferImport extends React.Component<{}, {}> {
	render() {
		return <div className='buxfer-import'>
			<Callout intent={Intent.WARNING} style={{ marginTop: 10, textAlign: 'left' }}>
				<h4>Importing transactions from buxfer</h4>
				<ul>
					<li>Duplicate checking is not performed</li>
					<li>Account names must match exactly</li>
					<li>Rules will not be applied, existing tags will be used</li>
					<li>Only a single tag per transaction will be imported</li>
					<li>Make a backup of your database before importing in case we make a mess</li>
				</ul>
				<b>
					Only import data from buxfer you cannot get as OFX.<br />
					Ideally you do this first (if you are migrating from buxfer) before starting to use budgetless.
				</b>
			</Callout>
		</div>;
	}
}