
import { configureStore } from '@reduxjs/toolkit';

const store = configureStore({
  reducer: {
    // reducers shu yerga yoziladi
    // example: user: userReducer,
  },
});

export default store;