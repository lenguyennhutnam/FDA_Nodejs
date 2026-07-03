'use server';

import { revalidatePath } from 'next/cache';
import { NotificationService } from '@/lib/apis/notifications';
import { getAccessToken } from '@/lib/auth';

export type LabelResult = { ok: true; labeled: number } | { ok: false; error: string };

export async function labelArticles(
  id: string,
  urls: string[],
  label: string,
): Promise<LabelResult> {
  const token = await getAccessToken();
  if (!token) return { ok: false, error: 'Phiên đăng nhập hết hạn' };
  try {
    const res = await NotificationService.label(urls, label, token);
    revalidatePath(`/targets/${id}`);
    return { ok: true, labeled: res.labeled };
  } catch (e: any) {
    return { ok: false, error: e.message ?? 'Lỗi khi gán nhãn' };
  }
}
