import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import {
  BrowserRouter as Router,
  Switch,
  Route,
} from 'react-router-dom';
import Diagnostic from './routes/Diagnostic';
import Landing from './routes/Landing';
import Loading from './routes/Loading';

const App = () => (
  <Router>
    <Switch>
      <Route path="/loading">
        <Loading />
      </Route>
      <Route path="/video">
        <Diagnostic />
      </Route>
      {/* / goes at the bottom */}
      <Route path="/">
        <Landing />
      </Route>
    </Switch>
  </Router>
);

export default App;
