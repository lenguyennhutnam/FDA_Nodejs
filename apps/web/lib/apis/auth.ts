import createApiServices from './make-api-request';

const api = createApiServices();

export const AuthService = {
  login: async (email: string, password: string): Promise<{ accessToken: string; refreshToken: string }> => {
    return api.makeRequest({
      url: '/auth/login',
      method: 'POST',
      data: { email, password },
    });
  },

  refresh: async (refreshToken: string): Promise<{ accessToken: string; refreshToken: string }> => {
    return api.makeRequest({
      url: '/auth/refresh',
      method: 'POST',
      data: { refreshToken },
    });
  },

  logout: async (token: string): Promise<void> => {
    return api.makeAuthRequest({
      url: '/auth/logout',
      method: 'POST',
      token,
    });
  },

  me: async (token: string): Promise<any> => {
    return api.makeAuthRequest({
      url: '/auth/me',
      method: 'GET',
      token,
    });
  },
};
