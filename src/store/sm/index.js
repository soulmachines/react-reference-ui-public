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
};

// we need to define an object for actions here, since we need the types to be avaliable for
// async calls later, e.g. handling messages from persona
let actions;
let persona = null;
let scene = null;

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
      case ('state'): {
        break;
      }
      case ('activation'): {
        break;
      }
      default: {
        console.warn(`unknown message type ${message.name}`, message);
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
        ...payload,
        timestamp: new Date().toISOString(),
      }],
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

actions = smSlice.actions;

export const { setVideoDimensions } = smSlice.actions;

export default smSlice.reducer;
