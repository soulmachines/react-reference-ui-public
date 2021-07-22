import React from 'react';
import styled from 'styled-components';
import PropTypes from 'prop-types';
import {
  ArrowRightCircleFill,
  CameraVideo, CheckSquare, FileEarmarkMedical, GraphUp,
} from 'react-bootstrap-icons';
import { Link } from 'react-router-dom';
import Header from '../components/Header';
import { headerHeight, landingBackground } from '../config';

const Landing = ({ className }) => (
  <div className={className}>
    <Header />
    <div className="landing-wrapper">
      <div className="container">
        <div className="card col-lg-6 p-3">
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
              <div className="mx-4">
                <FileEarmarkMedical />
                {' '}
                <a href="https://www.soulmachines.com/privacy-policy/" target="_blank" rel="noreferrer">EULA</a>
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

            <div className="accordion accordion-flush" id="accordionFlushExample">
              <div className="accordion-item">
                <h2 className="accordion-header" id="flush-headingOne">
                  <button className="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#flush-collapseOne" aria-expanded="false" aria-controls="flush-collapseOne">
                      Who is running this system?
                    </button>
                </h2>
                <div id="flush-collapseOne" className="accordion-collapse collapse" aria-labelledby="flush-headingOne" data-bs-parent="#accordionFlushExample">
                  <div className="accordion-body">
                      <p>
                        Soul Machines Limited is a New Zealand company whose address is
                        L1, 106 Customs Street West, Auckland, 1010, New Zealand.
                      </p>
                      <p>
                        Soul Machines have built a “Digital Brain” and
                        “Embodied Cognitive User Experience” which we call a “Digital Person”.
                      </p>
                    </div>
                </div>
              </div>
              <div className="accordion-item">
                <h2 className="accordion-header" id="flush-headingTwo">
                  <button className="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#flush-collapseTwo" aria-expanded="false" aria-controls="flush-collapseTwo">
                      What information are we collecting?
                    </button>
                </h2>
                <div id="flush-collapseTwo" className="accordion-collapse collapse" aria-labelledby="flush-headingTwo" data-bs-parent="#accordionFlushExample">
                  <div className="accordion-body">
                      <p>
                        For the Digital Person to be able to interact with you in an authentic and
                        human way, their Digital Brain™ needs to collect and process information
                        about your expressions.
                      </p>
                      <p>
                        As soon as it is collected, this information is anonymized. We do not
                        keep this information, provide it to third parties, or share it.
                        It is purely used while you are interacting with the Digital Person to
                        generate the best experience possible.
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
                <div id="flush-collapseThree" className="accordion-collapse collapse" aria-labelledby="flush-headingThree" data-bs-parent="#accordionFlushExample">
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
          <Link
            to="/loading"
            className="btn btn-success btn-lg action-btn"
          >
            I accept terms and conditions
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
};

const StyledLanding = styled(Landing)`
  .landing-wrapper {
    padding-top: ${headerHeight};
    min-height: calc(100vh - ${headerHeight});

    background-image: url(${landingBackground});
    background-color: rgb(247, 232, 219);
    background-size: contain;
    background-repeat: no-repeat;
    background-position: center bottom;

    svg {
      vertical-align: -0.125em;
    }
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

export default StyledLanding;
