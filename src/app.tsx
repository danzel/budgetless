import * as React from 'react';
import { hot } from 'react-hot-loader';
import { Route, Switch, Link } from 'react-router-dom';

import { Import } from './import';
import { Popover, Position, Menu, MenuItem } from '@blueprintjs/core';
import { lazyInject, Services, History } from './services';
import { ManageAccounts } from './manageAccounts';
import { ManageCategories } from './manageCategories';

interface State {
}

class App extends React.Component<{}, State>{

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
			</Menu>
		);

		return (
			<div className='full-height'>
				<nav className="pt-navbar pt-dark">
					<div className="pt-navbar-group pt-align-left">
						<div className="pt-navbar-heading">budgetless</div>
						<input className="pt-input" placeholder="Search something..." type="text" />
					</div>
					<div className="pt-navbar-group pt-align-right">
						<Link role="button" to='/' className="pt-button pt-minimal pt-icon-home">Home</Link>
						<Link role="button" to='/import' className="pt-button pt-minimal pt-icon-import">Import</Link>
						<span className="pt-navbar-divider"></span>
						<Popover content={cogMenu} position={Position.BOTTOM_RIGHT}>
							<button className="pt-button pt-minimal pt-icon-cog"></button>
						</Popover>
					</div>
				</nav>
				<Switch>
					<Route path='/import' component={Import} />
					<Route path='/manage-accounts' component={ManageAccounts} />
					<Route path='/manage-categories' component={ManageCategories} />
				</Switch>
			</div>);
	}
}

export default hot(module)(App)