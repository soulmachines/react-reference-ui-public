import React from 'react';
import styled from 'styled-components';
import { logo, logoAltText, transparentHeader } from '../config';

const Header = ({ className }) => (
  <div className={className}>
    <div>
      {/* left align */}
      <img src={logo} className="logo" alt={logoAltText} />
    </div>
    <div>
      {/* middle align */}
    </div>
    <div>
      {/* right align */}
    </div>
  </div>
);

export default styled(Header)`
  height: 3rem;
  padding-left: 2rem;
  padding-right: 2rem;

  position: ${transparentHeader ? 'absolute' : 'relative'};
  z-index: 100;

  background-color: ${transparentHeader ? 'none' : '#FFFFFF'};

  display: flex;
  justify-content: space-between;
  align-items: center;

  .logo {
    /* height constrain logo image */
    height: 38px;
    width: auto;
  }
`;
