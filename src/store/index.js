import { configureStore, getDefaultMiddleware } from '@reduxjs/toolkit';
import smReducer from './sm';

const store = configureStore({
  reducer: {
    sm: smReducer,
  },
  middleware: getDefaultMiddleware({
    serializableCheck: {
      ignoredActionPaths: ['payload.personaVideoObject'],
      ignoredPaths: ['sm.personaVideoObject'],
    },
  }),
});

export default store;
