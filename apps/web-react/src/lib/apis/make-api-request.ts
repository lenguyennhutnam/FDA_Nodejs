import axios, { type AxiosInstance } from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3001/api';

const normalizeError = (error: any) => {
  const errorData = error.response?.data || error.response;
  if (errorData && typeof errorData === 'object') {
    const errorMessage = errorData.message || errorData.error || 'Có lỗi xảy ra';
    return new Error(errorMessage);
  }
  return error;
};

const _makeRequest = (instance: AxiosInstance) => async (args: any) => {
  try {
    const response = await instance({
      ...args,
      headers: {
        'Content-Type': 'application/json',
        ...args.headers,
      },
    });
    return response.data;
  } catch (error) {
    throw normalizeError(error);
  }
};

const _makeAuthRequest = (instance: AxiosInstance) => async (args: any) => {
  const token = args.token;
  try {
    const response = await instance({
      ...args,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...args.headers,
      },
    });
    return response.data;
  } catch (error) {
    throw normalizeError(error);
  }
};

import { StoreService } from '@/utils/store';

export default function createApiServices() {
  const instance = axios.create({
    baseURL: BASE_URL,
    timeout: 30000,
  });

  let isRefreshing = false;
  let failedQueue: any[] = [];

  const processQueue = (error: any, token: string | null = null) => {
    failedQueue.forEach(prom => {
      if (error) {
        prom.reject(error);
      } else {
        prom.resolve(token);
      }
    });
    failedQueue = [];
  };

  instance.interceptors.response.use(
    (response) => response,
    async (error) => {
      const originalRequest = error.config;
      
      if (error.response?.status === 401 && !originalRequest._retry && originalRequest.url !== '/auth/refresh' && originalRequest.url !== '/auth/login') {
        if (isRefreshing) {
          return new Promise(function(resolve, reject) {
            failedQueue.push({ resolve, reject });
          }).then(token => {
            originalRequest.headers['Authorization'] = 'Bearer ' + token;
            return instance(originalRequest);
          }).catch(err => {
            return Promise.reject(err);
          });
        }

        originalRequest._retry = true;
        isRefreshing = true;

        const refreshToken = StoreService.getRefreshToken();
        if (!refreshToken) {
          isRefreshing = false;
          StoreService.setAuthToken(null);
          if (window.location.pathname !== '/login') {
            window.location.href = '/login';
          }
          return Promise.reject(error);
        }

        try {
          const { data } = await axios.post(`${BASE_URL}/auth/refresh`, { refreshToken });
          const newAccessToken = data.accessToken;
          const newRefreshToken = data.refreshToken;

          StoreService.setAuthToken(newAccessToken);
          StoreService.setRefreshToken(newRefreshToken);

          processQueue(null, newAccessToken);
          
          originalRequest.headers['Authorization'] = 'Bearer ' + newAccessToken;
          return instance(originalRequest);
        } catch (err) {
          processQueue(err, null);
          StoreService.setAuthToken(null);
          StoreService.setRefreshToken(null);
          if (window.location.pathname !== '/login') {
            window.location.href = '/login';
          }
          return Promise.reject(err);
        } finally {
          isRefreshing = false;
        }
      }
      return Promise.reject(error);
    }
  );

  return {
    makeRequest: _makeRequest(instance),
    makeAuthRequest: _makeAuthRequest(instance),
  };
}
