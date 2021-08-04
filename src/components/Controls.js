import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import styled from 'styled-components';
import PropTypes from 'prop-types';
import {
  ChatSquareDotsFill, MicMuteFill, XOctagonFill,
} from 'react-bootstrap-icons';
import {
  sendTextMessage, mute, stopSpeaking, toggleShowTranscript,
} from '../store/sm/index';
import mic from '../img/mic.svg';
import micFill from '../img/mic-fill.svg';

const volumeMeterHeight = 24;

const Controls = ({
  className,
  intermediateUserUtterance,
  lastUserUtterance,
  userSpeaking,
  dispatchText,
  dispatchMute,
  isMuted,
  speechState,
  dispatchStopSpeaking,
  dispatchToggleShowTranscript,
  showTranscript,
}) => {
  const [inputValue, setInputValue] = useState('');
  const [inputFocused, setInputFocused] = useState(false);
  const [spinnerDisplay, setSpinnerDisplay] = useState('');
  const [spinnerIndex, setSpinnerIndex] = useState(0);
  const [volume, setVolume] = useState(0);

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

  const spinner = '▖▘▝▗';
  const spinnerInterval = 100;
  useEffect(() => {
    const timeout = setTimeout(() => {
      const nextDisplay = spinner[spinnerIndex];
      setSpinnerDisplay(nextDisplay);
      const nextIndex = (spinnerIndex === spinner.length - 1) ? 0 : spinnerIndex + 1;
      setSpinnerIndex(nextIndex);
    }, spinnerInterval);
    return () => clearTimeout(timeout);
  }, [spinnerIndex]);

  useEffect(async () => {
    // credit: https://stackoverflow.com/a/64650826
    let volumeCallback = null;
    // Initialize
    try {
      const audioStream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
        },
      });
      const audioContext = new AudioContext();
      const audioSource = audioContext.createMediaStreamSource(audioStream);
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 512;
      analyser.minDecibels = -127;
      analyser.maxDecibels = 0;
      analyser.smoothingTimeConstant = 0.4;
      audioSource.connect(analyser);
      const volumes = new Uint8Array(analyser.frequencyBinCount);
      volumeCallback = () => {
        analyser.getByteFrequencyData(volumes);
        let volumeSum = 0;
        volumes.forEach((v) => { volumeSum += v; });
        // multiply value by 2 so the volume meter appears more responsive
        // (otherwise the fill doesn't always show)
        const averageVolume = (volumeSum / volumes.length) * 2;
        // Value range: 127 = analyser.maxDecibels - analyser.minDecibels;
        setVolume(averageVolume > 127 ? 127 : averageVolume);
      };
      // runs every time the window paints
      const volumeDisplay = () => {
        window.requestAnimationFrame(() => {
          volumeCallback();
          volumeDisplay();
        });
      };
      volumeDisplay();
    } catch (e) {
      console.error('Failed to initialize volume visualizer!', e);
    }
  }, []);

  // clear placeholder text on reconnect, sometimes the state updates won't propagate
  const placeholder = intermediateUserUtterance === '' ? '' : intermediateUserUtterance;
  return (
    <div className={className}>
      <div className="row mb-3">
        <div className="col-auto">
          <button type="button" className={`btn btn-${showTranscript ? '' : 'outline-'}secondary`} aria-label="Toggle Transcript" data-tip="Toggle Transcript" onClick={dispatchToggleShowTranscript}><ChatSquareDotsFill /></button>
        </div>
        <div className="col">
          <form onSubmit={handleSubmit}>
            <div className="input-group">
              <button type="button" className={`speaking-status btn btn-${isMuted ? 'outline-secondary' : 'danger '}`} onClick={dispatchMute} data-tip="Toggle Microphone Input">
                <div>
                  { isMuted ? <MicMuteFill size={21} />
                    : (
                      <div className="volume-display">
                        {/* compute height as fraction of 127 so fill corresponds to volume */}
                        <div style={{ height: `${volumeMeterHeight}px` }} className="meter-component meter-component-1" />
                        <div style={{ height: `${(volume / 127) * volumeMeterHeight}px` }} className="meter-component meter-component-2" />
                      </div>
                    ) }
                </div>
                {/* { userSpeaking ? spinnerDisplay : null } */}
              </button>
              <input type="text" className="form-control" placeholder={placeholder} value={inputValue} onChange={handleInput} onFocus={handleFocus} onBlur={handleBlur} aria-label="User input" />
            </div>
          </form>
        </div>
        <div className="col-auto">
          <button type="button" className="btn btn-outline-secondary" disabled={speechState !== 'speaking'} onClick={dispatchStopSpeaking} data-tip="Stop Speaking">
            <XOctagonFill size={21} />
          </button>
        </div>
      </div>
    </div>
  );
};

Controls.propTypes = {
  className: PropTypes.string.isRequired,
  intermediateUserUtterance: PropTypes.string.isRequired,
  lastUserUtterance: PropTypes.string.isRequired,
  userSpeaking: PropTypes.bool.isRequired,
  dispatchText: PropTypes.func.isRequired,
  dispatchMute: PropTypes.func.isRequired,
  isMuted: PropTypes.bool.isRequired,
  speechState: PropTypes.string.isRequired,
  dispatchStopSpeaking: PropTypes.func.isRequired,
  showTranscript: PropTypes.bool.isRequired,
  dispatchToggleShowTranscript: PropTypes.func.isRequired,
};

const StyledControls = styled(Controls)`
  display: ${(props) => (props.connected ? '' : 'none')};
  .row {
    max-width: 50rem;
    margin: 0px auto;
  }

  .speaking-status {
    width: 47px;
  }

  .volume-display {
    position: relative;
    top: ${volumeMeterHeight * 0.5}px;
    display: flex;
    align-items: flex-end;
    .meter-component {
      height: ${volumeMeterHeight}px;
      width: 21px;
      background-repeat: no-repeat;
      position: absolute;
    }
    .meter-component-1 {
      background: url(${mic});
      background-position: top;
      background-size: ${volumeMeterHeight}px;
      z-index: 10;
    }
    .meter-component-2 {
      background: url(${micFill});
      background-position: bottom;
      background-size: ${volumeMeterHeight}px;
      z-index: 20;
    }
  }

  svg {
    /* make bootstrap icons vertically centered in buttons */
    margin-top: -0.1rem;
  }

  .form-control {
    opacity: 0.7;
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
  isMuted: state.sm.isMuted,
  speechState: state.sm.speechState,
  showTranscript: state.sm.showTranscript,
});

const mapDispatchToProps = (dispatch) => ({
  dispatchText: (text) => dispatch(sendTextMessage({ text })),
  dispatchMute: () => dispatch(mute()),
  dispatchStopSpeaking: () => dispatch(stopSpeaking()),
  dispatchToggleShowTranscript: () => dispatch(toggleShowTranscript()),
});

export default connect(mapStateToProps, mapDispatchToProps)(StyledControls);
