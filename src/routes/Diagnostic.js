import React, { useEffect } from 'react';
import styled from 'styled-components';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import PersonaVideo from '../components/PersonaVideo';
import Captions from '../components/Captions';
import Controls from '../components/Controls';
import ContentCardDisplay from '../components/ContentCardDisplay';
import {
  createScene,
} from '../store/sm/index';
import Header from '../components/Header';
import { transparentHeader, headerHeight } from '../config';

const Diagnostic = ({
  className, connected, loading, dispatchCreateScene,
}) => {
  useEffect(() => { if (!connected) dispatchCreateScene(); }, []);
  return (
    <div className={className}>
      <Header />
      <div className="video-overlay">
        <div className="container d-flex flex-column justify-content-between">
          {/* top row */}
          <div className="d-flex justify-content-end mt-3" />
          {/* middle row */}
          <div className={loading || connected === false ? 'text-center' : ''}>
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
    height: ${transparentHeader ? '100%' : `calc(100vh - ${headerHeight})`};
    margin-top: ${transparentHeader ? 'none' : headerHeight};

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
  dispatchCreateScene: () => dispatch(createScene()),
});

export default connect(mapStateToProps, mapDispatchToProps)(StyledDiagnostic);
