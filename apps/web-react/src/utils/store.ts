/**
 * StoreService — Quản lý token trong localStorage
 * Theo pattern của vfan/utils/store.ts
 */
import { Keys } from '@/const';

const PREFIX = 'fda.t1';

const getRealKey = (key: string) => PREFIX + key;

export const getAuthToken = (): string | null => {
  try {
    return localStorage.getItem(getRealKey(Keys.authToken));
  } catch {
    return null;
  }
};

export const setAuthToken = (token: string | null) => {
  try {
    if (token) {
      localStorage.setItem(getRealKey(Keys.authToken), token);
    } else {
      localStorage.removeItem(getRealKey(Keys.authToken));
    }
  } catch {
    // ignore
  }
};

export const getRefreshToken = (): string | null => {
  try {
    return localStorage.getItem(getRealKey(Keys.refreshToken));
  } catch {
    return null;
  }
};

export const setRefreshToken = (token: string | null) => {
  try {
    if (token) {
      localStorage.setItem(getRealKey(Keys.refreshToken), token);
    } else {
      localStorage.removeItem(getRealKey(Keys.refreshToken));
    }
  } catch {
    // ignore
  }
};

export const StoreService = {
  getAuthToken,
  setAuthToken,
  getRefreshToken,
  setRefreshToken,
};
