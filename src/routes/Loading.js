import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import {
  ArrowRightCircleFill, CameraVideo, LightningCharge, Soundwave,
} from 'react-bootstrap-icons';
import { createScene } from '../store/sm';
import Header from '../components/Header';
import { headerHeight, landingBackground } from '../config';

const Loading = ({
  className, connected, loading, dispatchCreateScene,
}) => {
  const [spinnerDisplay, setSpinnerDisplay] = useState('');
  const [spinnerIndex, setSpinnerIndex] = useState(0);
  // create scene on mount
  useEffect(() => {
    if (!connected && !loading) dispatchCreateScene();
  }, []);

  const spinner = '▖▘▝▗';
  const spinnerInterval = 100;
  useEffect(() => {
    const timeout = setTimeout(() => {
      const nextDisplay = spinner[spinnerIndex];
      setSpinnerDisplay(nextDisplay);
      const nextIndex = (spinnerIndex === spinner.length - 1) ? 0 : spinnerIndex + 1;
      setSpinnerIndex(nextIndex);
    }, spinnerInterval);
    clearTimeout(timeout);
  }, [spinnerIndex]);

  return (
    <div className={className}>
      <Header />
      <div className="container">
        <div className="row">
          <div className="col">
            <div className="card">

              <div className="card-body">
                <div className="background-primary text-center">
                  <CameraVideo color="#2222ff" size={42} />
                </div>
                <hr />
                <h5 className="card-title text-center">
                  Enable / Allow Video &amp; Microphone Access
                </h5>
                <ul>
                  <li>
                    For me to work best, I need to be able to see you and hear your voice.
                  </li>
                  <li className="mt-2">
                    This will be jut like a video call where we can talk face to face.
                    {' '}
                  </li>
                  <li className="mt-2">
                    If that sounds okay, please turn on access to your microphone and
                    camera when we request it.
                  </li>
                </ul>
              </div>
            </div>
          </div>
          <div className="col">
            <div className="card">

              <div className="card-body">
                <div className="text-center">
                  <LightningCharge color="#98980c" size={42} />
                </div>
                <hr />
                <h5 className="card-title text-center">Check connection speed</h5>
                <ul>
                  <li>
                    The speed of your internet connection can have a big impact on picture
                    and audio quality during the call.
                  </li>
                  <li className="mt-2">
                    If you experience connectivity issues, the picture quality may temporarily
                    deteriorate or disappear entirely
                  </li>
                </ul>
              </div>
            </div>
          </div>
          <div className="col">
            <div className="card">
              <div className="card-body">
                <div className="text-center">
                  <Soundwave color="#da1d1d" size={42} />
                </div>
                <hr />
                <h5 className="card-title text-center">Find a quiet environment</h5>
                <ul>
                  <li>
                    I can find it hard to hear you when you&apos;re in a noisy room or
                    there is a lot of noise in the background
                  </li>
                  <li className="mt-2">
                    Find a quiet place and let&apos;s keep this one-on-one for now
                  </li>
                  <li className="mt-2">
                    If that sounds ok, please turn on access to your microphone and
                    camera when we request it.
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
        <div className="row mt-4">
          <div className="col d-flex justify-content-center">
            <Link to="/video" className={`btn  btn-lg ${connected ? 'btn-success' : 'btn-light disabled'}`}>
              {
                  connected ? (
                    <div>
                      Proceed
                      {' '}
                      <ArrowRightCircleFill />
                    </div>
                  )
                    : (
                      <div>
                        Loading
                        {' '}
                        {spinnerDisplay}
                      </div>
                    )
                }
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

Loading.propTypes = {
  className: PropTypes.string.isRequired,
  connected: PropTypes.bool.isRequired,
  loading: PropTypes.bool.isRequired,
  dispatchCreateScene: PropTypes.func.isRequired,
};

const StyledLoading = styled(Loading)`
  min-height: 100vh;

  background-image: url(${landingBackground});
  background-color: rgb(247, 232, 219);
  background-size: contain;
  background-repeat: no-repeat;
  background-position: center bottom;

  .container {
    padding-top: calc(${headerHeight} + 2rem);
    min-height: calc(100vh - ${headerHeight});
    display: flex;
    flex-direction: column;
    justify-content: space-between;

    code {
      border-radius: 3px;
      font-size: 1.5rem;
      background: #FFFFFF;
      padding: 0.5rem 1rem 0.5rem 1rem;
    }

    .btn-lg {
      font-size: 2rem;
    }
  }
  svg {
    vertical-align: -0.125em;
  }
`;

const mapStateToProps = ({ sm }) => ({
  connected: sm.connected,
  loading: sm.loading,
});

const mapDispatchToProps = (dispatch) => ({
  dispatchCreateScene: () => dispatch(createScene()),
});

export default connect(mapStateToProps, mapDispatchToProps)(StyledLoading);
