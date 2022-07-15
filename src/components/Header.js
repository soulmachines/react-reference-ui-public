import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import styled from 'styled-components';
import { Link, useLocation } from 'react-router-dom';
import {
  logo, logoAltText, transparentHeader, headerHeight, logoLink,
} from '../config';
import {
  disconnect,
} from '../store/sm/index';
import Controls from './Controls';

function Header({
  className, connected, loading, dispatchDisconnect,
}) {
  const { pathname } = useLocation();
  return (
    <div className={`${className}`}>
      <div className="container">
        <div className="row">
          <div className="d-flex align-items-center justify-content-between">
            <div>
              {/* left align */}
              <Link to={logoLink}>
                <img src={logo} className="logo position-relative" alt={logoAltText} />
              </Link>
            </div>
            <div>
              {/* middle align */}
            </div>
            <div>
              {/* right align */}
              <Controls />
              <div className={`${connected && !loading && pathname === '/video' ? '' : 'd-none'}`}>
                {/* controls go here when we're done working */}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
Header.propTypes = {
  className: PropTypes.string.isRequired,
  connected: PropTypes.bool.isRequired,
  loading: PropTypes.bool.isRequired,
  dispatchDisconnect: PropTypes.func.isRequired,
};

const StyledHeader = styled(Header)`
  position: relative;
  z-index: 20;
  top: 0;
  width: 100%;
  background-color: ${transparentHeader ? 'none' : '#FFFFFF'};

  .position-relative {
    position: relative;
  }

  .row {
    height: ${headerHeight};
  }
  .logo {
    /* height constrain logo image */
    height: calc(0.6 * ${headerHeight});
    width: auto;
    // Medium devices (tablets, 768px and up)
    @media (min-width: 768px) {
      height: calc(0.8 * ${headerHeight});
   }
  }
`;

const mapStateToProps = ({ sm }) => ({
  connected: sm.connected,
  loading: sm.loading,
});

const mapDispatchToProps = (dispatch) => ({
  dispatchDisconnect: () => dispatch(disconnect()),
});

export default connect(mapStateToProps, mapDispatchToProps)(StyledHeader);
