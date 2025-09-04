// src/store/index.js
import { configureStore } from "@reduxjs/toolkit";
import testReducer from "./testSlice";

const store = configureStore({
  reducer: {
    test: testReducer,
  },
});

export default store;
