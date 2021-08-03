import React, { useEffect } from 'react';
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
import { transparentHeader, headerHeight } from '../config';
import CameraPreview from '../components/CameraPreview';

const DPChat = ({
  className, connected, loading, dispatchCreateScene, dispatchDisconnect, error, tosAccepted,
}) => {
  useEffect(() => {
    if (!connected) dispatchCreateScene();
    // cleanup function, disconnects on component dismount
    return () => dispatchDisconnect();
  }, []);

  const history = useHistory();
  useEffect(() => {
    if (error !== null) history.push('/loading?error=true');
  }, [error]);
  // if TOS hasn't been accepted, send to /
  if (tosAccepted === false) history.push('/');

  return (
    <div className={className}>
      <Header />
      <div className="video-overlay">
        <div className="container d-flex flex-column">
          {/* middle row */}
          <div className={loading || connected === false ? 'loading-container' : 'vertical-fit-container col-5'}>
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
            { connected ? <ContentCardDisplay /> : null}
          </div>
          {/* bottom row */}
          <div className="row">
            <div className="col text-center">
              <Captions />
            </div>
          </div>
          <div className="row">
            <div className="col">
              <Controls />
            </div>
            <div className="col-auto">
              <div className="camera-preview-zeroheight-wrapper">
                <CameraPreview />
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
  loading: PropTypes.bool.isRequired,
  error: PropTypes.shape({
    msg: PropTypes.string,
    err: PropTypes.objectOf(PropTypes.string),
  }),
  tosAccepted: PropTypes.bool.isRequired,
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
    height: ${transparentHeader ? '100vh' : `calc(100vh - ${headerHeight})`};
    ${transparentHeader ? 'padding' : 'margin'}-top: ${headerHeight};
    /* overflow: hidden; */

    .container {
      height: calc(100vh - ${headerHeight});
    }

    .vertical-fit-container {
      flex: 1 1 auto;
      overflow-y: scroll;

      display: flex;
      align-items: center;
      &::-webkit-scrollbar {
        display: none;
      }
    }
    .loading-container {
      flex: 1 1 auto;
      text-align: center;
    }

    .camera-preview-zeroheight-wrapper {
      position: absolute;
      bottom: .5rem;
      right: 1rem;
    }
  }
`;

const mapStateToProps = ({ sm }) => ({
  connected: sm.connected,
  loading: sm.loading,
  error: sm.error,
  tosAccepted: sm.tosAccepted,
});

const mapDispatchToProps = (dispatch) => ({
  dispatchCreateScene: () => dispatch(createScene()),
  dispatchDisconnect: () => dispatch(disconnect()),
});

export default connect(mapStateToProps, mapDispatchToProps)(StyledDPChat);
