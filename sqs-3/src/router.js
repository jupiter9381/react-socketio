import React, { Component } from 'react';
import {
  BrowserRouter,
  Route,
} from 'react-router-dom'
import { lightBlue900, lightBlue700, amber500 } from 'material-ui/styles/colors';
import getMuiTheme from 'material-ui/styles/getMuiTheme';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';


import KeypadList from './keypad/KeypadList';
import Keypad from './keypad/Keypad';
import Display from './display/Display.js';
import Home from './home/Home.js';
import Admin from './admin/Admin.js';
import * as commonHistory from './common/history.js';

const muiTheme = getMuiTheme({
  palette: {
    primary1Color: lightBlue900,
    primary2Color: lightBlue700,
    accent1Color: amber500,
    pickerHeaderColor: lightBlue900,
  },
});


function InitHistory({ history }) {
  if (!commonHistory.isInited()) commonHistory.init(history);

  return null;
}

class Router extends Component
{render()
  {  return (
      <MuiThemeProvider muiTheme={muiTheme}>
        <BrowserRouter>
          <div>
            <Route path="/"
                   render={(props) => <InitHistory {...props} />}
            />
            <Route path="/home" component={Home} />
            <Route path="/keypadlist" component={KeypadList} />
            
            <Route path="/display" component={Display} />
            <Route path={`/keypad/:padId`} component={Keypad} />
            <Route path="/admin" component = {Admin} />
            {/*<Route path="/adminPanel" component={AdminPanel} />*/}
          </div>
        </BrowserRouter>
      </MuiThemeProvider>
    );}}

export default Router


// WEBPACK FOOTER //
// client/router.js
