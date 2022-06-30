import React from 'react';
import styled from 'styled-components';
import PropTypes from 'prop-types';
import {
  ArrowRightCircleFill,
  CameraVideo,
  CheckSquare,
  GraphUp,
  FileEarmarkMedical,
} from 'react-bootstrap-icons';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';
import Header from '../components/Header';
import { headerHeight, landingBackgroundImage, landingBackgroundColor } from '../config';
import { setTOS } from '../store/sm/index';
import eula from '../eula';

function Landing({ className, dispatchAcceptTOS }) {
  return (
    <div className={className}>
      <div className="landing-wrapper">
        <Header />
        <div className="container landing-container d-flex align-items-center">
          <div className="row">
            <div className="col">
              <div className="row">
                <div>
                  <h1 className="fw-bold">
                    Meet Digital Person A.
                  </h1>
                </div>
              </div>
              <div className="row">
                <div>
                  <h3>
                    Aliquam dapibus malesuada dignissim. Aliquam eu tortor
                    eu arcu tincidunt vulputate.
                  </h3>
                </div>
              </div>
              <div className="row">
                <div>
                  <div className="form-check form-switch">
                    <label className="form-check-label" htmlFor="micPermSwitch">
                      <span>Use your microphone so I can hear you.</span>
                      <input className="form-check-input" type="checkbox" role="switch" id="micPermSwitch" />
                    </label>
                  </div>
                </div>
              </div>
              <div className="row">
                <div>
                  <div className="form-check form-switch">
                    <label className="form-check-label" htmlFor="camPermSwitch">
                      <span>Use your camera so we can chat face-to-face.</span>
                      <input className="form-check-input" type="checkbox" role="switch" id="camPermSwitch" />
                    </label>
                  </div>
                </div>
              </div>
              <div className="row">
                <div>
                  <button className="btn btn-primary" type="button">
                    Chat with Digital Person A
                  </button>
                </div>
              </div>
              <div className="row">
                <div>
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                  Sed volutpat eu nulla ac suscipit. Sed vel rhoncus neque, et sollicitudin sem.
                  Suspendisse eget enim arcu. Morbi lacinia tempus tempus. Integer eget justo velit.
                  {' '}
                  <a href="https://example.com">
                    www.linkgoeshere.com
                  </a>
                  .
                </div>
              </div>
            </div>
            <div className="col" />
          </div>
        </div>
      </div>
    </div>
  );
}

Landing.propTypes = {
  className: PropTypes.string.isRequired,
  dispatchAcceptTOS: PropTypes.func.isRequired,
};

const StyledLanding = styled(Landing)`
  .landing-wrapper {
    background: ${landingBackgroundImage ? `url(${landingBackgroundImage})` : ''} ${landingBackgroundColor ? `${landingBackgroundColor};` : ''};
    background-size: auto 60%;
    background-repeat: no-repeat;
    background-position: right bottom;
  }
  .landing-container {
    min-height: calc(100vh - ${headerHeight});
    .row {
      margin-bottom: 1rem;
    }
  }
  label>span {
    font-size: 1.2rem;
    position: relative;
    top: 0.2rem;
  }
  .form-check-input {
    margin-right: 0.5rem;
    height: 2rem;
    width: calc(4rem);
    border-radius: 5rem;
  }
`;
const mapDispatchToProps = (dispatch) => ({
  dispatchAcceptTOS: (accepted) => dispatch(setTOS({ accepted })),
});

export default connect(null, mapDispatchToProps)(StyledLanding);
