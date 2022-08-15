import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { Scene, Persona } from '@soulmachines/smwebsdk';
import to from 'await-to-js';
import proxyVideo, { mediaStreamProxy } from '../../proxyVideo';
import roundObject from '../../utils/roundObject';
import { meatballString } from './meatball';

const ORCHESTRATION_MODE = process.env.REACT_APP_ORCHESTRATION_MODE || false;
const AUTH_MODE = parseInt(process.env.REACT_APP_PERSONA_AUTH_MODE, 10) || 0;
const API_KEY = process.env.REACT_APP_API_KEY || '';
const TOKEN_ISSUER = process.env.REACT_APP_TOKEN_URL;
const PERSONA_ID = '1';
// CAMERA_ID commented out because CUE manages camera
// const CAMERA_ID = 'CloseUp';

if (AUTH_MODE === 0 && API_KEY === '') throw new Error('REACT_APP_API_KEY not defined!');

const initialState = {
  requestedMediaPerms: JSON.parse(localStorage.getItem('requestedMediaPerms')) || {
    mic: true,
    camera: true,
  },
  tosAccepted: false,
  connected: false,
  disconnected: false,
  loading: false,
  error: null,
  micOn: true,
  cameraOn: true,
  isOutputMuted: false,
  videoHeight: window.innerHeight,
  videoWidth: window.innerWidth,
  transcript: [],
  activeCards: [],
  speechState: 'idle',
  // NLP gives us results as it processes final user utterance
  intermediateUserUtterance: '',
  userSpeaking: false,
  lastUserUtterance: '',
  lastPersonaUtterance: '',
  user: {
    activity: {
      isAttentive: 0,
      isTalking: 0,
    },
    emotion: {
      confusion: 0,
      negativity: 0,
      positivity: 0,
      confidence: 0,
    },
    conversation: {
      turn: '',
      context: {
        FacePresent: 0,
        PersonaTurn_IsAttentive: 0,
        PersonaTurn_IsTalking: null,
        Persona_Turn_Confusion: null,
        Persona_Turn_Negativity: null,
        Persona_Turn_Positivity: null,
        UserTurn_IsAttentive: 0,
        UserTurn_IsTalking: null,
        User_Turn_Confusion: null,
        User_Turn_Negativity: null,
        User_Turn_Positivity: null,
      },
    },
  },
  callQuality: {
    audio: {
      bitrate: null,
      packetsLost: null,
      roundTripTime: null,
    },
    video: {
      bitrate: null,
      packetsLost: null,
      roundTripTime: null,
    },
  },
  // default to 1 because these values are used to compute an aspect ratio,
  // so if for some reason the camera is disabled, it will default to a square (1:1)
  cameraWidth: 1,
  cameraHeight: 1,
  showTranscript: false,
  // enable and disable features for each new session
  config: {
    autoClearCards: false,
  },
};

// host actions object since we need the types to be available for
// async calls later, e.g. handling messages from persona
let actions;
let persona = null;
let scene = null;

/**
 * Animate the camera to the desired settings.
 * See utils/camera.js for help with calculating these.
 *
 * options {
 *   tiltDeg: 0,
 *   orbitDegX: 0,
 *   orbitDegY: 0,
 *   panDeg: 0,
 * }
 */
export const animateCamera = createAsyncThunk('sm/animateCamera', ({ options, duration }) => {
  if (!scene) return console.error('cannot animate camera, scene not initiated!');

  const serverControlledCameras = scene.hasServerControlledCameras();
  if (serverControlledCameras) return console.error('autonomous animation is active, manual camera animations are disabled!');

  const CAMERA_ID = 1;
  return scene.sendRequest('animateToNamedCamera', {
    cameraName: CAMERA_ID,
    personaId: PERSONA_ID,
    time: duration || 1,
    ...options,
  });
});

// handles both manual disconnect or automatic timeout due to inactivity
export const disconnect = createAsyncThunk('sm/disconnect', async (args, thunk) => {
  if (scene) scene.disconnect();
  // wait 500ms so dispatch logic has time to run and communicate w/ persona server
  setTimeout(() => {
    thunk.dispatch(actions.disconnect());
  }, 500);
});

export const createScene = createAsyncThunk('sm/createScene', async (_, thunk) => {
  /* CREATE SCENE */
  if (scene !== null) {
    return console.error('warning! you attempted to create a new scene, when one already exists!');
  }
  // request permissions from user and create instance of Scene and ask for webcam/mic permissions
  const { requestedMediaPerms } = thunk.getState().sm;
  const { mic, camera } = requestedMediaPerms;
  try {
    const sceneOpts = {
      videoElement: proxyVideo,
      // audio only toggle, but this is set automatically if user denies camera permissions.
      // change value if your application needs to have an explicit audio-only mode.
      audioOnly: false,
      // requested permissions
      requestedMediaDevices: {
        microphone: mic,
        camera,
      },
      // required permissions. we can run in a typing only mode, so none is fine
      requiredMediaDevices: {
        microphone: false,
        camera: false,
      },
    };
    console.log(sceneOpts);
    if (AUTH_MODE === 0) sceneOpts.apiKey = API_KEY;
    scene = new Scene(sceneOpts);
  } catch (e) {
    return thunk.rejectWithValue(e);
  }
  // reflect mic and camera status in redux store
  thunk.dispatch(actions.setMediaDevices({ micOn: mic, cameraOn: camera }));

  /* BIND HANDLERS */
  scene.onDisconnected = () => thunk.dispatch(disconnect());
  // store a ref to the smwebsdk onmessage so that we can
  // use the callback while also calling the internal version
  const smwebsdkOnMessage = scene.onMessage.bind(scene);

  const { sm } = thunk.getState();
  const { autoClearCards } = sm.config;
  scene.conversation.autoClearCards = autoClearCards;
  // handle content cards that come in via content card API
  scene.conversation.onCardChanged.addListener((activeCards) => {
    thunk.dispatch(actions.setActiveCards({ activeCards }));
    thunk.dispatch(actions.addConversationResult({
      source: 'persona',
      card: activeCards[0],
    }));
  });

  scene.onMessage = (message) => {
    // removing this will break smwebsdk eventing, call smwebsdk's message handler
    smwebsdkOnMessage(message);
    switch (message.name) {
      // handles output from TTS (what user said)
      case ('recognizeResults'): {
        const output = message.body.results[0];
        // sometimes we get an empty message, catch and log
        if (!output) {
          console.warn('undefined output!', message.body);
          return false;
        }
        const { transcript: text } = output.alternatives[0];
        // we get multiple recognizeResults messages, so only add the final one to transcript
        // but keep track of intermediate one to show the user what they're saying
        if (output.final === false) {
          return thunk.dispatch(actions.setIntermediateUserUtterance({
            text,
          }));
        }
        return thunk.dispatch(actions.addConversationResult({
          source: 'user',
          text,
        }));
      }

      // handles output from NLP (what DP is saying)
      case ('personaResponse'): {
        const { currentSpeech } = message.body;
        thunk.dispatch(actions.addConversationResult({
          source: 'persona',
          text: currentSpeech,
        }));
        break;
      }

      // handle speech markers
      case ('speechMarker'): {
        const { name: speechMarkerName } = message.body;
        switch (speechMarkerName) {
          // @showCards() and @hideCards() no longer triggers a speech marker
          // not needed w/ content card API
          case ('cinematic'): {
            // fired when CUE changes camera angles
            break;
          }
          case ('feature'): {
            const { arguments: featureArgs } = message.body;
            const feature = featureArgs[0];
            const featureState = featureArgs[1];
            switch (feature) {
              case ('camera'): {
                if (featureState === 'on') thunk.dispatch(actions.setCamera({ cameraOn: false }));
                else if (featureState === 'off') thunk.dispatch(actions.setCamera({ cameraOn: true }));
                else console.error(`state ${featureState} not supported by @feature(microphone)!`);
                break;
              }
              case ('microphone'): {
                if (featureState === 'on') thunk.dispatch(actions.setMic({ micOn: true }));
                else if (featureState === 'off') thunk.dispatch(actions.setMic({ micOn: false }));
                else console.error(`state ${featureState} not supported by @feature(microphone)!`);
                break;
              }
              case ('transcript'): {
                if (featureState === 'on') thunk.dispatch(actions.setShowTranscript(true));
                else if (featureState === 'off') thunk.dispatch(actions.setShowTranscript(false));
                else console.error(`state ${featureState} not supported by @feature(transcript)!`);
                break;
              }
              default: {
                console.error(`@feature(${feature}) not recognized!`);
              }
            }
            break;
          }
          case ('close'): {
            thunk.dispatch(disconnect());
            break;
          }
          case ('marker'): {
            // custom speech marker handler
            const { arguments: markerArgs } = message.body;
            markerArgs.forEach((a) => {
              switch (a) {
                // "easter egg" speech marker, prints ASCII "summoned meatball" to console
                case ('triggerMeatball'): {
                  console.log(meatballString);
                  break;
                }
                default: {
                  console.warn(`no handler for @marker(${a})!`);
                }
              }
            });
            break;
          }
          default: {
            console.warn(`unrecognized speech marker: ${speechMarkerName}`);
          }
        }
        break;
      }

      case ('updateContentAwareness'): {
        // fired when content awareness changes
        // eg an element w/ data-sm-content enters/exits DOM
        break;
      }
      case ('conversationSend'): {
        // fired when the user manually types in some input
        // we handle this elsewhere so we don't need to handle this event
        break;
      }

      // state messages contain a lot of things, including user emotions,
      // call stats, and persona state
      case ('state'): {
        const { body } = message;
        if ('persona' in body) {
          const personaState = body.persona[1];

          // handle changes to persona speech state ie idle, animating, speaking
          if ('speechState' in personaState) {
            const { speechState } = personaState;
            const action = actions.setSpeechState({ speechState });
            thunk.dispatch(action);
          }

          if ('users' in personaState) {
            // handle various numeric values such as user emotion or
            // probability that the user is talking
            const userState = personaState.users[0];

            if ('emotion' in userState) {
              const { emotion } = userState;
              const roundedEmotion = roundObject(emotion);
              const action = actions.setEmotionState({ emotion: roundedEmotion });
              thunk.dispatch(action);
            }

            if ('activity' in userState) {
              const { activity } = userState;
              const roundedActivity = roundObject(activity, 1000);
              const action = actions.setEmotionState({ activity: roundedActivity });
              thunk.dispatch(action);
            }

            if ('conversation' in userState) {
              const { conversation } = userState;
              const { context } = conversation;
              const roundedContext = roundObject(context);
              const action = actions.setConversationState({
                conversation: {
                  ...conversation,
                  context: roundedContext,
                },
              });
              thunk.dispatch(action);
            }
          }
        } else if ('statistics' in body) {
          const { callQuality } = body.statistics;
          thunk.dispatch(actions.setCallQuality({ callQuality }));
        }
        break;
      }

      // activation events are some kind of emotional metadata
      case ('activation'): {
        // console.warn('activation handler not yet implemented', message);
        break;
      }

      // animateToNamedCamera events are triggered whenever we change the camera angle.
      // left unimplemented for now since there is only one named camera (closeUp)
      case ('animateToNamedCamera'): {
        // console.warn('animateToNamedCamera handler not yet implemented', message);
        break;
      }

      case ('stopRecognize'): {
        break;
      }

      case ('startRecognize'): {
        break;
      }

      default: {
        console.warn(`unknown message type: ${message.name}`, message);
      }
    }
    return true;
  };

  // create instance of Persona class w/ scene instance
  persona = new Persona(scene, PERSONA_ID);

  /* CONNECT TO PERSONA */
  try {
    // get signed JWT from token server so we can connect to Persona server
    let jwt = null;
    let url = null;
    if (AUTH_MODE === 1) {
      const [tokenErr, tokenRes] = await to(fetch(TOKEN_ISSUER, { method: 'POST' }));
      if (tokenErr) return thunk.rejectWithValue({ msg: 'error fetching token! is this endpoint CORS authorized?' });
      const res = await tokenRes.json();
      jwt = res.jwt;
      url = res.url;
    }

    // connect to Persona server
    const retryOptions = {
      maxRetries: 20,
      delayMs: 500,
    };
    const [err] = await to(scene.connect(url, '', jwt, retryOptions));
    if (err) {
      switch (err.name) {
        case 'notSupported':
        case 'noUserMedia': {
          return thunk.rejectWithValue({ msg: 'permissionsDenied', err: { ...err } });
        }
        default: {
          return thunk.rejectWithValue({ msg: 'generic', err: { ...err } });
        }
      }
    }
    // we can't disable logging until after the connection is established
    // logging is pretty crowded, not recommended to enable
    // unless you need to debug emotional data from webcam
    scene.session().setLogging(false);

    // set video dimensions
    const { videoWidth, videoHeight } = thunk.getState().sm;
    // calc resolution w/ device pixel ratio
    const deviceWidth = Math.round(videoWidth * window.devicePixelRatio);
    const deviceHeight = Math.round(videoHeight * window.devicePixelRatio);
    scene.sendVideoBounds(deviceWidth, deviceHeight);

    // create proxy of webcam video feed if user has granted us permission

    // since we can't store the userMediaStream in the store since it's not serializable,
    // we use an external proxy for video streams
    const { userMediaStream: stream } = scene.session();
    // detect if we're running audio-only
    const videoEnabled = requestedMediaPerms.camera
      && stream !== undefined
      && 'getVideoTracks' in stream
      && stream.getVideoTracks().length > 0;
    if (videoEnabled === false) thunk.dispatch(actions.setCameraState({ cameraOn: false }));
    // pass dispatch before calling setUserMediaStream so proxy can send dimensions to store
    mediaStreamProxy.passDispatch(thunk.dispatch);
    mediaStreamProxy.setUserMediaStream(stream, videoEnabled);
    mediaStreamProxy.enableToggle(scene);

    // fulfill promise, reducer sets state to indicate loading and connection are complete
    return thunk.fulfillWithValue();
  } catch (err) {
    return thunk.rejectWithValue(err);
  }
});

// send plain text to the persona.
// usually used for typed input or UI elems that trigger a certain phrase
export const sendTextMessage = createAsyncThunk('sm/sendTextMessage', async ({ text }, thunk) => {
  if (text === '') return thunk.rejectWithValue('submitted empty string!');
  if (scene !== null && persona !== null) {
    if (ORCHESTRATION_MODE === true) scene.sendUserText(text);
    else persona.conversationSend(text);
    return thunk.dispatch(actions.addConversationResult({
      source: 'user',
      text,
    }));
  } return thunk.rejectWithValue('not connected to persona!');
});

const smSlice = createSlice({
  name: 'sm',
  initialState,
  reducers: {
    setTOS: (state, { payload }) => ({
      ...state,
      tosAccepted: payload.accepted,
    }),
    setShowTranscript: (state, { payload }) => ({
      ...state,
      showTranscript: payload?.showTranscript || !state.showTranscript,
    }),
    setRequestedMediaPerms: (state, { payload }) => {
      const requestedMediaPerms = {
        camera: 'camera' in payload ? payload.camera : state.requestedMediaPerms.camera,
        mic: 'mic' in payload ? payload.mic : state.requestedMediaPerms.mic,
      };
      localStorage.setItem('requestedMediaPerms', JSON.stringify(requestedMediaPerms));
      return ({
        ...state,
        requestedMediaPerms,
      });
    },
    setCameraState: (state, { payload }) => ({
      ...state,
      cameraOn: payload.cameraOn,
      cameraWidth: payload.cameraWidth || state.cameraWidth,
      cameraHeight: payload.cameraHeight || state.cameraHeight,
    }),
    setActiveCards: (state, { payload }) => ({
      ...state,
      activeCards: payload.activeCards || [],
    }),
    stopSpeaking: () => {
      if (!persona) return console.error('persona not initiated!');
      return persona.stopSpeaking();
    },
    setMicOn: (state, { payload }) => {
      if (!scene) return console.error('scene not initiated!');
      const { micOn } = payload;
      scene.setMediaDeviceActive({
        microphone: micOn,
      });
      return ({ ...state, micOn });
    },
    setCameraOn: (state, { payload }) => {
      if (!scene) return console.error('scene not initiated!');
      const { cameraOn } = payload;
      scene.setMediaDeviceActive({
        camera: cameraOn,
      });
      return ({ ...state, cameraOn });
    },
    setMediaDevices: (state, { payload }) => {
      if (!scene) return console.error('scene not initiated!');
      const { cameraOn, micOn } = payload;
      scene.setMediaDeviceActive({
        camera: cameraOn,
        mic: cameraOn,
      });
      return ({ ...state, cameraOn, micOn });
    },
    setOutputMute: (state, { payload }) => {
      const { isOutputMuted } = payload;
      proxyVideo.muted = isOutputMuted ? 'muted' : null;
      return ({ ...state, isOutputMuted });
    },
    setIntermediateUserUtterance: (state, { payload }) => ({
      ...state,
      intermediateUserUtterance: payload.text,
      userSpeaking: true,
    }),
    addConversationResult: (state, { payload }) => {
      // we record both text and content cards in the transcript
      if (payload.text !== '' || 'card' in payload !== false) {
        const { source } = payload;
        const newEntry = { source, timestamp: new Date().toISOString() };
        // handle entering either text or card into transcript array
        if ('text' in payload) newEntry.text = payload.text;
        if ('card' in payload) newEntry.card = payload.card;
        const out = {
          ...state,
          transcript: [...state.transcript, { ...newEntry }],
          intermediateUserUtterance: '',
          userSpeaking: false,
        };
        // copy any text to last___Utterance, used for captions and user confirmation of STT
        if ('text' in payload) {
          out[
            payload.source === 'user' ? 'lastUserUtterance' : 'lastPersonaUtterance'
          ] = payload.text;
        }
        return out;
      } return console.warn('addConversationResult: ignoring empty string');
    },
    setSpeechState: (state, { payload }) => ({
      ...state,
      speechState: payload.speechState,
    }),
    setEmotionState: (state, { payload }) => ({
      ...state,
      user: {
        ...state.user,
        emotion: payload.emotion,
      },
    }),
    setConversationState: (state, { payload }) => ({
      ...state,
      user: {
        ...state.user,
        conversation: payload.conversation,
      },
    }),
    setActivityState: (state, { payload }) => ({
      ...state,
      user: {
        ...state.user,
        activity: payload.activity,
      },
    }),
    setCallQuality: (state, { payload }) => ({
      ...state,
      callQuality: payload.callQuality,
    }),
    setVideoDimensions: (state, { payload }) => {
      const { videoWidth, videoHeight } = payload;
      // update video dimensions in persona
      // calc resolution w/ device pixel ratio
      const deviceWidth = Math.round(videoWidth * window.devicePixelRatio);
      const deviceHeight = Math.round(videoHeight * window.devicePixelRatio);
      scene.sendVideoBounds(deviceWidth, deviceHeight);
      return { ...state, videoWidth, videoHeight };
    },
    disconnect: (state) => {
      scene = null;
      persona = null;
      const { error } = state;
      return {
        // completely reset SM state on disconnect, except for errors
        ...initialState,
        disconnected: true,
        error,
      };
    },
    keepAlive: () => {
      scene.keepAlive();
    },
    sendEvent: (state, { payload }) => {
      const { eventName, payload: eventPayload, kind } = payload;
      if (scene && persona) {
        persona.conversationSend(eventName, eventPayload || {}, { kind: kind || 'event' });
        console.log(`dispatched ${eventName}`, eventPayload);
      }
    },
    clearActiveCards: () => {
      // we don't need to modify the state, since this will propagate through
      // the scene instance and modify the active cards through the CC API
      scene.clearActiveCards();
    },
  },
  extraReducers: {
    [createScene.pending]: (state) => ({
      ...state,
      loading: true,
      disconnected: false,
      error: null,
    }),
    [createScene.fulfilled]: (state) => ({
      ...state,
      loading: false,
      connected: true,
      error: null,
    }),
    [createScene.rejected]: (state, { payload }) => {
      try {
        scene.disconnect();
      } catch {
        console.error('no scene to disconnect! continuing...');
      }
      // if we call this immediately the disconnect call might not complete
      setTimeout(() => {
        scene = null;
        persona = null;
      }, 100);
      return ({
        ...state,
        loading: false,
        connected: false,
        error: { ...payload },
      });
    },
  },
});

// hoist actions to top of file so thunks can access
actions = smSlice.actions;

export const {
  setVideoDimensions,
  stopSpeaking,
  setActiveCards,
  setCameraState,
  setMediaDevices,
  setCameraOn,
  setMicOn,
  setShowTranscript,
  setTOS,
  setRequestedMediaPerms,
  setOutputMute,
  keepAlive,
  sendEvent,
  clearActiveCards,
} = smSlice.actions;

export default smSlice.reducer;
