'use server';

import { revalidatePath } from 'next/cache';
import { apiPost } from '@/lib/api';
import { getAccessToken } from '@/lib/auth';

export type SaveResult = { ok: true } | { ok: false; error: string };

export async function saveSettings(patch: Record<string, unknown>): Promise<SaveResult> {
  const token = await getAccessToken();
  if (!token) return { ok: false, error: 'Phiên đăng nhập hết hạn' };
  try {
    await apiPost('/settings', patch, token);
    revalidatePath('/settings');
    return { ok: true };
  } catch (e: any) {
    return { ok: false, error: e.message ?? 'Lỗi khi lưu cài đặt' };
  }
}

export async function testTelegram(
  botToken: string,
  chatId: string,
): Promise<SaveResult> {
  const token = await getAccessToken();
  if (!token) return { ok: false, error: 'Phiên đăng nhập hết hạn' };
  try {
    await apiPost('/settings/telegram-test', { bot_token: botToken, chat_id: chatId }, token);
    return { ok: true };
  } catch (e: any) {
    return { ok: false, error: e.message ?? 'Gửi thử thất bại' };
  }
}

export async function clearData(range: string): Promise<{ ok: true; removed: number } | { ok: false; error: string }> {
  const token = await getAccessToken();
  if (!token) return { ok: false, error: 'Phiên đăng nhập hết hạn' };
  try {
    const res = await apiPost<{ removed: number }>('/data/clear', { range }, token);
    revalidatePath('/settings');
    revalidatePath('/dashboard');
    return { ok: true, removed: res.removed };
  } catch (e: any) {
    return { ok: false, error: e.message ?? 'Lỗi khi xóa dữ liệu' };
  }
}
