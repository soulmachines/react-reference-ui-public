import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import styled from 'styled-components';
import PropTypes from 'prop-types';
import PersonaVideo from './components/PersonaVideo';
import Captions from './components/Captions';

const App = ({ className }) => (
  <div className={className}>
    <div className="video-overlay container">
      <Captions />
    </div>
    <PersonaVideo />
  </div>
);

App.propTypes = {
  className: PropTypes.string.isRequired,
};

export default styled(App)`
  .video-overlay {
    position: absolute;
    top: 0;
    right: 0;
    left: 0;
    z-index: 10;

    width: 100%;
    height: 100%;

    display: flex;
    align-items: flex-end;
    justify-content: center;
  }
`;
