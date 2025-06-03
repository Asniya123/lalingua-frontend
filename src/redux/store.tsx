// src/redux/store.ts

import { configureStore, combineReducers } from "@reduxjs/toolkit";
import { persistStore, persistReducer } from "redux-persist";
import storage from "redux-persist/lib/storage";
import adminReducer from "./slice/adminSlice";
import authReducer from "./slice/studentSlice";
import tutorReducer from "./slice/tutorSlice";
import { useDispatch } from "react-redux";
import { injectStore } from "../api/tutorInstance"; 

const rootReducer = combineReducers({
  admin: adminReducer,
  auth: authReducer,
  tutor: tutorReducer,
});

const persistConfig = {
  key: "root",
  storage,
  whitelist: ["auth", "admin", "tutor"],
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ["persist/PERSIST", "persist/REHYDRATE"],
        ignoredPaths: ["tutor.updateTutorProfile.profileData", "register"],
      },
    }),
});


injectStore(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export const useAppDispatch: () => AppDispatch = useDispatch;

export const persistor = persistStore(store);

export default store;
