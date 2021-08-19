import React, { createRef, useEffect, useState } from 'react';
import styled from 'styled-components';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { useHistory } from 'react-router-dom';
import PersonaVideo from '../components/PersonaVideo';
import Captions from '../components/Captions';
import Controls from '../components/Controls';
import ContentCardDisplay from '../components/ContentCardDisplay';
import {
  createScene, disconnect,
} from '../store/sm/index';
import Header from '../components/Header';
import {
  headerHeight, disconnectPage, disconnectRoute,
} from '../config';
import CameraPreview from '../components/CameraPreview';
import breakpoints from '../utils/breakpoints';

const DPChat = ({
  className,
  connected,
  disconnected,
  loading,
  dispatchCreateScene,
  dispatchDisconnect,
  error,
  tosAccepted,
  cameraOn,
}) => {
  const overlayRef = createRef();
  const [height, setHeight] = useState('100vh');
  const [largeViewport, setLargeViewport] = useState(false);

  const handleResize = () => {
    setHeight(window.innerHeight);
    if (window.innerWidth >= breakpoints.md) setLargeViewport(true);
    else setLargeViewport(false);
  };

  useEffect(() => {
    if (!connected) dispatchCreateScene();
    handleResize();
    window.addEventListener('resize', handleResize);
    // cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      dispatchDisconnect();
    };
  }, []);

  const history = useHistory();
  useEffect(() => {
    if (error !== null) history.push('/loading?error=true');
  }, [error]);
  // if TOS hasn't been accepted, send to /
  if (tosAccepted === false && disconnected === false) history.push('/');
  if (disconnected === true) {
    if (disconnectPage) {
      history.push(disconnectRoute);
    } else history.push('/');
  }

  return (
    <div className={className}>
      <div className="video-overlay" ref={overlayRef} style={{ height }}>
        <Header />
        {/* top tow */}
        <div className="container d-flex flex-column">
          {
              cameraOn
                ? (
                  <div className="row d-flex justify-content-end">
                    <div className="col-auto">
                      <div className="camera-preview">
                        <CameraPreview />
                      </div>
                    </div>
                  </div>
                )
                : <div />
            }
          {/* middle row */}
          <div className="vertical-fit-container col-md-5">
            {
            loading && connected === false
              ? (
                // loading spinner
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
              )
              // connect button
              : <button type="button" className={`btn btn-outline-success ${!connected && !loading ? '' : 'd-none'}`} onClick={dispatchCreateScene} data-tip="Connect">Connect</button>
            }
            {/* on larger devices, show cards next to DP */}
            <div className="d-md-block d-none">
              {largeViewport === true ? <ContentCardDisplay /> : null}
            </div>
          </div>
          {/* bottom row */}
          <div>
            {/* on smaller devices, show the cards over the DP, centered */}
            <div className="row">
              <div className="d-block d-md-none">
                {largeViewport === false ? <ContentCardDisplay /> : null}
              </div>
            </div>
            <div className="row">
              <div className="col text-center">
                <Captions />
              </div>
            </div>
            <div className="row">
              <div className="col">
                <Controls />
              </div>
            </div>
          </div>
        </div>
      </div>
      {
      connected ? <PersonaVideo /> : null
    }
    </div>
  );
};

DPChat.propTypes = {
  className: PropTypes.string.isRequired,
  dispatchCreateScene: PropTypes.func.isRequired,
  dispatchDisconnect: PropTypes.func.isRequired,
  connected: PropTypes.bool.isRequired,
  disconnected: PropTypes.bool.isRequired,
  loading: PropTypes.bool.isRequired,
  error: PropTypes.shape({
    msg: PropTypes.string,
    err: PropTypes.objectOf(PropTypes.string),
  }),
  tosAccepted: PropTypes.bool.isRequired,
  cameraOn: PropTypes.bool.isRequired,
};

DPChat.defaultProps = {
  error: null,
};

const StyledDPChat = styled(DPChat)`
  .video-overlay {
    position: absolute;
    top: 0;
    right: 0;
    left: 0;
    z-index: 10;

    width: 100%;

    .container {
      height: calc(100% - ${headerHeight});
    }

    .vertical-fit-container {
      flex: 1 1 auto;
      overflow-y: scroll;

      scrollbar-width: none; /* Firefox 64 */
      &::-webkit-scrollbar {
        display: none;
      }

      @media (min-width: ${breakpoints.md}px) {
        display: flex;
        align-items: center;
      }
    }
    .loading-container {
      flex: 1 1 auto;
      text-align: center;
    }

  }
`;

const mapStateToProps = ({ sm }) => ({
  connected: sm.connected,
  disconnected: sm.disconnected,
  loading: sm.loading,
  error: sm.error,
  tosAccepted: sm.tosAccepted,
  cameraOn: sm.cameraOn,
});

const mapDispatchToProps = (dispatch) => ({
  dispatchCreateScene: () => dispatch(createScene()),
  dispatchDisconnect: () => dispatch(disconnect()),
});

export default connect(mapStateToProps, mapDispatchToProps)(StyledDPChat);
