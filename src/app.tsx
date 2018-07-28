import * as React from 'react';
import { Route, Switch, Link } from 'react-router-dom';

import { BuxferImport } from './buxferImport';
import { Import } from './import';
import { Popover, Position, Menu, MenuItem, Navbar, NavbarGroup, Alignment } from '@blueprintjs/core';
import { lazyInject, Services, History } from './services';
import { BankTransactionsList } from './bankTransactionsList';
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
				<MenuItem text="Tools">
					<MenuItem text="Import from Buxfer" onClick={() => this.history.push('/buxfer-import')} />
				</MenuItem>
			</Menu>
		);

		return (
			<div className='full-height'>
				<Navbar className="pt-dark">
					<NavbarGroup align={Alignment.LEFT}>
						<div className="pt-navbar-heading">budgetless</div>
						<input className="pt-input" placeholder="Search something..." type="text" />
					</NavbarGroup>
					<NavbarGroup align={Alignment.RIGHT}>
						<Link role="button" to='/' className="pt-button pt-minimal pt-icon-home">Home</Link>
						<Link role="button" to='/reports' className="pt-button pt-minimal pt-icon-chart">Reports</Link>
						<Link role="button" to='/transactions-list' className="pt-button pt-minimal pt-icon-list">Transactions</Link>
						<Link role="button" to='/import' className="pt-button pt-minimal pt-icon-import">Import</Link>
						<span className="pt-navbar-divider"></span>
						<Popover content={cogMenu} position={Position.BOTTOM_RIGHT}>
							<button className="pt-button pt-minimal pt-icon-cog"></button>
						</Popover>
						</NavbarGroup>
				</Navbar>
				<Switch>
					<Route path='/buxfer-import' component={BuxferImport} />
					<Route path='/import' component={Import} />
					<Route path='/manage-accounts' component={ManageAccounts} />
					<Route path='/manage-categories' component={ManageCategories} />
					<Route path='/manage-rules' component={ManageRules} />
					<Route path='/reports' component={Reports} />
					<Route path='/transactions-list' component={BankTransactionsList} />
				</Switch>
			</div>);
	}
}