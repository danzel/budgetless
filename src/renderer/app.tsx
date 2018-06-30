import * as React from 'react';
import { hot } from 'react-hot-loader';
import { Route, Switch, Link } from 'react-router-dom';

import { Import } from './import';

interface State {
}

class App extends React.Component<{}, State>{
	constructor(props: {}) {
		super(props);

		this.state = {
		}
	}

	render() {
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
						<button className="pt-button pt-minimal pt-icon-cog"></button>
					</div>
				</nav>
				<Switch>
					<Route path='/import' component={Import} />
				</Switch>
			</div>);
	}
}

export default hot(module)(App)