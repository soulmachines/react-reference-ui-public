import React, { createRef, useEffect, useState } from 'react';
import styled from 'styled-components';
import PropTypes from 'prop-types';
import { useDispatch, useSelector } from 'react-redux';
import { useHistory } from 'react-router-dom';
import PersonaVideo from '../components/PersonaVideo';
import Captions from '../components/Captions';
import Controls from '../components/Controls';
import ContentCardDisplay from '../components/ContentCardDisplay';
import {
  disconnect,
} from '../store/sm/index';
import Header from '../components/Header';
import {
  headerHeight, disconnectPage, disconnectRoute,
} from '../config';
import CameraPreview from '../components/CameraPreview';
import breakpoints from '../utils/breakpoints';

function DPChat({
  className,
}) {
  const {
    connected,
    disconnected,
    error,
    cameraOn,
  } = useSelector(({ sm }) => ({ ...sm }));

  const dispatch = useDispatch();

  const handleResize = () => {
    setHeight(window.innerHeight);
  };

  const [startedAt] = useState(Date.now());
  const cleanup = () => {
    // if (Date.now() - startedAt < 1000) {
    //   console.warn('cleanup function invoked less than 1 second after component mounted, ignoring!');
    // } else {
    //   console.log('cleanup function invoked!');
    //   window.removeEventListener('resize', handleResize);
    //   dispatch(disconnect());
    // }
  };

  const overlayRef = createRef();
  const [height, setHeight] = useState('100vh');
  const [largeViewport, setLargeViewport] = useState(false);

  useEffect(() => {
    handleResize();
    window.addEventListener('resize', handleResize);
    // run cleanup on unmount
    return () => cleanup();
  }, []);

  window.onbeforeunload = () => {
    console.log('cleaning up');
    cleanup();
  };

  const history = useHistory();
  useEffect(() => {
    if (error !== null) history.push('/loading?error=true');
  }, [error]);

  if (disconnected === true) {
    if (disconnectPage) {
      history.push(disconnectRoute);
    } else history.push('/');
  }
  // usually this will be triggered when the user refreshes
  // if (connected !== true) history.push('/');

  return (
    <div className={className}>
      {/* <div className="video-overlay" ref={overlayRef} style={{ height }} /> */}
      {/* top row */}
      <div className="row d-flex">
        <Header />
        {
              cameraOn
                ? (
                  <div className="row d-flex justify-content-end">
                    <div className="col-auto">
                      <div className="camera-preview">
                        <CameraPreview />
                      </div>
                    </div>
                  </div>
                )
                : <div />
            }
      </div>
      {/* middle row */}
      <div className="row justify-content-end align-items-center flex-grow-1 p-3">
        <div className="vertical-fit-container col-md-5 align-items-center">
          <div className="d-block">
            <ContentCardDisplay />
          </div>
        </div>
      </div>
      {/* bottom row */}
      <div>
        <div className="row">
          <div className="col text-center">
            <Captions />
          </div>
        </div>
      </div>
      {
        connected ? <PersonaVideo /> : null
      }
    </div>
  );
}

DPChat.propTypes = {
  className: PropTypes.string.isRequired,
};

export default styled(DPChat)`
  height: calc(100vh);
  display: flex;
  flex-direction: column;

  .video-overlay {
    position: absolute;
    top: 0;
    right: 0;
    left: 0;
    z-index: 10;

    width: 100%;


  }
  .vertical-fit-container {
    overflow-y: scroll;

    scrollbar-width: none; /* Firefox 64 */
    &::-webkit-scrollbar {
      display: none;
    }
  }
`;
