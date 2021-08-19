import React from 'react';
import styled from 'styled-components';
import PropTypes from 'prop-types';
import {
  ArrowRightCircleFill,
  CameraVideo, CheckSquare, GraphUp,
} from 'react-bootstrap-icons';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';
import Header from '../components/Header';
import { headerHeight, landingBackground } from '../config';
import { setTOS } from '../store/sm/index';

const Landing = ({ className, dispatchAcceptTOS }) => (
  <div className={className}>
    <div className="landing-wrapper">
      <Header />
      <div className="container landing-container">
        <div className="card col-lg-6 p-3">
          <div className="card-body">
            <h2 className="header-with-bottom-border">
              <CheckSquare />
              {' '}
              First things first
            </h2>

            <b>Before we get started:</b>
            <div className="mb-3">
              <div className="mx-4">
                <i className="bi bi-camera-video" />
                <CameraVideo />
                {' '}
                My camera and microphone will be used
              </div>
              <div className="mx-4">
                <GraphUp />
                {' '}
                Anonymized usage data will be captured
              </div>
            </div>

            <h4 className="header-with-bottom-border">
              What information are we collecting?
            </h4>
            <p>
              We will be collecting information about your facial features, expressions
              and voice characteristics when you are interacting with the Digital Human.
              If you want to find out more information and how we collect and use your
              information please see our Privacy Policy, found here:
              {' '}
              <a href="https://www.soulmachines.com/privacy-policy/" target="_blank" rel="noreferrer">https://www.soulmachines.com/privacy-policy/</a>
              .
            </p>
            <p>
              If you are happy to proceed on this basis, please confirm your acceptance.
            </p>
          </div>
          <Link to="loading" className="btn btn-success btn-lg action-btn" onClick={() => dispatchAcceptTOS(true)}>
            I accept Privacy Notice and EULA
            {' '}
            <ArrowRightCircleFill />
          </Link>
        </div>
      </div>
    </div>
  </div>
);

Landing.propTypes = {
  className: PropTypes.string.isRequired,
  dispatchAcceptTOS: PropTypes.func.isRequired,
};

const StyledLanding = styled(Landing)`
  .link-button {
    background: none;
    border: none;
    text-decoration: underline;
    padding: 0;
  }
  .header-with-bottom-border {
    border-bottom: 1px solid rgba(0,0,0,0.2);
    padding-bottom: 0.6rem;
  }
  .landing-wrapper {
    min-height: calc(100vh);

    background-image: url(${landingBackground});
    background-color: rgb(247, 232, 219);
    background-size: contain;
    background-repeat: no-repeat;
    background-position: center bottom;

    .landing-container {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: calc(100vh - ${headerHeight});

      .action-btn {
        font-size: 1.8rem;
      }
    }
  }
`;
const mapDispatchToProps = (dispatch) => ({
  dispatchAcceptTOS: (accepted) => dispatch(setTOS({ accepted })),
});

export default connect(null, mapDispatchToProps)(StyledLanding);
