import { apiGet } from './api';
import { getAccessToken } from './auth';

export type ScanStatus = {
  isScanning: boolean;
  lastRun: string | null;
  lastAdded: number;
  lastError: string | null;
  currentTarget: string | null;
  autoScanEnabled: boolean;
};

export async function fetchScanStatus(): Promise<ScanStatus | null> {
  const token = await getAccessToken();
  if (!token) return null;
  try {
    const res = await apiGet<{ status: ScanStatus }>('/monitor/status', token);
    return res.status;
  } catch {
    return null;
  }
}
