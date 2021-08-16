import React, { useState } from 'react';
import styled from 'styled-components';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';

const Feedback = ({ className }) => {
  const [display, setDisplay] = useState(null);
  return (
    <div className={className}>
      <div className="container d-flex justify-content-center align-items-center">
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
                <Link to="/" className="btn btn-primary">Start Over</Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

Feedback.propTypes = {
  className: PropTypes.string.isRequired,
};
export default styled(Feedback)`
  .container {
    height: 100vh;
  }
`;
