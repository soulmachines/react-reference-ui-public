import React, { useEffect } from 'react';
import styled from 'styled-components';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import PersonaVideo from '../components/PersonaVideo';
import Captions from '../components/Captions';
import Controls from '../components/Controls';
import {
  disconnect,
  createScene,
} from '../store/sm/index';

const Diagnostic = ({
  className, dispatchDisconnect, connected, loading, dispatchCreateScene,
}) => {
  useEffect(() => dispatchCreateScene(), []);
  return (
    <div className={className}>
      <div className="video-overlay">
        <div className="container d-flex flex-column justify-content-between">
          {/* top row */}
          <div className="d-flex justify-content-end mt-3">
            <button type="button" disabled={!connected} className={`btn btn-outline-danger ${connected && !loading ? '' : 'd-none'}`} onClick={dispatchDisconnect} data-tip="Disconnect">Disconnect</button>
          </div>
          {/* middle row */}
          <div className="text-center">
            {
            loading
              ? (
                // loading spinner
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
              )
              // connect button
              : <button type="button" className={`btn btn-outline-success ${!connected && !loading ? '' : 'd-none'}`} onClick={dispatchCreateScene} data-tip="Connect">Connect</button>
          }
          </div>
          {/* bottom row */}
          <div>
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

Diagnostic.propTypes = {
  className: PropTypes.string.isRequired,
  dispatchDisconnect: PropTypes.func.isRequired,
  dispatchCreateScene: PropTypes.func.isRequired,
  connected: PropTypes.bool.isRequired,
  loading: PropTypes.bool.isRequired,
};

const StyledDiagnostic = styled(Diagnostic)`
  .video-overlay {
    position: absolute;
    top: 0;
    right: 0;
    left: 0;
    z-index: 10;

    width: 100%;
    height: 100%;

    .container {
      height: 100%;
    }
  }
`;

const mapStateToProps = ({ sm }) => ({
  connected: sm.connected,
  loading: sm.loading,
});

const mapDispatchToProps = (dispatch) => ({
  dispatchDisconnect: () => dispatch(disconnect()),
  dispatchCreateScene: () => dispatch(createScene()),
});

export default connect(mapStateToProps, mapDispatchToProps)(StyledDiagnostic);
