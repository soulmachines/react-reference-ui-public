import React, { useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import * as actions from './store/sm';

const App = ({ initScene }) => {
  useEffect(() => {
    initScene();
  });
  return (
    <div className="container">
      app
    </div>
  );
};

App.propTypes = {
  initScene: PropTypes.func.isRequired,
};

const mapDispatchToProps = (dispatch) => ({
  initScene: () => dispatch(actions.createScene()),
});

export default connect(null, mapDispatchToProps)(App);
