import * as React from 'react';
import { lazyInject, Services, Database, ImportHelper } from './services';
import { Category, CategoryRule } from './entities';
import { Button, Intent, InputGroup, Toaster, MenuItem, Card, Elevation } from '@blueprintjs/core';
import { Select } from '@blueprintjs/select';

const CategorySelect = Select.ofType<Category>();

interface State {
	categories?: Category[];
	rules?: CategoryRule[];

	createRuleMatch: string;
	createRuleCategory?: Category;
}

export class ManageRules extends React.Component<{}, State> {
	@lazyInject(Services.Database)
	database!: Database;

	@lazyInject(Services.Toaster)
	private toaster!: Toaster;

	constructor(props: {}) {
		super(props);

		this.state = {
			createRuleMatch: ''
		};

		this.load();
	}

	async load() {
		let categories = await this.database.categories.find();
		categories.sort((a, b) => a.name.localeCompare(b.name));

		let rules = await this.database.rules.find();
		rules.sort((a, b) => a.descriptionContains.localeCompare(b.descriptionContains));

		this.setState({
			categories,
			rules
		});
	}

	async addRule() {
		if (!this.state.createRuleMatch) {
			this.toaster.show({
				intent: Intent.DANGER,
				message: 'Please enter a description to match'
			});
			return;
		}

		if (!this.state.createRuleCategory) {
			this.toaster.show({
				intent: Intent.DANGER,
				message: 'Please select a category to set'
			});
			return;
		}

		let rule = await this.database.rules.save(new CategoryRule(this.state.createRuleCategory, this.state.createRuleMatch));

		//Categorise any that match it
		var changed = await new ImportHelper(this.database).applyRuleToDatabase(rule);
		this.toaster.show({
			intent: Intent.SUCCESS,
			message: 'Updated ' + changed.length + ' transactions'
		});

		await this.load();

		this.setState({
			createRuleMatch: '',
			createRuleCategory: undefined
		});
	}

	async deleteRule(r: CategoryRule) {
		if (!confirm("Are you sure you want to delete this rule?")) {
			return;
		}

		await this.database.rules.delete(r);

		await this.load();
	}

	render() {
		if (!this.state.categories || !this.state.rules) {
			return <div>Loading</div>;
		}

		let category = this.state.createRuleCategory;

		return <div className="manage-rules boxed-page">
			<div className="thin">
				<h1>Rules</h1>
				<Card elevation={Elevation.THREE} style={{ padding: 0, height: 'calc(90vh - 100px)', overflowY: 'scroll' }}>
					<table className="pt-html-table pt-html-table-striped">
						<thead>
							<tr>
								<th>Description to match</th>
								<th>Category</th>
							</tr>
						</thead>
						<tbody>
							{this.state.rules.map(c => <tr key={c.categoryRuleId}>
								<td>{c.descriptionContains}</td>
								<td>{c.category.name}</td>
								<td><Button minimal intent={Intent.DANGER} icon="delete" onClick={() => this.deleteRule(c)} /></td>
							</tr>)}
						</tbody>
					</table>
				</Card>
				<Card elevation={Elevation.THREE} style={{ padding: 0 }}>
					<table className="pt-html-table" style={{ width: '100%', paddingRight: 17 }}>
						<tfoot>
							<tr>
								<td><form onSubmit={e => { e.preventDefault(); this.addRule(); }}>
									<InputGroup placeholder="Description to match" value={this.state.createRuleMatch} onChange={(e: React.ChangeEvent<HTMLInputElement>) => this.setState({ createRuleMatch: e.target.value })} />
								</form></td>
								<td><CategorySelect
									items={this.state.categories}
									itemRenderer={(i, p) => <MenuItem active={p.modifiers.active} disabled={p.modifiers.disabled} key={i.categoryId} text={i.name} onClick={p.handleClick} />}
									onItemSelect={c => this.setState({ createRuleCategory: c })}>
									<Button
										icon="tag"
										rightIcon="caret-down"
										text={category ? category.name : "Select one"}
									/>
								</CategorySelect></td>
								<td><Button minimal intent={Intent.PRIMARY} icon="add" onClick={() => this.addRule()} /></td>
							</tr>
						</tfoot>
					</table>
				</Card>
			</div>
		</div>;
	}
}