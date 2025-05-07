
import { configureStore, combineReducers } from "@reduxjs/toolkit";
import { persistStore, persistReducer } from "redux-persist";
import storage from "redux-persist/lib/storage";
import adminReducer from "./slice/adminSlice.js";
import authReducer from "./slice/studentSlice.js";
import tutorReducer from "./slice/tutorSlice.js";
import { useDispatch } from "react-redux";

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
      serializableCheck: false,
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export const useAppDispatch: () => AppDispatch = useDispatch;

export const persistor = persistStore(store);

export default store;