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

const Landing = ({ className, dispatchAcceptTOS }) => (
  <div className={className}>
    <div className="landing-wrapper">
      <Header />
      <div className="container landing-container">
        <div className="card col-lg-6 p-3 mb-2">
          <div className="card-body">
            <h2 className="header-with-bottom-border">
              <CheckSquare />
              {' '}
              First things first
            </h2>

            <h5>Before we get started:</h5>
            <div className="mb-3">
              <div className="mx-4 mt-2">
                <FileEarmarkMedical />
                {' '}
                <a href="https://www.soulmachines.com/privacy-policy/" target="_blank" rel="noreferrer">Privacy Policy</a>
              </div>
              {/* EULA modal */}
              <div className="modal fade" id="exampleModal" tabIndex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true">
                <div className="modal-dialog modal-xl">
                  <div className="modal-content">
                    <div className="modal-header">
                      <h5 className="modal-title" id="exampleModalLabel">End User License Agreement</h5>
                      <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close" />
                    </div>
                    <div className="modal-body">
                      {eula}
                    </div>
                  </div>
                </div>
              </div>
              <div className="mx-4">
                <FileEarmarkMedical />
                {' '}
                <button type="button" className="link-primary link-button" href="#" data-bs-toggle="modal" data-bs-target="#exampleModal">
                  EULA
                </button>
              </div>
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

    background: ${landingBackgroundImage ? `url(${landingBackgroundImage})` : ''} ${landingBackgroundColor ? `${landingBackgroundColor};` : ''};
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
