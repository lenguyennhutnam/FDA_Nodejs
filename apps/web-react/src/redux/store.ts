// /**
//  * store.ts — Redux store với redux-persist
//  * Theo pattern vfan/redux/store.ts
//  * Token KHÔNG được persist trong Redux state (chỉ dùng localStorage qua StoreService)
//  */
// import { combineReducers, configureStore } from '@reduxjs/toolkit';
// import {
//   FLUSH, PAUSE, PERSIST, persistReducer, persistStore,
//   PURGE, REGISTER, REHYDRATE,
// } from 'redux-persist';
// import storage from 'redux-persist/lib/storage';
// import createTransform from 'redux-persist/es/createTransform';

// import authReducer, { type AuthState } from './auth/auth.slice';
// import globalReducer from './global/global.slice';

// // Transform: không persist token trong redux state (đã lưu riêng ở localStorage)
// const authTransform = createTransform(
//   (inboundState: AuthState) => {
//     const { token, refresh_token, ...rest } = inboundState;
//     // suppress unused variable warnings
//     void token; void refresh_token;
//     return rest;
//   },
//   (outboundState: AuthState) => outboundState,
//   { whitelist: ['auth'] }
// );

// const rootReducer = combineReducers({
//   auth: authReducer,
//   global: globalReducer,
// });

// const persistConfig = {
//   key: 'fda-root',
//   storage,
//   whitelist: ['auth', 'global'],
//   transforms: [authTransform],
// };

// const persistedReducer = persistReducer(persistConfig, rootReducer);

// export const store = configureStore({
//   reducer: persistedReducer,
//   middleware: (getDefaultMiddleware) =>
//     getDefaultMiddleware({
//       serializableCheck: {
//         ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
//       },
//     }),
//   devTools: import.meta.env.VITE_API_URL !== 'production',
// });

// export const persistor = persistStore(store);

// // Types
// export type RootState = ReturnType<typeof store.getState>;
// export type AppDispatch = typeof store.dispatch;
/**
 * store.ts — Redux store với redux-persist
 * Theo pattern vfan/redux/store.ts
 * Token KHÔNG được persist trong Redux state (chỉ dùng localStorage qua StoreService)
 */
import { combineReducers, configureStore } from '@reduxjs/toolkit';
import {
  FLUSH, PAUSE, PERSIST, persistReducer, persistStore,
  PURGE, REGISTER, REHYDRATE,
} from 'redux-persist';
// Thay đổi import: Không dùng import default của redux-persist/lib/storage nữa
import createWebStorage from 'redux-persist/es/storage/createWebStorage';
import createTransform from 'redux-persist/es/createTransform';

import authReducer, { type AuthState } from './auth/auth.slice';
import globalReducer from './global/global.slice';

// Tạo bộ nhớ tạm (noop storage) để tránh lỗi khi render phía Server (SSR / Node) hoặc trong các môi trường build đặc biệt
const createNoopStorage = () => {
  return {
    getItem(_key: string) {
      return Promise.resolve(null);
    },
    setItem(_key: string, value: any) {
      return Promise.resolve(value);
    },
    removeItem(_key: string) {
      return Promise.resolve();
    },
  };
};

// Cấu hình storage an toàn, tương thích tốt với Vite và môi trường Server
const storage = typeof window !== 'undefined'
  ? createWebStorage('local')
  : createNoopStorage();

// Transform: không persist token trong redux state (đã lưu riêng ở localStorage)
const authTransform = createTransform(
  (inboundState: AuthState) => {
    const { token, refresh_token, ...rest } = inboundState;
    // suppress unused variable warnings
    void token; void refresh_token;
    return rest;
  },
  (outboundState: AuthState) => outboundState,
  { whitelist: ['auth'] }
);

const rootReducer = combineReducers({
  auth: authReducer,
  global: globalReducer,
});

const persistConfig = {
  key: 'fda-root',
  storage, // Sử dụng đối tượng storage an toàn đã khởi tạo ở trên
  whitelist: ['auth', 'global'],
  transforms: [authTransform],
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
  devTools: import.meta.env.VITE_API_URL !== 'production',
});

export const persistor = persistStore(store);

// Types
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;