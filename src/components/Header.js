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

const Header = ({
  className, connected, loading, dispatchDisconnect,
}) => {
  const { pathname } = useLocation();
  return (
    <div className={className}>
      <div>
        {/* left align */}
        <Link to={logoLink}>
          <img src={logo} className="logo" alt={logoAltText} />
        </Link>
      </div>
      <div>
        {/* middle align */}
      </div>
      <div>
        {/* right align */}
        <button type="button" disabled={!connected} className={`btn btn-outline-danger ${connected && !loading && pathname === '/video' ? '' : 'd-none'}`} onClick={dispatchDisconnect} data-tip="Disconnect" data-place="bottom">Disconnect</button>
      </div>
    </div>
  );
};
Header.propTypes = {
  className: PropTypes.string.isRequired,
  connected: PropTypes.bool.isRequired,
  loading: PropTypes.bool.isRequired,
  dispatchDisconnect: PropTypes.func.isRequired,
};

const StyledHeader = styled(Header)`
  height: ${headerHeight};
  width: 100%;
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
    height: calc(0.8 * ${headerHeight});
    width: auto;
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
