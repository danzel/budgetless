import * as React from 'react';
import { hot } from 'react-hot-loader';

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
			<div>
				<nav className="pt-navbar pt-dark">
					<div className="pt-navbar-group pt-align-left">
						<div className="pt-navbar-heading">budgetless</div>
						<input className="pt-input" placeholder="Search something..." type="text" />
					</div>
					<div className="pt-navbar-group pt-align-right">
						<button className="pt-button pt-minimal pt-icon-home">Home</button>
						<button className="pt-button pt-minimal pt-icon-import">Import</button>
						<span className="pt-navbar-divider"></span>
						<button className="pt-button pt-minimal pt-icon-cog"></button>
					</div>
				</nav>
			</div>);
	}
}

export default hot(module)(App)