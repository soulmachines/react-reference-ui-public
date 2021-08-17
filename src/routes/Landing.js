import React from 'react';
import styled from 'styled-components';
import PropTypes from 'prop-types';
import {
  ArrowRightCircleFill,
  CameraVideo, CheckSquare, FileEarmarkMedical, GraphUp,
} from 'react-bootstrap-icons';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';
import Header from '../components/Header';
import { headerHeight, landingBackground } from '../config';
import { setTOS } from '../store/sm/index';
import eula from '../eula';

const Landing = ({ className, dispatchAcceptTOS }) => (
  <div className={className}>
    <Header />
    <div className="landing-wrapper">
      <div className="container">
        <div className="card col-lg-8 p-3">
          <div className="card-body">
            <h2 className="first-things-first">
              <CheckSquare />
              {' '}
              First things first
            </h2>

            <b>Before we get started:</b>
            <br />
            By proceeding you acknowledge and accept the following terms:

            <div className="mb-4">
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
            <strong>Frequently Asked Questions:</strong>

            <div className="accordion accordion-flush" id="tocAccordion">
              <div className="accordion-item">
                <h2 className="accordion-header" id="flush-headingOne">
                  <button className="accordion-button" type="button" data-bs-toggle="collapse" data-bs-target="#flush-collapseOne" aria-expanded="true" aria-controls="flush-collapseOne">
                    Who is running this system?
                  </button>
                </h2>
                <div id="flush-collapseOne" className="accordion-collapse collapse show" aria-labelledby="flush-headingOne">
                  <div className="accordion-body">
                    <p>
                      <b>Legal Entity Name </b>
                      is working with Soul Machines Limited, a New Zealand company whose address is
                      L1, 106 Customs Street West, Auckland, 1010, New Zealand.
                    </p>
                    <p>
                      Soul Machines have built a “Digital Brain” and “Embodied Cognitive
                      User Experience” which we call a “Digital Person”.
                    </p>
                  </div>
                </div>
              </div>
              <div className="accordion-item">
                <h2 className="accordion-header" id="flush-headingTwo">
                  <button className="accordion-button" type="button" data-bs-toggle="collapse" data-bs-target="#flush-collapseTwo" aria-expanded="true" aria-controls="flush-collapseTwo">
                    What information are we collecting?
                  </button>
                </h2>
                <div id="flush-collapseTwo" className="accordion-collapse collapse show" aria-labelledby="flush-headingTwo">
                  <div className="accordion-body">
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
                </div>
              </div>
              <div className="accordion-item">
                <h2 className="accordion-header" id="flush-headingThree">
                  <button className="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#flush-collapseThree" aria-expanded="false" aria-controls="flush-collapseThree">
                    Why are we collecting this information?
                  </button>
                </h2>
                <div id="flush-collapseThree" className="accordion-collapse collapse" aria-labelledby="flush-headingThree" data-bs-parent="#tocAccordion">
                  <div className="accordion-body">
                    <p>
                      We want your experience with the Digital Person to be as fun, natural and
                      engaging as possible. You can help us do this by allowing the Digital
                      Person to study and respond to your expressions in order to interpret
                      your emotional response so that they can provide an appropriate answer.
                      It’s just like a conversation with a real person where they are not just
                      interpreting what you say, but how you say it.
                    </p>
                    <p>
                      In the process, you are helping advance technology and experiencing the
                      future of human-to-machine interaction.
                    </p>

                    <p>
                      All conversation data collected is anonymized and complies with current
                      privacy practices and regulations. We take your privacy very seriously.
                    </p>
                  </div>
                </div>
              </div>
            </div>
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
  .landing-wrapper {
    padding-top: ${headerHeight};
    min-height: calc(100vh - ${headerHeight} );

    background-image: url(${landingBackground});
    background-color: rgb(247, 232, 219);
    background-size: contain;
    background-repeat: no-repeat;
    background-position: center bottom;

    .container {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: calc(100vh - ${headerHeight});

      .first-things-first {
        padding-bottom: 0.6rem;
        border-bottom: 1px solid rgba(0,0,0,0.2);
      }


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
