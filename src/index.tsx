import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { AppContainer } from 'react-hot-loader';

import './services';

const render = () => {
  // NB: We have to re-require MyApp every time or else this won't work
  // We also need to wrap our app in the AppContainer class
  const MyApp = require('./appWrap').AppWrap;
  ReactDOM.render(<AppContainer><MyApp/></AppContainer>, document.getElementById('app'));
}

render();
if ((module as any).hot) { (module as any).hot.accept(render); }