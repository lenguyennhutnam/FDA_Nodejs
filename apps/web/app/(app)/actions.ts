'use server';

import { redirect } from 'next/navigation';
import { AuthService } from '@/lib/apis/auth';
import { getAccessToken, clearAuthCookies } from '@/lib/auth';

/** Đăng xuất: gọi API logout (xóa refresh token phía server) rồi xóa cookie. */
export async function logoutAction() {
  const token = await getAccessToken();
  if (token) {
    try {
      await AuthService.logout(token);
    } catch {
      // Bỏ qua lỗi mạng — vẫn xóa cookie phía client để đăng xuất
    }
  }
  await clearAuthCookies();
  redirect('/login');
}
