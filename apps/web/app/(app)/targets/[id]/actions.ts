'use server';

import { revalidatePath } from 'next/cache';
import { apiPost } from '@/lib/api';
import { getAccessToken } from '@/lib/auth';

export type LabelResult = { ok: true; labeled: number } | { ok: false; error: string };

/** Gán/xóa nhãn cho các bài (label='' để khôi phục). Mọi user đăng nhập đều dùng được. */
export async function labelArticles(
  id: string,
  urls: string[],
  label: string,
): Promise<LabelResult> {
  const token = await getAccessToken();
  if (!token) return { ok: false, error: 'Phiên đăng nhập hết hạn' };
  try {
    const res = await apiPost<{ labeled: number }>('/notifications/label', { urls, label }, token);
    revalidatePath(`/targets/${id}`);
    return { ok: true, labeled: res.labeled };
  } catch (e: any) {
    return { ok: false, error: e.message ?? 'Lỗi khi gán nhãn' };
  }
}
