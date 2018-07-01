import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { HashRouter, Router } from 'react-router-dom';
import { container, Services } from '../services';
import { History } from 'history';

import "normalize.css/normalize.css";
import "@blueprintjs/core/lib/css/blueprint.css";
import "@blueprintjs/icons/lib/css/blueprint-icons.css";
import './index.css';

import App from './app';

const history = container.get<History>(Services.History);

ReactDOM.render(
	<Router history={history}>
		<App />
	</Router>,
	document.getElementById('app')
)