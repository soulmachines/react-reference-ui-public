import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { smwebsdk } from '@soulmachines/smwebsdk';
import proxyVideo from '../../proxyVideo';
import roundObject from '../../utils/roundObject';

const ORCHESTRATION_MODE = false;
const TOKEN_ISSUER = 'https://localhost:5000/auth/authorize';
// copied from old template, not sure if there are other possible values for this?
const PERSONA_ID = '1';
const CAMERA_ID = 'CloseUp';

const initialState = {
  connected: false,
  loading: false,
  error: null,
  isMuted: false,
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
};

// we need to define an object for actions here, since we need the types to be avaliable for
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
export const mute = createAsyncThunk('sm/mute', async (args, thunk) => {
  const { isMuted } = thunk.getState().sm;
  if (scene) {
    const muteState = !isMuted;
    const command = `${muteState ? 'stop' : 'start'}Recognize`;
    scene.sendRequest(command, {});
    thunk.dispatch(actions.setMute({ isMuted: muteState }));
  } else { console.warn('muting not possible, no active scene!'); }
});

// handles both manual disconnect or automatic timeout due to innactivity
export const disconnect = createAsyncThunk('sm/disconnect', async (args, thunk) => {
  if (scene) scene.disconnect();
  setTimeout(() => {
    thunk.dispatch(actions.disconnect());
    scene = null;
    persona = null;
  }, 500);
});

export const createScene = createAsyncThunk('sm/createScene', async (audioOnly = false, thunk) => {
  /* CREATE SCENE */
  // request permissions from user
  const { microphone, microphoneAndCamera } = smwebsdk.userMedia;
  const requestedUserMedia = audioOnly ? microphone : microphoneAndCamera;
  // create instance of Scene w/ granted permissions
  scene = new smwebsdk.Scene(
    proxyVideo,
    false,
    requestedUserMedia,
    microphone,
  );
  /* BIND HANDLERS */
  scene.onDisconnected = () => thunk.dispatch(disconnect());
  scene.onMessage = (message) => {
    switch (message.name) {
      // handles output from TTS (what user said)
      case ('recognizeResults'): {
        const output = message.body.results[0];
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

      // activate content cards when called for
      case ('speechMarker'): {
        const { name: speechMarkerName, arguments: args } = message.body;
        switch (speechMarkerName) {
          case ('showcards'): {
            const { activeCards, contentCards, cardsAreStale } = thunk.getState().sm;
            // if desired, multiple content cards can be displayed in one turn
            const oldCards = cardsAreStale ? [] : activeCards;
            const newCards = args.map((a) => contentCards[a]);
            const newActiveCards = [...oldCards, ...newCards];
            thunk.dispatch(actions.setActiveCards({ activeCards: newActiveCards }));
            break;
          }
          case ('hidecards'): {
            thunk.dispatch(actions.setActiveCards({}));
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
        // filter out $cardName.orignal, we just want values for $cardName
        const relevantKeys = Object.keys(context).filter((k) => /\.original/gm.test(k) === false);
        const contentCards = {};
        // eslint-disable-next-line array-callback-return
        relevantKeys.map((k) => {
          // remove public- prefix from key
          const cardKey = k.match(/(?<=public-)(.*)/gm)[0];
          try {
            contentCards[cardKey] = JSON.parse(context[k]);
          } catch {
            console.error(`invalid JSON in content card payload for ${k}!`);
          }
        });
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
            const userState = personaState.users[0];

            // we get emotional data from webcam feed
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

      // activation events i think are some kind of emotional metadata
      case ('activation'): {
        // console.warn('activation handler not yet implemented', message);
        break;
      }

      default: {
        console.warn(`unknown message type: ${message.name}`, message);
      }
    }
  };

  // create instance of Persona class w/ scene instance
  persona = new smwebsdk.Persona(scene, PERSONA_ID);

  /* CONNECT TO PERSONA */
  try {
    // get signed JWT from token server so we can connect to Persona serverj
    const res = await fetch(TOKEN_ISSUER, { method: 'POST' });
    const { url, jwt } = await res.json();

    // connect to Persona server
    const retryOptions = {
      maxRetries: 20,
      delayMs: 500,
    };
    await scene.connect(url, '', jwt, retryOptions);

    // we can't disable logging until after the connection is established
    // logging is pretty crowded, not reccommended to enable
    // unless you need to debug emotional data from webcam
    scene.session().setLogging(false);

    // set video dimensions
    const { videoWidth, videoHeight } = thunk.getState().sm;
    scene.sendVideoBounds(videoWidth, videoHeight);

    // fulfill promise, reducer sets state to indiate loading and connection are complete
    return thunk.fulfillWithValue();
  } catch (err) {
    // TODO: try to handle blocked permissions a la https://github.com/soulmachines/cs-gem-poc-ui/blob/9c4ce7f475e0ec1b34a80d8271dd5bf81134cfb9/src/contexts/SoulMachines.js#L436
    return thunk.rejectWithValue(err);
  }
});

// send plain text to the persona.
// usually used for typed input or UI elems that trigger a certain phrase
export const sendTextMessage = createAsyncThunk('sm/sendTextMessage', async ({ text }, thunk) => {
  if (scene && persona) {
    if (ORCHESTRATION_MODE) scene.sendUserText(text);
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

const smSlice = createSlice({
  name: 'sm',
  initialState,
  reducers: {
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
      if (payload.text !== '') {
        return ({
          ...state,
          transcript: [...state.transcript, {
            source: payload.source,
            text: payload.text,
            timestamp: new Date().toISOString(),
          }],
          [payload.source === 'user' ? 'lastUserUtterance' : 'lastPersonaUtterance']: payload.text,
          intermediateUserUtterance: '',
          userSpeaking: false,
        });
      } console.warn('addConversationResult: ignoring empty string');
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
      scene.sendVideoBounds(videoWidth, videoHeight);
      return { ...state, videoWidth, videoHeight };
    },
    disconnect: () => {
      scene.onMessage = null;
      scene.onDisconnected = null;
      scene = null;
      persona = null;
      return {
      // completely reset SM state on disconnect
        ...initialState,
      };
    },
  },
  extraReducers: {
    [createScene.pending]: (state) => ({
      ...state,
      loading: true,
    }),
    [createScene.fulfilled]: (state) => ({
      ...state,
      loading: false,
      connected: true,
    }),
    [createScene.rejected]: (state, { error }) => ({
      ...state,
      loading: false,
      connected: false,
      error,
    }),
  },
});

// hoist actions to top of file so thunks can access
actions = smSlice.actions;

export const { setVideoDimensions, stopSpeaking, setActiveCards } = smSlice.actions;

export default smSlice.reducer;
