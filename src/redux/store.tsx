import { configureStore, combineReducers } from "@reduxjs/toolkit";
import { persistStore, persistReducer } from "redux-persist";
import storage from "redux-persist/lib/storage";
import adminReducer from "./slice/adminSlice";
import authReducer from "./slice/studentSlice";
import tutorReducer from "./slice/tutorSlice";

// Combine all reducers
const rootReducer = combineReducers({
  admin: adminReducer,
  auth: authReducer,
  tutor: tutorReducer,
});

// Persist config
const persistConfig = {
  key: "root",
  storage,
  whitelist: ["auth", "admin", "tutor"], // Only these slices will be persisted
};

// Persisted root reducer
const persistedReducer = persistReducer(persistConfig, rootReducer);

// Store setup
const store = configureStore({
  reducer: persistedReducer,  
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,  
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// Persistor
export const persistor = persistStore(store);

export default store;
