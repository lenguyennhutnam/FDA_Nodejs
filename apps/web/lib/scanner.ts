import { ScannerService } from './apis/scanner';
export type { ScanStatus } from './apis/scanner';

export async function fetchScanStatus() {
  const token = await import('./auth').then(m => m.getAccessToken());
  if (!token) return null;
  return ScannerService.fetchScanStatus(token);
}
