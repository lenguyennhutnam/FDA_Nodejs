import { NotificationService } from './apis/notifications';
export type { AiResult, NotificationRecord, TargetSummary, TargetDetail } from './apis/notifications';

export async function fetchSummary(hours: number) {
  const token = await import('./auth').then(m => m.getAccessToken());
  if (!token) return [];
  return NotificationService.fetchSummary(hours, token);
}

export async function fetchRecent(limit = 15) {
  const token = await import('./auth').then(m => m.getAccessToken());
  if (!token) return [];
  return NotificationService.fetchRecent(limit, token);
}

export async function fetchDetail(name: string, hours: number) {
  const token = await import('./auth').then(m => m.getAccessToken());
  if (!token) return null;
  return NotificationService.fetchDetail(name, hours, token);
}
