import { useRef } from "react";

import { combineReducers, configureStore } from "@reduxjs/toolkit";
import { persistStore, persistReducer } from "redux-persist";

// Provider
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";

import createWebStorage from "redux-persist/lib/storage/createWebStorage";

// REDUX SLICES
import userReducer from "./user/userSlice";
import globalReducer from "./global";
import authReducer from "./auth/authSlice";
import adminReducer from "./admin/adminSlice";
import employeeReducer from "./employee/employeeSlice";
import moderatorReducer from "./moderator/moderatorSlice";
import registrationReducer from "./auth/registrationSlice";
import cookieReducer from "./helper/slice/cookieSlice";

// API
import { api } from "./api";
import { authApi } from "./auth/authApi";
import { userApi } from "./user/userApi";
import { adminApi } from "./admin/adminApi";

// Types
export type AppStore = ReturnType<typeof makeStore>;
export type RootState = ReturnType<AppStore["getState"]>;
export type AppDispatch = AppStore["dispatch"];

// Hooks
import { TypedUseSelectorHook, useDispatch, useSelector } from "react-redux";
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

const createNoopStorage = () => ({
  getItem(_key: string) {
    return Promise.resolve(null);
  },
  setItem(_key: string, _value: string) {
    return Promise.resolve();
  },
  removeItem(_key: string) {
    return Promise.resolve();
  },
});

const storage =
  typeof window === "undefined"
    ? createNoopStorage()
    : createWebStorage("local");

const persistConfig = {
  key: "root",
  storage,
  whitelist: ["global", "cookie", "auth"],
};

const rootReducer = combineReducers({
  user: userReducer,
  global: globalReducer,
  cookie: cookieReducer,
  auth: authReducer,
  admin: adminReducer,
  employee: employeeReducer,
  moderator: moderatorReducer,
  registration: registrationReducer,

  [api.reducerPath]: api.reducer,
  [authApi.reducerPath]: authApi.reducer,
  [userApi.reducerPath]: userApi.reducer,
  [adminApi.reducerPath]: adminApi.reducer,
});

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const makeStore = () => {
  return configureStore({
    reducer: persistedReducer,
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({
        serializableCheck: {
          ignoredActions: [
            "persist/PERSIST",
            "persist/REHYDRATE",
            "persist/FLUSH",
            "persist/PAUSE",
            "persist/PURGE",
            "persist/REGISTER",
          ],
        },
      }).concat(
        api.middleware,
        authApi.middleware,
        userApi.middleware,
        adminApi.middleware
      ),
  });
};

export default function StoreProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const storeRef = useRef<AppStore | null>(null);
  if (!storeRef.current) {
    storeRef.current = makeStore();
  }
  const persistor = persistStore(storeRef.current);
  return (
    <Provider store={storeRef.current}>
      <PersistGate loading={null} persistor={persistor}>
        {children}
      </PersistGate>
    </Provider>
  );
}
