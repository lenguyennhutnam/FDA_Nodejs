import { apiGet } from './api';
import { getAccessToken } from './auth';

export type CurrentUser = { id: string; email: string; role: 'admin' | 'viewer' };

/** Lấy thông tin user hiện tại từ API (server-side, dùng access token trong cookie). */
export async function getCurrentUser(): Promise<CurrentUser | null> {
  const token = await getAccessToken();
  if (!token) return null;
  try {
    return await apiGet<CurrentUser>('/auth/me', token);
  } catch {
    return null;
  }
}
