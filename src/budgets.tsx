import * as React from 'react';
import { Card, EditableText, Elevation, Navbar, NavbarGroup, Alignment, InputGroup, Icon, Button, NavbarDivider, ControlGroup, Intent } from '@blueprintjs/core';

export class Budgets extends React.Component<{}, {}> {
	render() {
		return <div className="budgets boxed-page">
			<Navbar>
				<NavbarGroup align={Alignment.LEFT}>
					<ControlGroup>
						<div className="pt-select">
							<select>
								<option>Budget 2018</option>
							</select>
						</div>

						<Button icon="add" intent={Intent.PRIMARY} title="Create a new Budget" />
						<Button icon="delete" intent={Intent.DANGER} title="Delete this Budget" />
					</ControlGroup>

					<NavbarDivider />


					<Button minimal text="View Year" />
					<div className="pt-select">
						<select className="pt-select">
							{/* TODO: These dates should be decided off the years there is data for */}
							<option>2018</option>
							<option>2017</option>
							<option>2016</option>
							<option>2015</option>
						</select>
					</div>
				</NavbarGroup>
			</Navbar>
			<div className="thin">
				<h1><EditableText value="Budget 2018" /></h1>
				<Card elevation={Elevation.THREE}>
					Viewing 1 Jan - 31 June (6 months)
					<table className="pt-html-table" style={{ width: '100%' }}>
						<thead>
							<tr><th>Category</th><th>2016</th><th>2017</th><th>Budget</th><th>2018</th><th>% (So Far)</th><th>% (Year)</th></tr>
						</thead>
						<tbody>
							<tr><td>Supermarket</td><td>$1234.54</td><td>$1234.54</td>
								<th>$<EditableText defaultValue="12345.56" /></th>
								<td>$600</td><td>100%</td><td>50%</td></tr>
						</tbody>
					</table>
				</Card>
			</div>
		</div>;
	}
}