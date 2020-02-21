import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import { setupConfig } from '@ionic/react';
import * as serviceWorker from './serviceWorker';

setupConfig({
    swipeBackEnabled: false,
});

ReactDOM.render(<App />, document.getElementById('root'));
