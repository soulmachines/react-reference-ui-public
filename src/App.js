/* eslint-disable jsx-a11y/media-has-caption */
import React, { useEffect, useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import styled from 'styled-components';
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
