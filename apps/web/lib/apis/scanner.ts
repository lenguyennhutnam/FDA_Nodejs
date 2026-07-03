import createApiServices from './make-api-request';

const api = createApiServices();

export type ScanStatus = {
  isScanning: boolean;
  lastRun: string | null;
  lastAdded: number;
  lastError: string | null;
  currentTarget: string | null;
  autoScanEnabled: boolean;
};

export const ScannerService = {
  fetchScanStatus: async (token: string): Promise<ScanStatus | null> => {
    if (!token) return null;
    try {
      const res = await api.makeAuthRequest({
        url: '/monitor/status',
        method: 'GET',
        token,
      });
      return res.status;
    } catch {
      return null;
    }
  },

  runScan: async (targetName: string | undefined, token: string): Promise<{ success: boolean; added: number; scanned: number; status: ScanStatus }> => {
    return api.makeAuthRequest({
      url: '/monitor/run',
      method: 'POST',
      data: { target_name: targetName },
      token,
    });
  },

  cancelScan: async (token: string): Promise<{ success: boolean }> => {
    return api.makeAuthRequest({
      url: '/monitor/cancel',
      method: 'POST',
      token,
    });
  },

  setAutoScan: async (enabled: boolean, token: string): Promise<{ success: boolean; status: ScanStatus }> => {
    return api.makeAuthRequest({
      url: '/monitor/auto',
      method: 'POST',
      data: { enabled },
      token,
    });
  },
};
