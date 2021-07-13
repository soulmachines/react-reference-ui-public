import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import ReactTooltip from 'react-tooltip';
import {
  BrowserRouter as Router,
  Switch,
  Route,
} from 'react-router-dom';
import Diagnostic from './routes/Diagnostic';

const App = () => (
  <Router>
    <Switch>
      <Route path="/">
        <Diagnostic />
      </Route>
    </Switch>
    <ReactTooltip />
  </Router>
);

export default App;
