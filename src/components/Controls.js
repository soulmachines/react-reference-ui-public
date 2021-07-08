import React, { useState } from 'react';
import { connect } from 'react-redux';
import styled from 'styled-components';
import { sendTextMessage } from '../store/sm/index';

const Controls = ({
  className, intermediateUserUtterance, lastUserUtterance, userSpeaking, dispatchText,
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
      <div className="row">
        <div className="col">
          <form className="input-group mb-3" onSubmit={handleSubmit}>
            <input type="text" className="form-control" placeholder={intermediateUserUtterance} value={inputValue} onChange={handleInput} onFocus={handleFocus} onBlur={handleBlur} aria-label="User input" />
          </form>
        </div>
      </div>
    </div>
  );
};

const StyledControls = styled(Controls)`
  display: ${(props) => (props.connected ? '' : 'none')};
  .form-control {
    max-width: 30rem;
    margin: 0px auto;

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
});

export default connect(mapStateToProps, mapDispatchToProps)(StyledControls);
