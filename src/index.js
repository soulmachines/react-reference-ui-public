import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import ReactGA from 'react-ga';
import ReactTooltip from 'react-tooltip';
import { withRouter } from 'react-router-dom';
import Router from './Router';
import store from './store';
import reportWebVitals from './reportWebVitals';
import GlobalStyle from './globalStyle';

const { REACT_APP_GA_TRACKING_ID } = process.env;

let bindGAtoRouter = null;

// only init google analytics if a tracking ID is defined in env
if (REACT_APP_GA_TRACKING_ID) {
  // init GA tracking
  ReactGA.initialize(REACT_APP_GA_TRACKING_ID);
  // make GA aware of what pages people navigate to in react router
  bindGAtoRouter = withRouter(({ history }) => {
    history.listen((location) => {
      ReactGA.set({ page: location.pathname });
      ReactGA.pageview(location.pathname);
    });
    return <div />;
  });
}

ReactDOM.render(
  <React.StrictMode>
    <Provider store={store}>
      <Router />
    </Provider>
    <GlobalStyle />
    {/* globally enable react tooltips */}
    <ReactTooltip />
    {/* will be null if GA tracking is not enabled */}
    {bindGAtoRouter}
  </React.StrictMode>,
  document.getElementById('root'),
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
