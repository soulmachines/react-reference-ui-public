import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { MicFill } from 'react-bootstrap-icons';
import { createScene } from '../store/sm';
import Header from '../components/Header';
import { headerHeight, landingBackgroundColor, landingBackgroundImage } from '../config';

function Loading({
  className,
}) {
  const {
    connected,
    loading,
    error,
  } = useSelector(({ sm }) => (sm));
  const dispatch = useDispatch();

  // // pull querystring to see if we are displaying an error
  // // (app can redirect to /loading on fatal err)
  // const useQuery = () => new URLSearchParams(useLocation().search);
  // const query = useQuery();

  // create persona scene on button press on on mount, depending on device size
  const createSceneIfNotStarted = () => {
    if (loading === false && connected === false && error === null) {
      dispatch(createScene());
    }
  };

  useEffect(() => {
    createSceneIfNotStarted();
  }, []);

  const [page, setPage] = useState(0);
  const pages = [
    <div>
      <div className="row justify-content-center">
        <div className="tutorial-icon mb-2">
          <MicFill size={62} />
        </div>
      </div>
      <div className="row">
        <h4>
          Before you begin.
        </h4>
        <div className="mt-0 mb-2">
          The Digital Person works best in a quiet environment, when you&apos;re close to your
          microphone, and your camera is on. Speak clearly, and in short responses.
        </div>
      </div>
    </div>,
    <div>
      <div className="row justify-content-center">
        <div className="tutorial-icon mb-2">
          <h4>
            &ldquo;hi, how are you?&rdquo;
          </h4>
        </div>
      </div>
      <div className="row">
        <h4>
          What you do.
        </h4>
        <div className="mt-0 mb-2">
          Digital Person A will listen to whatever you say.
          Other options, like typing or choosing your responses, are also available.
        </div>
      </div>
    </div>,
    <div>
      <div className="row justify-content-center">
        <div className="tutorial-icon tutorial-icon-dp mb-2" />
      </div>
      <div className="row">
        <h4>
          What you can talk about.
        </h4>
        <div className="mt-0 mb-2">
          You can chat about dolor sit amet, consectetur adipiscing elit.
          Sed volutpat eu nulla ac suscipit. Sed vel rhoncus neque, et sollicitudin sem.
        </div>
      </div>
    </div>,
  ];

  return (
    <div className={className}>
      <Header />
      <div className="container">
        <div className="row justify-content-center align-items-center">
          <div className="col-6 text-center">
            <div className="row">
              {pages[page]}
            </div>
            <div className="row justify-content-center">
              <div className="d-grid col-5">
                {
                  page < pages.length - 1
                    ? (
                      <button
                        className="btn primary-accent m-2"
                        type="button"
                        onClick={() => setPage(page + 1)}
                      >
                        Next
                      </button>
                    )
                    : null
                }
              </div>
            </div>
            <div className="row">
              <div>
                {
                  connected
                    ? (
                      <Link
                        to="/video"
                        className={`btn btn${page < pages.length - 1 ? '-outline' : ''}-dark m-2`}
                        type="button"
                      >
                        Chat Now
                      </Link>
                    )
                    : (
                      <div className="m-2 spinner-border" role="status">
                        <span className="visually-hidden">Loading...</span>
                      </div>
                    )
                }
              </div>
            </div>
            <div className="row justify-content-center">
              <div>
                {/* eslint-disable-next-line react/no-array-index-key */}
                {pages.map((_, i) => (<div key={`${i}-${i === page}`} className="d-inline p-1">{i === page ? '+' : 'o'}</div>))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

Loading.propTypes = {
  className: PropTypes.string.isRequired,
};

export default styled(Loading)`
  background: ${landingBackgroundColor};
  background-size: contain;
  background-repeat: no-repeat;
  background-position: center bottom;

  width: 100vw;
  height: 100vh;

  &>.container>.row {
    height: calc(100vh - ${headerHeight});
  }

  .tutorial-icon {
    width: 8rem;
    aspect-ratio: 1;
    border-radius: 50%;

    display: flex;
    align-items: center;
    justify-content: center;

    background-color: lightgray;
  }
  .tutorial-icon-dp {
    background-image: url(${landingBackgroundImage});
    background-size: cover;
    background-position: bottom center;
  }
`;
