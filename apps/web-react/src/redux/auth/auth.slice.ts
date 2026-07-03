/**
 * auth.slice.ts — Quản lý trạng thái đăng nhập
 * Theo pattern của vfan/redux/auth/auth.slice.ts
 */
import type { PayloadAction } from '@reduxjs/toolkit';
import { createSlice } from '@reduxjs/toolkit';
import { StoreService } from '@/utils/store';

export interface CurrentUser {
  id: string;
  email: string;
  role: 'admin' | 'viewer';
}

export interface AuthState {
  isLogin: boolean;
  info: CurrentUser | null;
  token: string | null;
  refresh_token: string | null;
  authStatus: 'unknown' | 'authenticated' | 'unauthenticated';
}

const initialState: AuthState = {
  isLogin: false,
  info: null,
  token: null,
  refresh_token: null,
  authStatus: 'unknown',
};

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    loginSuccess: (state, action: PayloadAction<CurrentUser>) => {
      state.isLogin = true;
      state.info = action.payload;
      state.authStatus = 'authenticated';
    },
    updateInfo: (state, action: PayloadAction<CurrentUser>) => {
      state.isLogin = true;
      state.info = action.payload;
      state.authStatus = 'authenticated';
    },
    setToken: (state, action: PayloadAction<string>) => {
      state.token = action.payload;
      StoreService.setAuthToken(action.payload);
    },
    setRefreshToken: (state, action: PayloadAction<string>) => {
      state.refresh_token = action.payload;
      StoreService.setRefreshToken(action.payload);
    },
    setAuthStatus: (state, action: PayloadAction<AuthState['authStatus']>) => {
      state.authStatus = action.payload;
    },
    logout: (state) => {
      state.isLogin = false;
      state.info = null;
      state.token = null;
      state.refresh_token = null;
      state.authStatus = 'unauthenticated';
      StoreService.setAuthToken(null);
      StoreService.setRefreshToken(null);
    },
  },
});

export const {
  loginSuccess,
  updateInfo,
  setToken,
  setRefreshToken,
  setAuthStatus,
  logout,
} = authSlice.actions;

export default authSlice.reducer;
