import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import styled from 'styled-components';
import PropTypes from 'prop-types';
import {
  CameraFill,
  ChatLeftText,
  MicFill,
  SkipEndFill,
  ThreeDotsVertical,
  VolumeMuteFill,
  VolumeUpFill,
} from 'react-bootstrap-icons';
import ReactTooltip from 'react-tooltip';
import {
  sendTextMessage,
  stopSpeaking,
  setShowTranscript,
  disconnect,
  setOutputMute,
  setMicOn,
  setCameraOn,
} from '../store/sm/index';
import mic from '../img/mic.svg';
import micFill from '../img/mic-fill.svg';
import breakpoints from '../utils/breakpoints';
import { mediaStreamProxy } from '../proxyVideo';
import { primaryAccent } from '../globalStyle';

const volumeMeterHeight = 24;
const volumeMeterMultiplier = 1.2;
const smallHeight = volumeMeterHeight;
const largeHeight = volumeMeterHeight * volumeMeterMultiplier;

function Controls({
  className,
}) {
  const {
    intermediateUserUtterance,
    lastUserUtterance,
    userSpeaking,
    connected,
    micOn,
    cameraOn,
    isOutputMuted,
    speechState,
    showTranscript,
    transcript,
    videoWidth,
    requestedMediaPerms,
  } = useSelector((state) => ({ ...state.sm }));
  const typingOnly = requestedMediaPerms.mic !== true;

  const dispatch = useDispatch();

  const [inputValue, setInputValue] = useState('');
  const [inputFocused, setInputFocused] = useState(false);
  const [volume, setVolume] = useState(0);
  const [hideInputDisplay, setHideInputDisplay] = useState(true);
  const [showTextInput, setShowTextInput] = useState(!micOn);
  const isLarger = videoWidth >= breakpoints.md ? largeHeight : smallHeight;
  const [responsiveVolumeHeight, setResponsiveVolumeHeight] = useState(isLarger);

  const handleInput = (e) => setInputValue(e.target.value);
  const handleFocus = () => {
    setInputFocused(true);
    setInputValue('');
  };
  const handleBlur = () => setInputFocused(false);
  const handleSubmit = (e) => {
    e.preventDefault();
    dispatch(sendTextMessage({ text: inputValue }));
    setInputValue('');
  };

  if (userSpeaking === true && inputValue !== '' && inputFocused === false) setInputValue('');

  let timeout;
  useEffect(() => {
    if (userSpeaking === true || lastUserUtterance.length > 0) setHideInputDisplay(false);
    const createTimeout = () => setTimeout(() => {
      if (userSpeaking === false) setHideInputDisplay(true);
      else createTimeout();
    }, 3000);
    timeout = createTimeout();
    return () => clearTimeout(timeout);
  }, [userSpeaking, lastUserUtterance, micOn]);

  // mic level visualizer
  useEffect(async () => {
    if (connected && typingOnly === false) {
      // credit: https://stackoverflow.com/a/64650826
      let volumeCallback = null;
      let audioStream;
      let audioContext;
      let audioSource;
      let unmounted = false;
      // Initialize
      try {
        audioStream = mediaStreamProxy.getUserMediaStream();
        audioContext = new AudioContext();
        audioSource = audioContext.createMediaStreamSource(audioStream);
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
            if (!unmounted) {
              volumeCallback();
              volumeDisplay();
            }
          });
        };
        volumeDisplay();
      } catch (e) {
        console.error('Failed to initialize volume visualizer!', e);
      }

      return () => {
        console.log('closing down the audio stuff');
        // FIXME: tracking #79
        unmounted = true;
        audioContext.close();
        audioSource.close();
      };
    } return false;
  }, [connected]);

  // bind transcrpt open and mute func to each other, so that
  // when we open the transcript we mute the mic
  const toggleKeyboardInput = () => {
    const toggledTextInput = !showTextInput;
    dispatch(setMicOn({ micOn: !toggledTextInput }));
    setShowTextInput(toggledTextInput);
  };

  useEffect(() => {
    ReactTooltip.rebuild();
  });

  // clear placeholder text on reconnect, sometimes the state updates won't propagate
  const placeholder = intermediateUserUtterance === '' ? '' : intermediateUserUtterance;

  const feedbackDisplay = (
    <span
      className={`badge bg-light input-display
              ${userSpeaking ? 'utterance-processing' : ''}
              ${(transcript.length === 0 && intermediateUserUtterance === '') || hideInputDisplay ? 'hide-input' : 'show-input'}
              `}
    >
      <div className="text-wrap text-start input-display">
        { userSpeaking ? 'Listening: ' : 'I heard: '}
        {placeholder || lastUserUtterance}
        {
                userSpeaking
                  ? (
                    <div>
                      <div className="spinner-border ms-2 d-md-block d-none" role="status">
                        <span className="visually-hidden">Loading...</span>
                      </div>
                      <div className="spinner-border spinner-border-sm ms-1 d-block d-md-none" role="status">
                        <span className="visually-hidden">Loading...</span>
                      </div>
                    </div>
                  )
                  : null
              }
      </div>
    </span>
  );

  const iconSize = 24;

  return (
    <div className={className}>
      <div className="d-flex">
        <div>
          {/* mute dp sound */}
          <button
            type="button"
            className="control-icon"
            onClick={() => dispatch(setOutputMute({ isOutputMuted: !isOutputMuted }))}
          >
            {
              (isOutputMuted)
                ? <VolumeMuteFill size={iconSize} />
                : <VolumeUpFill size={iconSize} color={primaryAccent} />
            }
          </button>
        </div>
        <div>
          {/* skip through whatever dp is currently speaking */}
          <button
            type="button"
            className="control-icon"
            disabled={speechState !== 'speaking'}
            onClick={() => dispatch(stopSpeaking())}
            data-tip="Stop Speaking"
          >
            <SkipEndFill size={iconSize} />
          </button>
        </div>
        <div>
          {/* show transcript */}
          <button
            type="button"
            className="control-icon"
            aria-label="Toggle Transcript"
            data-tip="Toggle Transcript"
            onClick={toggleKeyboardInput}
            disabled={transcript.length === 0}
          >
            <ChatLeftText size={iconSize} />
          </button>
        </div>
        <div>
          {/* toggle user mic */}
          <button
            type="button"
            className="control-icon"
            disabled={requestedMediaPerms.mic === false}
            onClick={() => dispatch(setMicOn({ micOn: !micOn }))}
          >
            <MicFill size={iconSize} />
          </button>
        </div>
        <div>
          {/* toggle user camera */}
          <button
            type="button"
            className="control-icon"
            disabled={requestedMediaPerms.camera === false}
            onClick={() => dispatch(setCameraOn({ cameraOn: !cameraOn }))}
          >
            <CameraFill size={iconSize} />
          </button>
        </div>
        <div className="dropdown">
          <button
            className="control-icon"
            type="button"
            id="dpChatDropdown"
            data-bs-toggle="dropdown"
            aria-expanded="false"
          >
            <ThreeDotsVertical size={iconSize} />
          </button>
          <ul className="dropdown-menu" aria-labelledby="dpChatDropdown">
            <li>
              <button
                className="dropdown-item"
                type="button"
                disabled={!connected}
                onClick={() => dispatch(disconnect())}
                data-tip="Disconnect"
                data-place="bottom"
              >
                Exit
              </button>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}

Controls.propTypes = { className: PropTypes.string.isRequired };

export default styled(Controls)`
  .control-icon {
    border: none;
    background: none;
  }
  .form-control {
    opacity: 0.8;
    &:focus {
      opacity: 1;
    }
  }
  .badge {
    font-size: 14pt;
    font-weight: normal;
    color: #000;
  }
  .utterance-processing {
    opacity: 0.7;
    font-style: italic;
  }
  .input-display {
    transition: bottom 0.3s, opacity 0.3s;
    height: auto;
    display: flex;
  }
  .hide-input {
    position: relative;
    bottom: -2.5rem;
    opacity: 0;
  }
  .show-input {
    position: relative;
    bottom: 0rem;
    opacity: ${({ userSpeaking }) => (userSpeaking ? 0.7 : 1)};;
  }

  .speaking-status {
    width: 47px;
    @media (min-width: ${breakpoints.md}px) {
      min-width: 56px;
    }
  }

  .interrupt {
    opacity: 1;
    transition: opacity 0.1s;
  }
  .interrupt-active {
    opacity: 0;
  }

  .volume-display {
    position: relative;
    top: ${volumeMeterHeight * 0.5}px;
    display: flex;
    align-items: flex-end;
    justify-content: start;
    min-width: ${({ videoWidth }) => (videoWidth <= breakpoints.md ? 21 : 32)}px;
    .meter-component {
      /* don't use media queries for this since we need to write the value
      in the body of the component */
      height: ${({ videoWidth }) => (videoWidth >= breakpoints.md ? largeHeight : smallHeight)}px;
      background-size: ${({ videoWidth }) => (videoWidth >= breakpoints.md ? largeHeight : smallHeight)}px;
      background-position: bottom;
      background-repeat: no-repeat;
      min-width: ${({ videoWidth }) => (videoWidth <= breakpoints.md ? 21 : 28)}px;
      position: absolute;
    }
    .meter-component-1 {
      background-image: url(${mic});
      z-index: 10;
    }
    .meter-component-2 {
      background-image: url(${micFill});
      z-index: 20;
    }
  }

`;
