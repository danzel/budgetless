import * as React from 'react';
import { HashRouter } from 'react-router-dom';

import App from './app';

export class AppWrap extends React.Component<{}, {}> {
	render() {
		return <HashRouter><App /></HashRouter>
	}
}