import * as React from 'react';
import { Route, Switch, Link } from 'react-router-dom';

import { Import } from './import';
import { Popover, Position, Menu, MenuItem, Navbar, NavbarGroup, Alignment } from '@blueprintjs/core';
import { lazyInject, Services, History } from './services';

import { BankTransactionsList } from './bankTransactionsList';
import { Budgets } from './budgets';
import { Home } from './home';
import { ManageAccounts } from './manageAccounts';
import { ManageCategories } from './manageCategories';
import { ManageRules } from './manageRules';
import { Reports } from './reports';

interface State {
}

export class App extends React.Component<{}, State>{

	@lazyInject(Services.History)
	history!: History;

	constructor(props: {}) {
		super(props);

		this.state = {
		}
	}

	render() {

		const cogMenu = (
			<Menu>
				<MenuItem text="Accounts" onClick={() => this.history.push('/manage-accounts')} />
				<MenuItem text="Categories" onClick={() => this.history.push('/manage-categories')} />
				<MenuItem text="Rules" onClick={() => this.history.push('/manage-rules')} />
			</Menu>
		);

		return (
			<div className='full-height'>
				<Navbar className="pt-dark">
					<NavbarGroup align={Alignment.LEFT}>
						<div className="pt-navbar-heading">budgetless</div>
					</NavbarGroup>
					<NavbarGroup align={Alignment.RIGHT}>
						<Link role="button" to='/' className="pt-button pt-minimal pt-icon-home">Home</Link>
						<Link role="button" to='/reports' className="pt-button pt-minimal pt-icon-chart">Reports</Link>
						<Link role="button" to='/transactions-list' className="pt-button pt-minimal pt-icon-list">Transactions</Link>
						<Link role="button" to='/budgets' className="pt-button pt-minimal pt-icon-comparison">Budget</Link>
						<Link role="button" to='/import' className="pt-button pt-minimal pt-icon-import">Import</Link>
						<span className="pt-navbar-divider"></span>
						<Popover content={cogMenu} position={Position.BOTTOM_RIGHT}>
							<button className="pt-button pt-minimal pt-icon-cog"></button>
						</Popover>
						</NavbarGroup>
				</Navbar>
				<Switch>
					<Route path='/budgets' component={Budgets} />
					<Route path='/import' component={Import} />
					<Route path='/manage-accounts' component={ManageAccounts} />
					<Route path='/manage-categories' component={ManageCategories} />
					<Route path='/manage-rules' component={ManageRules} />
					<Route path='/reports' component={Reports} />
					<Route path='/transactions-list' component={BankTransactionsList} />

					<Route path='/' component={Home} />
				</Switch>
			</div>);
	}
}