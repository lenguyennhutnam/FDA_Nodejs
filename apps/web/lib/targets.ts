import { apiGet } from './api';
import { getAccessToken } from './auth';

export type Target = {
  id: string;
  name: string;
  position: string;
  bio: string;
  createdAt: string;
  updatedAt: string;
};

export type TargetInput = { name: string; position: string; bio: string };

/** Lấy danh sách mục tiêu (server-side). */
export async function fetchTargets(): Promise<Target[]> {
  const token = await getAccessToken();
  if (!token) return [];
  try {
    return await apiGet<Target[]>('/targets', token);
  } catch {
    return [];
  }
}

/** Lấy 1 mục tiêu theo id (server-side); null nếu không tìm thấy. */
export async function fetchTarget(id: string): Promise<Target | null> {
  const token = await getAccessToken();
  if (!token) return null;
  try {
    return await apiGet<Target>(`/targets/${id}`, token);
  } catch {
    return null;
  }
}
