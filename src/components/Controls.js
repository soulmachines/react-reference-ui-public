import React, { useState } from 'react';
import { connect } from 'react-redux';
import styled from 'styled-components';
import ReactTooltip from 'react-tooltip';
import PropTypes from 'prop-types';
import {
  sendTextMessage, disconnect, mute, stopSpeaking,
} from '../store/sm/index';

const Controls = ({
  className,
  intermediateUserUtterance,
  lastUserUtterance,
  userSpeaking,
  dispatchText,
  dispatchDisconnect,
  dispatchMute,
  isMuted,
  speechState,
  dispatchStopSpeaking,
}) => {
  const [inputValue, setInputValue] = useState('');
  const [inputFocused, setInputFocused] = useState(false);

  const handleInput = (e) => setInputValue(e.target.value);
  const handleFocus = () => {
    setInputFocused(true);
    setInputValue('');
  };
  const handleBlur = () => setInputFocused(false);
  const handleSubmit = (e) => {
    e.preventDefault();
    dispatchText(inputValue);
    setInputValue('');
  };

  if (userSpeaking === false && lastUserUtterance !== '' && inputValue !== lastUserUtterance && inputFocused === false) setInputValue(lastUserUtterance);
  else if (userSpeaking === true && inputValue !== '' && inputFocused === false) setInputValue('');

  return (
    <div className={className}>
      <div className="row mb-3">
        <div className="col">
          <form onSubmit={handleSubmit}>
            <input type="text" className="form-control" placeholder={intermediateUserUtterance} value={inputValue} onChange={handleInput} onFocus={handleFocus} onBlur={handleBlur} aria-label="User input" />
          </form>
        </div>
        <div className="col">
          <button type="button" className="btn btn-secondary" disabled={speechState !== 'speaking'} onClick={dispatchStopSpeaking} data-tip="Stop Speaking">Stop Speaking</button>
          <button type="button" className={`btn btn-${isMuted ? 'secondary' : 'danger '}`} onClick={dispatchMute} data-tip="Toggle Microphone Input">{ isMuted ? 'Unmute' : 'Mute' }</button>
          <button type="button" className="btn btn-primary" onClick={dispatchDisconnect} data-tip="Disconnect">Disconnect</button>
        </div>
      </div>
      <ReactTooltip />
    </div>
  );
};

Controls.propTypes = {
  className: PropTypes.string.isRequired,
  intermediateUserUtterance: PropTypes.string.isRequired,
  lastUserUtterance: PropTypes.string.isRequired,
  userSpeaking: PropTypes.bool.isRequired,
  dispatchText: PropTypes.func.isRequired,
  dispatchDisconnect: PropTypes.func.isRequired,
  dispatchMute: PropTypes.func.isRequired,
  isMuted: PropTypes.bool.isRequired,
  speechState: PropTypes.string.isRequired,
  dispatchStopSpeaking: PropTypes.func.isRequired,
};

const StyledControls = styled(Controls)`
  display: ${(props) => (props.connected ? '' : 'none')};
  .row {
    max-width: 50rem;
    margin: 0px auto;
  }

  .form-control {
    opacity: 0.5;
    &:focus {
      opacity: 1;
    }
  }
  .btn {
    margin-right: 0.4rem;
  }
`;

const mapStateToProps = (state) => ({
  intermediateUserUtterance: state.sm.intermediateUserUtterance,
  lastUserUtterance: state.sm.lastUserUtterance,
  userSpeaking: state.sm.userSpeaking,
  connected: state.sm.connected,
  isMuted: state.sm.isMuted,
  speechState: state.sm.speechState,
});

const mapDispatchToProps = (dispatch) => ({
  dispatchText: (text) => dispatch(sendTextMessage({ text })),
  dispatchDisconnect: () => dispatch(disconnect()),
  dispatchMute: () => dispatch(mute()),
  dispatchStopSpeaking: () => dispatch(stopSpeaking()),
});

export default connect(mapStateToProps, mapDispatchToProps)(StyledControls);
