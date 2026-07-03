import { SettingService } from './apis/settings';
export type { PressSource, PublicSettings, DataStats } from './apis/settings';
export { SEARCH_MODE_OPTIONS } from './apis/settings';

export async function fetchSettings() {
  const token = await import('./auth').then(m => m.getAccessToken());
  if (!token) return null;
  return SettingService.fetchSettings(token);
}

export async function fetchDataStats() {
  const token = await import('./auth').then(m => m.getAccessToken());
  if (!token) return null;
  return SettingService.fetchDataStats(token);
}
