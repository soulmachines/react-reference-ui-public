import React, { useState } from 'react';
import styled from 'styled-components';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import Header from '../components/Header';
import { headerHeight } from '../config';

function Feedback({ className }) {
  const { presumeTimeout } = useSelector(({ sm }) => ({ ...sm }));

  const [display, setDisplay] = useState(null);

  return (
    <div className={className}>
      <Header />
      <div className="container feedback-container d-flex justify-content-center align-items-center flex-column">
        {
          presumeTimeout
            ? (
              <div className="alert alert-danger text-center">
                <h4>
                  Whoops!
                </h4>
                It looks like you timed out.
                <div className="mt-2">
                  <Link className="btn btn-danger" to="/loading">Reconnect</Link>
                </div>
              </div>
            )
            : null
        }
        <div className="card">
          <div className="card-body">
            <div className="row">
              <h4>How was your experience?</h4>
            </div>
            <div className="row">
              <div className="col-auto">
                <button className="btn btn-success" type="button" onClick={() => setDisplay('👍')}>
                  Good
                </button>
              </div>
              <div className="col">
                <h1 className="text-center">{display}</h1>
              </div>
              <div className="col-auto">
                <button className="btn btn-danger" type="button" onClick={() => setDisplay('👎')}>
                  Bad
                </button>
              </div>
            </div>
            <div className="row mt-3">
              <div className="col d-flex justify-content-center">
                <Link to="/loading" className="btn btn-primary">Start Over</Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

Feedback.propTypes = {
  className: PropTypes.string.isRequired,
};
export default styled(Feedback)`
  .feedback-container {
    height: calc(100vh - ${headerHeight});
  }
`;
