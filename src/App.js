import React, { useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import * as actions from './store/sm';
import proxyVideo from './proxyVideo';

const App = ({
  initScene, loading, connected, width, height,
}) => {
  const videoRef = React.createRef();

  // when the component mounts, establish connection w/ Persona server, display video etc etc
  useEffect(() => {
    initScene();
  }, []);

  useEffect(() => {
    if (connected) videoRef.current.srcObject = proxyVideo.srcObject;
  });

  return (
    <div>
      {
        connected
          // eslint-disable-next-line jsx-a11y/media-has-caption
          ? <video ref={videoRef} autoPlay playsInline className="personavideo" id="personavideo" width={width} height={height} />
          : null
      }
      {
        loading ? 'loading' : null
      }

    </div>
  );
};

App.propTypes = {
  initScene: PropTypes.func.isRequired,
  loading: PropTypes.bool.isRequired,
  connected: PropTypes.bool.isRequired,
  width: PropTypes.number,
  height: PropTypes.number,
};

App.defaultProps = {
  // chosen pretty arbitrarily, since the values should get overwritten
  // immediately w/ window dimensions
  width: 1366,
  height: 768,
};

const mapStateToProps = (state) => ({
  loading: state.sm.loading,
  connected: state.sm.connected,
  width: state.sm.videoWidth,
  height: state.sm.videoHeight,
});

const mapDispatchToProps = (dispatch) => ({
  initScene: () => dispatch(actions.createScene()),
});

export default connect(mapStateToProps, mapDispatchToProps)(App);
