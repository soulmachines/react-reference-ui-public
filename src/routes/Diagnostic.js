import React from 'react';
import styled from 'styled-components';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import PersonaVideo from '../components/PersonaVideo';
import Captions from '../components/Captions';
import Controls from '../components/Controls';
import {
  disconnect,
} from '../store/sm/index';

const Diagnostic = ({ className, dispatchDisconnect }) => (
  <div className={className}>
    <div className="video-overlay">
      <div className="container d-flex flex-column justify-content-between">
        {/* top row */}
        <div className="d-flex justify-content-end mt-3">
          <button type="button" className="btn btn-outline-danger" onClick={dispatchDisconnect} data-tip="Disconnect">Disconnect</button>
        </div>
        {/* middle row */}
        <div />
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
    <PersonaVideo />
  </div>
);

Diagnostic.propTypes = {
  className: PropTypes.string.isRequired,
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

const mapStateToProps = (state) => ({

});

const mapDispatchToProps = (dispatch) => ({
  dispatchDisconnect: () => dispatch(disconnect()),
});

export default connect(mapStateToProps, mapDispatchToProps)(StyledDiagnostic);
