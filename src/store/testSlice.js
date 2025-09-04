// src/store/testSlice.js
import { createSlice } from "@reduxjs/toolkit";

// Try to load from localStorage
const persistedTestId = localStorage.getItem("testId");
const persistedUserId = localStorage.getItem("userId");

const initialState = {
  testId: persistedTestId ? Number(persistedTestId) : null,
  userId: persistedUserId ? Number(persistedUserId) : null,
};

const testSlice = createSlice({
  name: "test",
  initialState,
  reducers: {
    setTestData: (state, action) => {
      state.testId = action.payload.testId;
      state.userId = action.payload.userId;
      localStorage.setItem("testId", action.payload.testId);
      localStorage.setItem("userId", action.payload.userId);
    },
    clearTestData: (state) => {
      state.testId = null;
      state.userId = null;
      localStorage.removeItem("testId");
      localStorage.removeItem("userId");
    },
  },
});

export const { setTestData, clearTestData } = testSlice.actions;
export default testSlice.reducer;
