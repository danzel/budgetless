import * as React from 'react';
import { hot } from 'react-hot-loader';
import { Button } from '@blueprintjs/core';

interface State {
    time: number;
}

class App extends React.Component<{}, State>{

    constructor(props: {}) {
        super(props);

        this.state = {
            time: Date.now()
        }
    }

    render() {
        return <div><Button text="hi"/> App3 {this.state.time}</div>
    }
}

export default hot(module)(App)