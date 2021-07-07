/* eslint-disable jsx-a11y/media-has-caption */
import React, { useEffect, useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import * as actions from './store/sm';
import proxyVideo from './proxyVideo';

const App = ({
  initScene, loading, connected, setVideoDimensions, className,
}) => {
  // video elem ref used to link proxy video element to displayed video
  const videoRef = React.createRef();
  // we need the container dimensions to render the right size video in the persona server
  const containerRef = React.createRef();
  // only set the video ref once, otherwise we get a flickering whenever the window is resized
  const [videoDisplayed, setVideoDisplayed] = useState(false);

  const handleResize = () => {
    if (containerRef.current) {
      // the video should resize with the element size.
      // this needs to be done through the redux store because the Persona server
      // needs to be aware of the video target dimensions to render a propperly sized video
      const videoWidth = containerRef.current.clientWidth;
      const videoHeight = containerRef.current.clientHeight;
      setVideoDimensions(videoWidth, videoHeight);
    }
  };

  // when the component mounts, establish connection w/ Persona server, display video etc etc
  useEffect(() => {
    initScene();
  }, []);
  // persona video feed is routed through a proxy <video> tag,
  // we need to get the src data from that element to use here
  useEffect(() => {
    if (connected) {
      if (!videoDisplayed) {
        videoRef.current.srcObject = proxyVideo.srcObject;
        setVideoDisplayed(true);
      }
      handleResize();
      window.addEventListener('resize', handleResize);
    }
  });

  return (
    <div ref={containerRef} className={className}>
      {
        connected
          ? (
            // we display captions as an overlay. this functionality is critical and
            // should not be removed in derrivative custom UI's!!
            <video ref={videoRef} autoPlay playsInline className="fill-parent" id="personavideo" />
          )
          : null
      }
      {
        loading
          ? (
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          )
          : null
      }

    </div>
  );
};

App.propTypes = {
  initScene: PropTypes.func.isRequired,
  setVideoDimensions: PropTypes.func.isRequired,
  loading: PropTypes.bool.isRequired,
  connected: PropTypes.bool.isRequired,
  className: PropTypes.string.isRequired,
};

const StyledApp = styled(App)`
  /* if you need the persona video to be different than the window dimensions, change these values */
  width: 100vw;
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  .fill-parent {
    /* the video element will conform to the container dimensions, so keep this as it is */
    width: 100%;
    height: 100%;
  }
`;

const mapStateToProps = (state) => ({
  loading: state.sm.loading,
  connected: state.sm.connected,
  width: state.sm.videoWidth,
  height: state.sm.videoHeight,
});

const mapDispatchToProps = (dispatch) => ({
  initScene: () => dispatch(actions.createScene()),
  setVideoDimensions: (videoWidth, videoHeight) => dispatch(
    actions.setVideoDimensions({ videoWidth, videoHeight }),
  ),
});

export default connect(mapStateToProps, mapDispatchToProps)(StyledApp);
