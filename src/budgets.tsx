import * as React from 'react';
import { Card, EditableText, Elevation, Navbar, NavbarGroup, Alignment, InputGroup, Icon, Button, NavbarDivider, ControlGroup, Intent, NonIdealState, Toaster } from '@blueprintjs/core';
import { Services, Database, lazyInject } from './services';
import { Budget, Category, BudgetCategory } from './entities';

interface State {
	budgets?: Budget[];
	categories?: Category[];

	selectedBudget?: Budget;
}

export class Budgets extends React.Component<{}, State> {
	@lazyInject(Services.Database)
	database!: Database;

	@lazyInject(Services.Toaster)
	private toaster!: Toaster;

	constructor(props: any) {
		super(props);

		this.state = {
		};

		this.load();
	}

	private async load() {
		let budgets = await this.database.budgets.find({
			relations: [
				'budgetCategories',
				'budgetCategories.category'
			],
			order: {
				name: 'ASC'
			}
		});

		let categories = await this.database.categories.find({
			order: {
				name: 'ASC'
			}
		});

		budgets.forEach(b => this.addMissingCategories(b, categories));

		this.setState({
			budgets,
			categories,
			selectedBudget: budgets[0]
		});
	}

	private async addBudget() {
		const newBudgetName = 'New Budget';

		if (this.state.budgets!.some(b => b.name == newBudgetName)) {
			this.toaster.show({
				message: "Please rename 'New Budget' first",
				intent: Intent.DANGER
			});
			return;
		}

		let budget = new Budget(newBudgetName);
		await this.database.budgets.save(budget);

		let budgets = [budget, ...this.state.budgets!];

		budgets.sort((a, b) => a.name.localeCompare(b.name));

		this.setState({
			budgets,
			selectedBudget: budget
		});
	}

	private addMissingCategories(budget: Budget, categories?: Category[]) {
		categories = categories || this.state.categories!;

		categories.forEach(c => {
			if (!budget.budgetCategories!.some(bc => bc.category.categoryId == c.categoryId)) {
				budget.budgetCategories!.push(new BudgetCategory(budget, c));
			}
		})
	}

	private async deleteBudget() {
		const selectedBudget = this.state.selectedBudget;

		if (!selectedBudget) {
			return;
		}

		if (confirm("Are you sure you want to delete '" + selectedBudget.name + "' ?")) {
			await this.database.budgets.delete(selectedBudget);

			let budgets = this.state.budgets!.filter(b => b.budgetId != selectedBudget.budgetId);
			this.setState({
				budgets,
				selectedBudget: budgets[0] || null
			});
		}
	}

	setSelectedBudgetName(name: string) {
		//Copy the object (and replace it's name) so react will know it's changed
		var selectedBudget = this.state.selectedBudget!;
		var budget = new Budget(name);
		budget.budgetCategories = selectedBudget.budgetCategories;
		budget.budgetId = selectedBudget.budgetId;

		//Replace the budget in the budgets array
		var budgets = this.state.budgets!.map(b => b.budgetId == budget.budgetId ? budget : b);

		console.log('ssbn ' + name);
		this.setState({
			selectedBudget: budget,
			budgets
		});
	}

	saveSelectedBudget() {
		this.database.budgets.save(this.state.selectedBudget!);
	}


	render() {
		if (!this.state.budgets) {
			return null;
		}

		return <div className="budgets boxed-page">
			<Navbar>
				<NavbarGroup align={Alignment.LEFT}>
					<ControlGroup>
						<div className="pt-select">
							<select>
								{this.state.budgets.map(b => <option key={b.budgetId}>{b.name}</option>)}
							</select>
						</div>

						<Button icon="add" intent={Intent.PRIMARY} title="Create a new Budget" onClick={() => this.addBudget()} />
						<Button icon="delete" intent={Intent.DANGER} title="Delete this Budget" onClick={() => this.deleteBudget()} />
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
			{!this.state.selectedBudget ? <NonIdealState title="You have no budgets" description="Create one using the blue button at the top left" visual="comparison" /> : this.renderSelectedBudget(this.state.selectedBudget)}
			}
		</div>;
	}

	private renderSelectedBudget(budget: Budget) {
		return <div className="thin">
			<h1><EditableText value={budget.name} onChange={e => this.setSelectedBudgetName(e)} onConfirm={() => this.saveSelectedBudget()} /></h1>
			<Card elevation={Elevation.THREE}>
				Viewing 1 Jan - 31 June (6 months)
				<table className="pt-html-table" style={{ width: '100%' }}>
					<thead>
						<tr><th>Category</th><th>2016</th><th>2017</th><th>Budget</th><th>2018</th><th>% (So Far)</th><th>% (Year)</th></tr>
					</thead>
					<tbody>
						{budget.budgetCategories!.map(bc => <tr key={bc.category.categoryId}>
							<td>{bc.category.name}</td>
							<td>$???</td>
							<td>$???</td>
							<th>$<EditableText value={bc.amount.toString()} /></th>
							<td>$???</td>
							<td>??%</td>
							<td>??%</td>
						</tr>)}
					</tbody>
				</table>

			</Card>
		</div>
	}
}