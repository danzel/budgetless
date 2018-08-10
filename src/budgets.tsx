import * as React from 'react';
import * as dayjs from 'dayjs';
import { Card, EditableText, Elevation, Navbar, NavbarGroup, Alignment, InputGroup, Icon, Button, NavbarDivider, ControlGroup, Intent, NonIdealState, Toaster } from '@blueprintjs/core';
import { Services, Database, lazyInject } from './services';
import { Budget, Category, BudgetCategory, UncategorisedCategory } from './entities';
import { CategorySum, QueryHelper } from './services/queryHelper';
import { MoneyAmount } from './components';

interface State {
	budgets?: Budget[];

	selectedBudget?: Budget;

	includeNoBudgetRows: boolean;

	fromDb?: {
		categories: Category[];

		twoYearsAgoYear: string;
		lastYearYear: string;
		thisYearYear: string;

		twoYearsAgo: CategorySum[];
		lastYear: CategorySum[];
		thisYear: CategorySum[];
	}
}

export class Budgets extends React.Component<{}, State> {
	@lazyInject(Services.Database)
	database!: Database;

	@lazyInject(Services.QueryHelper)
	queryHelper!: QueryHelper;

	@lazyInject(Services.Toaster)
	private toaster!: Toaster;

	constructor(props: any) {
		super(props);

		this.state = {
			includeNoBudgetRows: false
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

		let now = dayjs();

		let twoYearsAgo = await this.queryHelper.calculateCategorySum({ start: now.subtract(2, 'year').startOf('year'), end: now.subtract(2, 'year').endOf('year') });
		let lastYear = await this.queryHelper.calculateCategorySum({ start: now.subtract(1, 'year').startOf('year'), end: now.subtract(1, 'year').endOf('year') });
		let thisYear = await this.queryHelper.calculateCategorySum({ start: now.startOf('year'), end: now.endOf('year') });

		budgets.forEach(b => this.addMissingCategories(b, categories));

		this.setState({
			budgets,
			fromDb: {
				categories: [...categories, UncategorisedCategory],

				twoYearsAgoYear: now.subtract(2, 'year').format('YYYY'),
				lastYearYear: now.subtract(1, 'year').format('YYYY'),
				thisYearYear: now.format('YYYY'),

				twoYearsAgo,
				lastYear,
				thisYear
			},
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
		categories = categories || this.state.fromDb!.categories;

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

	private setSelectedBudgetName(name: string) {
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

	private saveSelectedBudget() {
		this.database.budgets.save(this.state.selectedBudget!);
	}

	private updateBudgetAmount(category: Category, amount: string) {
		let b = this.state.selectedBudget!
		let bc = b.budgetCategories!.find(bc => bc.category.categoryId == category.categoryId)!;

		let clone = new BudgetCategory(bc.budget, bc.category);
		clone.budgetCategoryId = bc.budgetCategoryId;
		clone.note = bc.note;

		clone.amount = parseFloat(amount);
		if (amount == '') {
			clone.amount = 0;
		} else if (isNaN(clone.amount) || !isFinite(clone.amount)) {
			clone.amount = bc.amount;
		}


		let bClone = new Budget(b.name);
		bClone.budgetId = b.budgetId;
		bClone.budgetCategories = b.budgetCategories!.map(a => a.category.categoryId == clone.category.categoryId ? clone : a);

		this.setState({
			budgets: this.state.budgets!.map(a => a.budgetId == bClone.budgetId ? bClone : a),
			selectedBudget: bClone,
		})
	}

	saveBudgetCategory(bc: BudgetCategory): any {
		this.database.entityManager.save(bc);
	}

	private toggleNoBudgetRows() {
		this.setState({
			includeNoBudgetRows: !this.state.includeNoBudgetRows
		});
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

					<NavbarDivider />

					{this.state.includeNoBudgetRows ? <Button icon='eye-open' text="Showing all categories" onClick={() => this.toggleNoBudgetRows()} /> : <Button icon='eye-off' text="Showing only budgeted categories" onClick={() => this.toggleNoBudgetRows()} />}
				</NavbarGroup>
			</Navbar>
			{!this.state.selectedBudget ? <NonIdealState title="You have no budgets" description="Create one using the blue button at the top left" visual="comparison" /> : this.renderSelectedBudget(this.state.selectedBudget)}
			}
		</div>;
	}

	private renderSelectedBudget(budget: Budget) {
		const fromDb = this.state.fromDb!;

		let categoryAmounts = fromDb.categories.map(ca => {
			let twoYearsAgo = fromDb.twoYearsAgo.find(c => ca.categoryId == c.category.categoryId);
			let lastYear = fromDb.lastYear.find(c => ca.categoryId == c.category.categoryId);
			let thisYear = fromDb.thisYear.find(c => ca.categoryId == c.category.categoryId);
			let budget = this.state.selectedBudget!.budgetCategories!.find(bc => ca.categoryId == bc.category.categoryId)!;

			return {
				category: ca,
				twoYearsAgo: twoYearsAgo ? twoYearsAgo.totalAmount : 0,
				lastYear: lastYear ? lastYear.totalAmount : 0,
				thisYear: thisYear ? thisYear.totalAmount : 0,
				budget: budget ? budget.amount : 0, //Uncategorised won't match
				budgetCategory: budget
			}
		});
		categoryAmounts.sort((a, b) => a.thisYear - b.thisYear);

		if (!this.state.includeNoBudgetRows) {
			categoryAmounts = categoryAmounts.filter(c => c.budget);
		}

		//Only counting categories with a budget
		let overallBudget = 0;
		let overallAmount = 0;
		categoryAmounts.forEach(c => {
			if (c.budget) {
				overallBudget += c.budget;
				overallAmount += c.thisYear;
			}
		})

		return <div className="thin">
			<h1><EditableText value={budget.name} onChange={e => this.setSelectedBudgetName(e)} onConfirm={() => this.saveSelectedBudget()} /></h1>
			<Card elevation={Elevation.THREE}>
				Viewing 1 Jan - 31 June (6 months)
				<table className="pt-html-table" style={{ width: '100%' }}>
					<thead>
						<tr><th>Category</th><th>{fromDb.twoYearsAgoYear}</th><th>{fromDb.lastYearYear}</th><th>Budget</th><th>{fromDb.thisYearYear}</th><th>% (So Far)</th><th>% (Year)</th></tr>
					</thead>
					<tbody>
						{categoryAmounts.map(c => <tr key={c.category.categoryId} className={c.budget ? 'has-budget' : 'no-budget'}>
							<td>{c.category.name}</td>
							<td><MoneyAmount hideDecimals amount={c.twoYearsAgo} /></td>
							<td><MoneyAmount hideDecimals amount={c.lastYear} /></td>
							<th>{c.category.categoryId != UncategorisedCategory.categoryId && <><EditableText placeholder="Click to Set" value={c.budget == 0 ? '' : c.budget.toFixed(0)} onChange={v => this.updateBudgetAmount(c.category, v)} onConfirm={() => this.saveBudgetCategory(c.budgetCategory)} /></>}</th>
							<td><MoneyAmount hideDecimals amount={c.thisYear} /></td>
							<td>??%</td>
							{this.renderPercentCell(-c.thisYear / c.budget)}
						</tr>)}

						<tr className="overall">
							<td>Overall</td>
							<td></td>
							<td></td>
							<td><MoneyAmount hideDecimals amount={-overallBudget} /></td>
							<td><MoneyAmount hideDecimals amount={overallAmount} /></td>
							<td>??%</td>
							{this.renderPercentCell(-overallAmount / overallBudget)}
						</tr>							
					</tbody>
				</table>

			</Card>
		</div>
	}

	private renderPercentCell(percent: number) {
		if (isNaN(percent) || !isFinite(percent)) {
			return <td></td>
		}

		return <td className={'percent ' + (percent <= 1 ? 'on-budget' : 'over-budget')}>{(percent * 100).toFixed(0)}%</td>
	}
}