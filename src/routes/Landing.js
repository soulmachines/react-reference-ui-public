import React from 'react';
import styled from 'styled-components';
import PropTypes from 'prop-types';
import Color from 'color';
import { useDispatch, useSelector } from 'react-redux';
import breakpoints from '../utils/breakpoints';
import Header from '../components/Header';
import { landingBackgroundImage, landingBackgroundColor } from '../config';
import { setRequestedMediaPerms } from '../store/sm';
import { Link } from 'react-router-dom';

function Landing({ className }) {
  const { mic, camera } = useSelector(({ sm }) => sm.requestedMediaPerms);
  const dispatch = useDispatch();

  return (
    <div className={className}>
      <div className="landing-wrapper">
        <Header />
        <div className="container">
          <div className="landing-container">
            <div className="col-12 col-lg-6">
              <div className="row">
                <div>
                  <h1 className="fw-bol">
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
                      <input
                        className="form-check-input"
                        type="checkbox"
                        role="switch"
                        id="micPermSwitch"
                        onChange={() => dispatch(setRequestedMediaPerms({ mic: !mic }))}
                        checked={mic}
                      />
                      Use your microphone so I can hear you.
                    </label>
                  </div>
                </div>
              </div>
              <div className="row">
                <div>
                  <div className="form-check form-switch">
                    <label className="form-check-label" htmlFor="cameraPermSwitch">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        role="switch"
                        id="micPermSwitch"
                        onChange={() => dispatch(setRequestedMediaPerms({ camera: !camera }))}
                        checked={camera}
                      />
                      Use your camera so we can chat face-to-face.
                    </label>
                  </div>
                </div>
              </div>
              <div className="row">
                <div>
                  <Link to="/loading" className="btn btn-primary" type="button">
                    Chat with Digital Person A
                  </Link>
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
              <div className="col" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

Landing.propTypes = {
  className: PropTypes.string.isRequired,
};

export default styled(Landing)`
  .landing-wrapper {
    min-height: 100vh;

    background: ${landingBackgroundImage ? `url(${landingBackgroundImage})` : ''} ${landingBackgroundColor ? `${landingBackgroundColor};` : ''};
    background-size: 90% auto;
    background-repeat: no-repeat;
    background-position: center bottom;

    @media (min-width: ${breakpoints.lg}px) {
      background-size: 70% auto;
      background-position: right bottom;
    }
  }
  .landing-container {
    padding-top: 1rem;
    display: flex;

    &>div {
      background-color: ${Color(landingBackgroundColor).alpha(0.8)};
      border: 1px solid ${Color(landingBackgroundColor).darken(0.12)};
      padding: 1rem;
      border-radius: 5px;

      @media (min-width: ${breakpoints.lg}px) {
        border: none;
      }
    }

    .row {
      margin-bottom: 1rem;
    }
  }
`;
