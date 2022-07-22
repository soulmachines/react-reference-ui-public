import React from 'react';
import styled from 'styled-components';
import PropTypes from 'prop-types';
import Color from 'color';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import breakpoints from '../utils/breakpoints';
import Header from '../components/Header';
import { landingBackgroundImage, landingBackgroundColor } from '../config';
import { setRequestedMediaPerms } from '../store/sm';
import micFill from '../img/mic-fill.svg';
import videoFill from '../img/camera-video-fill.svg';

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
              <div className="row" style={{ marginBottom: '9px' }}>
                <div>
                  <h1 className="fw-bol">
                    Meet Digital Person A.
                  </h1>
                </div>
              </div>
              <div className="row">
                <div>
                  <h4 className="fw-light" style={{ marginBottom: '31px' }}>
                    Aliquam dapibus malesuada dignissim. Aliquam eu tortor
                    eu arcu tincidunt vulputate.
                  </h4>
                </div>
              </div>
              <div className="row" style={{ marginBottom: '36px' }}>
                <div>
                  <div className="form-check form-switch">
                    <label className="form-check-label d-flex align-items-center" htmlFor="micPermSwitch">
                      <input
                        className={`shadow form-check-input mic-switch switch ${mic ? 'status-checked' : 'status-unchecked'}`}
                        type="checkbox"
                        role="switch"
                        id="micPermSwitch"
                        onChange={() => dispatch(setRequestedMediaPerms({ mic: !mic }))}
                        checked={mic}
                      />
                      <div className="d-block ms-2">Use your microphone so I can hear you.</div>
                    </label>
                  </div>
                </div>
              </div>
              <div className="row" style={{ marginBottom: '52px' }}>
                <div>
                  <div className="form-check form-switch">
                    <label className="form-check-label d-flex align-items-center" htmlFor="cameraPermSwitch">
                      <input
                        className={`shadow form-check-input video-switch switch ${camera ? 'status-checked' : 'status-unchecked'}`}
                        type="checkbox"
                        role="switch"
                        id="micPermSwitch"
                        onChange={() => dispatch(setRequestedMediaPerms({ camera: !camera }))}
                        checked={camera}
                      />
                      <div className="d-block ms-2">Use your camera so we can chat face-to-face.</div>
                    </label>
                  </div>
                </div>
              </div>
              <div className="row" style={{ marginBottom: '60px' }}>
                <div>
                  <Link to="/loading" className="shadow btn primary-accent fs-3" type="button">
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
  }
  .form-switch .form-check-input {
    width: 7rem;
    height: 3rem;
    display: flex;
    align-items: center;
    justify-content: space-between;


    &.mic-switch::before, &.mic-switch.status-checked::after {
        background-image: url(${micFill});
    }
    &.video-switch::before, &.video-switch.status-checked::after {
        background-image: url(${videoFill});
    }
    &.mic-switch.status-checked::before, &.video-switch.status-checked::before {
      background-image: none;
    }

    &.status-unchecked {
      &::after {
        content: 'OFF';
        color: #000;
        margin-right: 10%;
      }
      &::before {
        background-size: 60%;
        background-repeat: no-repeat;
        background-color: rgb(220, 220, 220);
        background-position: 45% center;
        content: '';
        display: block;

        border-radius: 50%;

        height: 90%;
        margin-left: 2%;
        aspect-ratio: 1;
        float: right;
      }
    }

    &.status-checked {
      &::before {
        content: 'ON';
        color: #FFF;
        margin-left: 10%;
      }

      &::after {
        background-size: 60%;
        background-repeat: no-repeat;
        background-color: #FFF;
        background-position: 55% center;
        content: '';
        display: block;

        border-radius: 50%;

        height: 90%;
        margin-right: 2%;
        aspect-ratio: 1;
        float: right;
      }
    }
  }

`;
