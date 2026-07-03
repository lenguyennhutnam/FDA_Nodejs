'use server';

import { revalidatePath } from 'next/cache';
import { SettingService } from '@/lib/apis/settings';
import { UserService } from '@/lib/apis/users';
import { getAccessToken } from '@/lib/auth';

export type SaveResult = { ok: true } | { ok: false; error: string };

export async function saveSettings(patch: Record<string, unknown>): Promise<SaveResult> {
  const token = await getAccessToken();
  if (!token) return { ok: false, error: 'Phiên đăng nhập hết hạn' };
  try {
    await SettingService.saveSettings(patch, token);
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
    await SettingService.testTelegram(botToken, chatId, token);
    return { ok: true };
  } catch (e: any) {
    return { ok: false, error: e.message ?? 'Gửi thử thất bại' };
  }
}

export async function clearData(range: string): Promise<{ ok: true; removed: number } | { ok: false; error: string }> {
  const token = await getAccessToken();
  if (!token) return { ok: false, error: 'Phiên đăng nhập hết hạn' };
  try {
    const res = await SettingService.clearData(range, token);
    revalidatePath('/settings');
    revalidatePath('/dashboard');
    return { ok: true, removed: res.removed };
  } catch (e: any) {
    return { ok: false, error: e.message ?? 'Lỗi khi xóa dữ liệu' };
  }
}

export async function updatePassword(
  currentPassword: string,
  newPassword: string,
): Promise<SaveResult> {
  const token = await getAccessToken();
  if (!token) return { ok: false, error: 'Phiên đăng nhập hết hạn' };
  try {
    await UserService.changePasswordApi({ currentPassword, newPassword }, token);
    return { ok: true };
  } catch (e: any) {
    return { ok: false, error: e.message ?? 'Đổi mật khẩu thất bại' };
  }
}
