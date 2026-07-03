import { TargetService } from './apis/targets';
export type { Target, TargetInput } from './apis/targets';

export async function fetchTargets() {
  const token = await import('./auth').then(m => m.getAccessToken());
  if (!token) return [];
  return TargetService.fetchTargets(token);
}

export async function fetchTarget(id: string) {
  const token = await import('./auth').then(m => m.getAccessToken());
  if (!token) return null;
  return TargetService.fetchTarget(id, token);
}
