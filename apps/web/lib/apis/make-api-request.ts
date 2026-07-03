import axios, { AxiosInstance } from 'axios';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001/api';

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

export default function createApiServices() {
  const instance = axios.create({
    baseURL: BASE_URL,
    timeout: 30000,
  });

  return {
    makeRequest: _makeRequest(instance),
    makeAuthRequest: _makeAuthRequest(instance),
  };
}
