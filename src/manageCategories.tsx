import * as React from 'react';
import { lazyInject, Services, Database } from './services';
import { Category } from './entities';
import { Button, Intent, InputGroup, Toaster } from '@blueprintjs/core';

interface State {
	categories?: Category[];

	createCategoryName: string;
}

export class ManageCategories extends React.Component<{}, State> {
	@lazyInject(Services.Database)
	database!: Database;

	@lazyInject(Services.Toaster)
	private toaster!: Toaster;

	constructor(props: {}) {
		super(props);

		this.state = {
			createCategoryName: ''
		};

		this.load();
	}

	async load() {
		let categories = await this.database.categories.find();
		categories.sort((a, b) => a.name.localeCompare(b.name));
		this.setState({ categories });
	}

	async addCategory() {
		if (!this.state.createCategoryName) {
			this.toaster.show({
				intent: Intent.DANGER,
				message: 'Please enter a Category Name'
			});
			return;
		}

		if (this.state.categories && this.state.categories.some(a => a.name == this.state.createCategoryName)) {
			this.toaster.show({
				intent: Intent.DANGER,
				message: "This category name already exists"
			});
			return;
		}

		await this.database.categories.insert({
			name: this.state.createCategoryName
		});

		await this.load();

		this.setState({
			createCategoryName: ''
		});
	}

	async deleteCategory(c: Category) {
		if (!confirm("Are you sure you want to delete this category? All transactions tagged with it will be reset to untagged")) {
			return;
		}

		await this.database.categories.delete(c);

		await this.load();
	}

	render() {
		if (!this.state.categories) {
			return <div>Loading</div>;
		}

		return <div className="manage-accounts">
			<h1>Categories</h1>
			<table className="pt-html-table pt-html-table-striped">
				<thead>
					<tr>
						<th>Name</th>
					</tr>
				</thead>
				<tbody>
					{this.state.categories.map(c => <tr key={c.categoryId}>
						<td>{c.name}</td>
						<td><Button minimal intent={Intent.DANGER} icon="delete" onClick={() => this.deleteCategory(c)} /></td>
					</tr>)}
				</tbody>
				<tfoot>
					<tr>
						<td><form onSubmit={e => { e.preventDefault(); this.addCategory(); }}>
							<InputGroup placeholder="Name" value={this.state.createCategoryName} onChange={(e: React.ChangeEvent<HTMLInputElement>) => this.setState({ createCategoryName: e.target.value })} />
						</form></td>
						<td><Button minimal intent={Intent.PRIMARY} icon="add" onClick={() => this.addCategory()} /></td>
					</tr>
				</tfoot>
			</table>
		</div>;
	}
}