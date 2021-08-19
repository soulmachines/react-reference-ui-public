import React, { createRef, useEffect, useState } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { Link, useHistory, useLocation } from 'react-router-dom';
import styled from 'styled-components';
import {
  ArrowRightCircleFill, CameraVideo, CameraVideoFill, LightningCharge, MicFill, Soundwave,
} from 'react-bootstrap-icons';
import { AnimatePresence, motion } from 'framer-motion';
import { createScene } from '../store/sm';
import Header from '../components/Header';
import { headerHeight, landingBackground } from '../config';
import breakpoints from '../utils/breakpoints';

const Loading = ({
  className, connected, loading, dispatchCreateScene, error, tosAccepted,
}) => {
  // pull querystring to see if we are displaying an error
  // (app can redirect to /loading on fatal err)
  const useQuery = () => new URLSearchParams(useLocation().search);
  const query = useQuery();

  // on mobile, we break the cards down into three pages
  const [displayedPage, setDisplayedPage] = useState(0);

  // create persona scene on button press on on mount, depending on device size
  const createSceneAndIteratePage = () => {
    // if we encounter a fatal error, app redirects to /loading to display
    if (!connected && !loading && query.get('error') !== true) dispatchCreateScene();
    setDisplayedPage(displayedPage + 1);
  };

  const createSceneIfNotStarted = () => {
    if (!loading) dispatchCreateScene();
  };
  useEffect(() => {
    if (window.innerWidth > breakpoints.md) dispatchCreateScene();
    window.addEventListener('resize', createSceneIfNotStarted);
    return () => window.removeEventListener('resize', createSceneIfNotStarted);
  }, []);

  // use to reload page if user unblocks perms and presses "try again"
  const history = useHistory();

  // if TOS hasn't been accepted, send to /
  if (tosAccepted === false) history.push('/');

  const proceedButton = (
    <Link to="/video" className={`btn  btn-lg ${connected ? 'btn-success' : 'btn-dark disabled'}`}>
      {
          connected
            ? (
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
                <div className="spinner-border" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
              </div>
            )
        }
    </Link>
  );

  const pages = [
    <div className="card" key="page-1">
      <div className="card-body">
        <div className="text-center">
          <CameraVideo color="#2222ff" size={42} />
        </div>
        <hr />
        <p>For me to work best, I need to be able to see you and hear your voice.</p>
        <p>This will be just like a video call where we can talk face to face.</p>
        <p>
          <b>
            If that sounds okay, please turn on access to your microphone and
            camera when we request it.
          </b>
        </p>
        <div className="d-grid gap-2 d-md-none d-block">
          <button type="button" onClick={createSceneAndIteratePage} className="btn btn-primary">Next</button>
        </div>
      </div>
    </div>,

    <div className="card" key="page-2">
      <div className="card-body">
        <div className="text-center">
          <LightningCharge color="#98980c" size={42} />
        </div>
        <hr />
        <p>
          Also,
          {' '}
          <b>
            the speed of your internet connection can have a big impact on picture
            and audio quality during the call.
          </b>
        </p>
        <p>
          If you experience connectivity issues, the picture quality may
          temporarily deteriorate or disappear entirely
        </p>
        <p>
          If that happens, try finding a location with a better connection and try again.
        </p>
        <div className="d-grid gap-2 d-md-none d-block">
          <button type="button" onClick={() => setDisplayedPage(displayedPage + 1)} className="btn btn-primary">Next</button>
        </div>
      </div>
    </div>,

    <div className="card" key="page-3">
      <div className="card-body">
        <div className="text-center">
          <Soundwave color="#da1d1d" size={42} />
        </div>
        <hr />
        <p><b>Finally, please find a quiet environment.</b></p>
        <p>
          I can find it hard to hear you when you&apos;re in a noisy room or
          there is a lot of noise in the background.
        </p>
        <p>
          Find a quiet place and let&apos;s keep this one-on-one for now.
        </p>
        <p className="d-md-none d-block">
          <b>All ready?</b>
        </p>
        <div className="d-grid gap-2 d-md-none d-block">
          {proceedButton}
        </div>
      </div>
    </div>,
  ];

  const variants = {
    enter: {
      x: 1000,
      opacity: 0,
    },
    center: {
      x: 0,
      opacity: 1,
    },
    exit: {
      x: -1000,
      opacity: 0,
      position: 'absolute',
    },
  };

  const overlayRef = createRef();
  const [height, setHeight] = useState('100vh');

  const handleResize = () => {
    setHeight(window.innerHeight);
  };

  useEffect(() => {
    handleResize();
    window.addEventListener('resize', handleResize);
    // cleanup
    return () => { window.removeEventListener('resize', handleResize); };
  }, []);

  return (
    <div className={className} ref={overlayRef} style={{ minHeight: height }}>
      <Header />
      <div className="container">
        <div className="loading-wrapper">
          {
          !error
            ? (
              <div>
                <div className="m-1">
                  <h1>
                    Before we get started,
                  </h1>
                  <h5>there are some things we should go over.</h5>
                </div>
                <div className="d-md-block d-none">
                  <div className="row">
                    <div className="card-group">
                      {pages}
                    </div>
                  </div>
                  <div className="row">
                    <div className="col d-flex justify-content-center m-3">
                      { proceedButton }
                    </div>
                  </div>
                </div>
                <div className="d-md-none d-block">
                  <AnimatePresence initial={false}>
                    {pages.flatMap((p, i) => {
                      if (i !== displayedPage) return null;
                      return (
                        <motion.div
                        // using indexes as keys is fine since the pages are pre-defined and static
                        // eslint-disable-next-line react/no-array-index-key
                          key={i}
                          variants={variants}
                          initial="enter"
                          animate="center"
                          exit="exit"
                          transition={{
                            x: { type: 'spring', stiffness: 300, damping: 30 },
                            opacity: { duration: 0.2 },
                          }}
                        >
                          {p}
                        </motion.div>
                      );
                    })}
                  </AnimatePresence>
                </div>
              </div>
            )
            : (
              <div className="alert alert-danger col-md-6 offset-md-3">
                {
                  // special error for webcam and mic denied permissions
                  error.msg === 'permissionsDenied'
                    ? (
                      <div>
                        <h4>
                          <CameraVideoFill />
                          {' / '}
                          <MicFill />
                          {' '}
                          Permissions Denied
                        </h4>
                        <hr />
                        <p>
                          Looks like you’ve denied us access to your camera and microphone.
                          If you&apos;d prefer, you can only enable the microphone.
                          You can always change permissions in your browser settings and try again.
                        </p>
                        <div className="d-grid mb-3">
                          <button onClick={() => history.go(0)} type="button" className="btn btn-primary">Reload</button>
                        </div>
                        <p>
                          We can have the best conversation when I can see and hear you.
                          However, if you prefer, you can also interact with me by typing only.
                        </p>
                        <div className="d-grid">
                          <button type="button" className="btn btn-outline-primary">
                            I prefer to type
                          </button>
                        </div>
                      </div>
                    )
                    : (
                      <div>
                        <h4>Encountered fatal error!</h4>
                        <hr />
                        <pre>
                          {JSON.stringify(error, null, '  ')}
                        </pre>
                      </div>
                    )
                }
              </div>
            )
        }
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
  error: PropTypes.shape({
    msg: PropTypes.string,
    err: PropTypes.objectOf(PropTypes.string),
  }),
  tosAccepted: PropTypes.bool.isRequired,
};

Loading.defaultProps = {
  error: null,
};

const StyledLoading = styled(Loading)`
  background-image: url(${landingBackground});
  background-color: rgb(247, 232, 219);
  background-size: contain;
  background-repeat: no-repeat;
  background-position: center bottom;
  width: 100vw;

  button.link-primary {
    background: none;
    border: none;
    padding: 0;
  }

  .loading-wrapper {
    padding-top: calc(${headerHeight} + 2rem);
    min-height: calc(100vh - ${headerHeight});
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    margin: 0;

    .loading-text {
      font-size: 2rem;
    }
  }

  .instructions-wrapper {
    overflow-x: scroll;
  }
  .instructions-card {
    display: inline-block;
    width: 100%;
  }
`;

const mapStateToProps = ({ sm }) => ({
  connected: sm.connected,
  loading: sm.loading,
  error: sm.error,
  tosAccepted: sm.tosAccepted,
});

const mapDispatchToProps = (dispatch) => ({
  dispatchCreateScene: () => dispatch(createScene()),
});

export default connect(mapStateToProps, mapDispatchToProps)(StyledLoading);
