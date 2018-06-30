import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { HashRouter } from 'react-router-dom';

import "normalize.css";
import "@blueprintjs/core/lib/css/blueprint.css";
import "@blueprintjs/icons/lib/css/blueprint-icons.css";
import './index.css';

import App from './app';

ReactDOM.render(
	<HashRouter>
		<App />
	</HashRouter>,
	document.getElementById('app')
)