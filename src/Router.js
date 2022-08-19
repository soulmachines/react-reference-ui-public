import ReactGA from 'react-ga';
import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import {
  BrowserRouter as Router,
  Switch,
  Route,
  withRouter,
} from 'react-router-dom';
import DPChat from './routes/DPChat';
import Landing from './routes/Landing';
import Loading from './routes/Loading';
import Feedback from './routes/Feedback';

// only init google analytics if a tracking ID is defined in env
const { REACT_APP_GA_TRACKING_ID } = process.env;
if (REACT_APP_GA_TRACKING_ID) ReactGA.initialize(REACT_APP_GA_TRACKING_ID);

// make GA aware of what pages people navigate to in react router
const LinkGAtoRouter = withRouter(({ history }) => {
  history.listen((location) => {
    ReactGA.set({ page: location.pathname });
    ReactGA.pageview(location.pathname);
  });
  return <div />;
});

function App() {
  return (
    <Router>
      <Switch>
        <Route path="/loading">
          <Loading />
        </Route>
        <Route path="/video">
          <DPChat />
        </Route>
        <Route path="/feedback">
          <Feedback />
        </Route>
        {/* / goes at the bottom */}
        <Route path="/">
          <Landing />
        </Route>
      </Switch>
      <LinkGAtoRouter />
    </Router>
  );
}

export default App;
