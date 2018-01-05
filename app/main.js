import React from 'react';
import { render } from 'react-dom';

import App from './App';

// ReactDOM.render(<App />, document.getElementById('root'));
/*
import getMuiTheme from 'material-ui/styles/getMuiTheme';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import {green100, green500, green700} from 'material-ui/styles/colors';

const muiTheme = getMuiTheme({
  palette: {
    primary1Color: green500,
    primary2Color: green700,
    primary3Color: green100,
  },
}, {
  avatar: {
    borderColor: null,
  },
  userAgent: req.headers['user-agent'],
});

const Main = () => (
  <MuiThemeProvider muiTheme={muiTheme}>
    <div>Hello world</div>
  </MuiThemeProvider>
);

export default Main;
*/


// import Button from 'material-ui/Button';

render(<App />, document.querySelector('#root'));
