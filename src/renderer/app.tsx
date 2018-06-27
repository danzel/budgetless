import * as React from 'react';
import { hot } from 'react-hot-loader';

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
        return <div> App2 {this.state.time}</div>
    }
}

export default hot(module)(App)