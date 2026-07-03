// App constants
export const AppConfigs = {
  serverUrl: import.meta.env.VITE_API_URL ?? 'http://localhost:3001/api',
} as const;

export const Keys = {
  authToken: 'auth_token',
  refreshToken: 'refresh_token',
} as const;
