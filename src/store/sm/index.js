import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { smwebsdk } from '@soulmachines/smwebsdk';
import to from 'await-to-js';
import proxyVideo, { mediaStreamProxy } from '../../proxyVideo';
import roundObject from '../../utils/roundObject';
import { meatballString } from './meatball';

const ORCHESTRATION_MODE = process.env.REACT_APP_ORCHESTRATION_MODE || false;
const TOKEN_ISSUER = process.env.REACT_APP_TOKEN_URL;
const PERSONA_ID = '1';
const CAMERA_ID = 'CloseUp';

const initialState = {
  tosAccepted: false,
  connected: false,
  disconnected: false,
  loading: false,
  error: null,
  isMuted: false,
  typingOnly: false,
  videoHeight: window.innerHeight,
  videoWidth: window.innerWidth,
  transcript: [],
  activeCards: [],
  // lets us keep track of whether the content cards were added in this turn
  cardsAreStale: false,
  contentCards: {},
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
  cameraOn: true,
  // default to 1 because these values are used to compute an aspect ratio,
  // so if for some reason the camera is disabled, it will default to a square (1:1)
  cameraWidth: 1,
  cameraHeight: 1,
  showTranscript: false,
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
  if (!scene) console.error('cannot animate camera, scene not initiated!');

  scene.sendRequest('animateToNamedCamera', {
    cameraName: CAMERA_ID,
    personaId: PERSONA_ID,
    time: duration || 1,
    ...options,
  });
});

// tells persona to stop listening to mic input
export const mute = createAsyncThunk('sm/mute', async (specifiedMuteState, thunk) => {
  const { isMuted } = thunk.getState().sm;
  if (scene) {
    // if arg is a boolean use it, otherwise just toggle.
    // sometimes events from button clicks are passed in, so we need to filter for that
    const muteState = typeof specifiedMuteState === 'boolean' ? !!specifiedMuteState : !isMuted;
    if (muteState === true) scene.stopRecognize();
    else scene.startRecognize();
    thunk.dispatch(actions.setMute({ isMuted: muteState }));
  } else { console.warn('muting not possible, no active scene!'); }
});

// handles both manual disconnect or automatic timeout due to inactivity
export const disconnect = createAsyncThunk('sm/disconnect', async (args, thunk) => {
  if (scene) scene.disconnect();
  setTimeout(() => {
    thunk.dispatch(actions.disconnect());
    scene = null;
    persona = null;
  }, 500);
});

export const createScene = createAsyncThunk('sm/createScene', async (typingOnly = false, thunk) => {
  /* CREATE SCENE */
  if (scene instanceof smwebsdk.Scene) {
    return console.error('warning! you attempted to create a new scene, when one already exists!');
  }
  // request permissions from user and create instance of Scene and ask for webcam/mic permissions
  const { microphone, microphoneAndCamera, none } = smwebsdk.userMedia;
  try {
    scene = new smwebsdk.Scene(
      proxyVideo,
      // audio only toggle, but this is set automatically if user denies camera permissions.
      // change value if your application needs to have an explicit audio-only mode.
      false,
      // requested permissions
      typingOnly ? none : microphoneAndCamera,
      // if user denies camera and mic permissions, smwebsdk will request mic only for us
      // required permissions
      typingOnly ? none : microphone,
    );
  } catch (e) {
    console.error(e);
  }

  /* BIND HANDLERS */
  scene.onDisconnected = () => thunk.dispatch(disconnect());
  // store a ref to the smwebsdk onmessage so that we can
  // use the callback while also calling the internal version
  const smwebsdkOnMessage = scene.onMessage.bind(scene);
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
        const { cardsAreStale } = thunk.getState().sm;
        if (cardsAreStale === true) thunk.dispatch(actions.setActiveCards({}));
        thunk.dispatch(actions.addConversationResult({
          source: 'persona',
          text: currentSpeech,
        }));
        break;
      }

      // handle speech markers
      case ('speechMarker'): {
        const { name: speechMarkerName, arguments: args } = message.body;
        switch (speechMarkerName) {
          case ('showcards'): {
            const { activeCards, contentCards, cardsAreStale } = thunk.getState().sm;
            // if desired, multiple content cards can be displayed in one turn
            const oldCards = cardsAreStale ? [] : activeCards;
            // this will only ever be one card
            const newCards = args.map((a) => contentCards[a]);
            const newActiveCards = [...oldCards, ...newCards];
            thunk.dispatch(actions.setActiveCards({ activeCards: newActiveCards }));
            // send card to transcript as well
            thunk.dispatch(actions.addConversationResult({
              source: 'persona',
              card: newCards[0],
            }));
            break;
          }
          case ('hidecards'): {
            thunk.dispatch(actions.setActiveCards({}));
            break;
          }
          case ('feature'): {
            console.log(message.body);
            const { arguments: featureArgs } = message.body;
            const feature = featureArgs[0];
            const featureState = featureArgs[1];
            switch (feature) {
              case ('microphone'): {
                if (featureState === 'on') thunk.dispatch(mute(false));
                else if (featureState === 'off') thunk.dispatch(mute(true));
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
            console.warn(`unregonized speech marker: ${speechMarkerName}`);
          }
        }
        break;
      }

      // pull out content card data from contexts
      case ('conversationResult'): {
        // get content cards from context
        const { context } = message.body.output;
        // filter out $cardName.original, we just want values for $cardName
        const relevantKeys = Object.keys(context).filter((k) => /\.original/gm.test(k) === false);
        let contentCards = {};
        relevantKeys.forEach((k) => {
          // remove public- prefix from key
          const cardKey = k.match(/public-(.*)/m)[1];
          try {
            contentCards[cardKey] = JSON.parse(context[k]);
          } catch {
            console.error(`invalid JSON in content card payload for ${k}!`);
          }
        });
        // also consume DF custom payload
        const fulfillmentMessages = message
          .body?.provider?.meta?.dialogflow?.queryResult?.fulfillmentMessages;
        if (fulfillmentMessages) {
          fulfillmentMessages.forEach((m) => {
            if ('payload' in m && 'soulmachines' in m.payload) {
              contentCards = { ...contentCards, ...m.payload.soulmachines };
            }
          });
        }
        thunk.dispatch(actions.addContentCards({ contentCards }));
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
            // when DP starts idling ie its turn ends, set contentCardsStale to true
            if (speechState === 'idle') {
              const { activeCards } = thunk.getState().sm;
              thunk.dispatch(actions.setActiveCards({ activeCards, cardsAreStale: true }));
            }
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
  persona = new smwebsdk.Persona(scene, PERSONA_ID);

  /* CONNECT TO PERSONA */
  try {
    // get signed JWT from token server so we can connect to Persona server
    const [tokenErr, tokenRes] = await to(fetch(TOKEN_ISSUER, { method: 'POST' }));
    if (tokenErr) return thunk.rejectWithValue({ msg: 'error fetching token! is this endpoint CORS authorized?' });
    const { url, jwt } = await tokenRes.json();

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
    const videoEnabled = typingOnly === false
      && stream !== undefined
      && stream.getVideoTracks().length > 0;
    if (videoEnabled === false) thunk.dispatch(actions.setCameraState({ cameraOn: false }));
    if (typingOnly === true) thunk.dispatch(actions.setTypingOnly());
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
  if (scene && persona) {
    if (ORCHESTRATION_MODE === true) scene.sendUserText(text);
    else persona.conversationSend(text);
    thunk.dispatch(actions.addConversationResult({
      source: 'user',
      text,
    }));
  } else thunk.rejectWithValue('not connected to persona!');
});

export const sendEvent = createAsyncThunk('sm/sendEvent', async ({ payload, eventName }) => {
  if (scene && persona) {
    persona.conversationSend(eventName, payload || {}, { kind: 'event' });
    console.log(`dispatched ${eventName}`, payload);
  }
});

export const keepAlive = createAsyncThunk('sm/keepAlive', async () => {
  if (scene) {
    scene.keepAlive();
  }
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
    setTypingOnly: (state) => ({
      ...state,
      typingOnly: true,
    }),
    setCameraState: (state, { payload }) => ({
      ...state,
      cameraOn: payload.cameraOn,
      cameraWidth: payload.cameraWidth || state.cameraWidth,
      cameraHeight: payload.cameraHeight || state.cameraHeight,
    }),
    setActiveCards: (state, { payload }) => ({
      ...state,
      activeCards: payload.activeCards || [],
      cardsAreStale: payload.cardsAreStale || false,
    }),
    // content cards with the same key may get overwritten, so when the card is called
    // in @showCards(), we copy to transcript: [] and activeCards: []
    addContentCards: (state, { payload }) => ({
      ...state,
      contentCards: { ...state.contentCards, ...payload.contentCards },
    }),
    stopSpeaking: (state) => {
      if (persona) persona.stopSpeaking();
      return { ...state };
    },
    setMute: (state, { payload }) => ({
      ...state,
      isMuted: payload.isMuted,
    }),
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
      scene.disconnect();
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
  setShowTranscript,
  setTOS,
} = smSlice.actions;

export default smSlice.reducer;
