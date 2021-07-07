import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { smwebsdk } from '@soulmachines/smwebsdk';
import proxyVideo from '../../proxyVideo';

const ORCHESTRATION_MODE = false;
const TOKEN_ISSUER = 'https://localhost:5000/auth/authorize';

const initialState = {
  connected: false,
  loading: false,
  error: null,
  videoHeight: window.innerHeight,
  videoWidth: window.innerWidth,
  transcript: [],
  speechState: 'idle',
  user: {
    activity: {
      isAttentive: 0,
      isTalking: 0,
      diffSum: 0,
    },
    emotion: {
      confusion: 0,
      negativity: 0,
      positivity: 0,
      confidence: 0,
      diffSum: 0,
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
        diffSum: 0,
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

// stuff like emotional data has way more decimal places than is useful
// this function rounds the values and provides a sum to diff w/ existing state
const roundAndSumObject = (o) => {
  let diffSum = 0;
  const output = {};
  Object.keys(o).forEach((k) => {
    output[k] = Math.floor(o[k] * 10) / 10;
    // don't add diffSum to itself, since it's stored in the object
    if (k !== 'diffSum') diffSum += output[k];
  });
  return [output, diffSum];
};

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
  scene.onMessage = (message) => {
    switch (message.name) {
      // handles output from TTS (what user said)
      case ('recognizeResults'): {
        const output = message.body.results[0];
        // we get multiple recognizeResults messages, so only add the final one to transcript
        if (output.final === false) break;
        const { transcript: text } = output.alternatives[0];
        const action = actions.addConversationResult({
          source: 'user',
          text,
        });
        return thunk.dispatch(action);
      }

      // handles output from NLP (what DP is saying)
      case ('conversationResult'): {
        const { text } = message.body.output;
        const action = actions.addConversationResult({
          source: 'persona',
          text,
        });
        return thunk.dispatch(action);
      }

      case ('personaResponse'): {
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
            const userState = personaState.users[0];

            // we get emotional data from webcam feed
            if ('emotion' in userState) {
              const { emotion } = userState;
              const [roundedEmotion, emotionDiffSum] = roundAndSumObject(emotion);
              // it's ok to assign this before dispatching the event since this doesn't
              // change the value in the store until after dispatch
              roundedEmotion.diffSum = emotionDiffSum;
              // get the old diff sum and compare
              const { diffSum } = thunk.getState().sm.user.emotion;
              if (diffSum !== emotionDiffSum) {
                const action = actions.setEmotionState({ emotion: roundedEmotion });
                thunk.dispatch(action);
              }
            }

            if ('activity' in userState) {
              const { activity } = userState;
              const [roundedActivity, activityDiffSum] = roundAndSumObject(activity);
              roundedActivity.diffSum = activityDiffSum;
              // add all activity values, only dispatch action if sum is different
              const { diffSum } = thunk.getState().sm.user.activity;
              if (diffSum !== activityDiffSum) {
                const action = actions.setActivityState({ activity: roundedActivity });
                thunk.dispatch(action);
              }
            }

            if ('conversation' in userState) {
              const { conversation } = userState;
              // console.log('balls', conversation);
              const { context } = conversation;
              const [roundedContext, contextDiffSum] = roundAndSumObject(context);
              const { diffSum } = thunk.getState().sm.user.conversation.context;
              if (diffSum !== contextDiffSum) {
                const action = actions.setConversationState({
                  conversation: {
                    ...conversation,
                    context: roundedContext,
                  },
                });
                thunk.dispatch(action);
              }
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

  // copied from old template, not sure if there are other possible values for this?
  const PERSONA_ID = '1';
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
    const { videoWidth, videoHeight } = thunk.getState();
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
export const sendTextMessage = createAsyncThunk('sm/sendTextMessage', async (text, thunk) => {
  if (scene && persona) {
    if (ORCHESTRATION_MODE) scene.sendUserText(text);
    else persona.conversationSend(text);
    thunk.fulfillWithValue(`sent: ${text}!`);
  } else thunk.rejectWithValue('not connected to persona!');
});

const smSlice = createSlice({
  name: 'sm',
  initialState,
  reducers: {
    addConversationResult: (state, { payload }) => ({
      ...state,
      transcript: [...state.transcript, {
        source: payload.source,
        text: payload.text,
        timestamp: new Date().toISOString(),
      }],
    }),
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

export const { setVideoDimensions } = smSlice.actions;

export default smSlice.reducer;
