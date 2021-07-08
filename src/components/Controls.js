import React, { useState } from 'react';
import { connect } from 'react-redux';
import styled from 'styled-components';
import ReactTooltip from 'react-tooltip';
import { sendTextMessage, disconnect } from '../store/sm/index';

const Controls = ({
  className, intermediateUserUtterance, lastUserUtterance, userSpeaking, dispatchText, dispatchDisconnect,
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
        <div className="col-2">
          <button type="button" className="btn btn-primary" onClick={dispatchDisconnect} data-tip="Disconnect">Disconnect</button>
          <ReactTooltip />
        </div>
      </div>
    </div>
  );
};

const StyledControls = styled(Controls)`
  display: ${(props) => (props.connected ? '' : 'none')};
  .row {
    max-width:  30rem;
    margin: 0px auto;
  }

  .form-control {
    opacity: 0.5;
    &:focus {
      opacity: 1;
    }
  }
`;

const mapStateToProps = (state) => ({
  intermediateUserUtterance: state.sm.intermediateUserUtterance,
  lastUserUtterance: state.sm.lastUserUtterance,
  userSpeaking: state.sm.userSpeaking,
  connected: state.sm.connected,
});

const mapDispatchToProps = (dispatch) => ({
  dispatchText: (text) => dispatch(sendTextMessage({ text })),
  dispatchDisconnect: () => dispatch(disconnect()),
});

export default connect(mapStateToProps, mapDispatchToProps)(StyledControls);
