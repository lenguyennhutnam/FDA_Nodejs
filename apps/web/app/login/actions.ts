'use server';

import { redirect } from 'next/navigation';
import { AuthService } from '@/lib/apis/auth';
import { setAuthCookies } from '@/lib/auth';

export type LoginState = { error: string } | null;

export async function loginAction(_prev: LoginState, formData: FormData): Promise<LoginState> {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  try {
    const result = await AuthService.login(email, password);
    await setAuthCookies(result.accessToken, result.refreshToken);
  } catch (e: any) {
    return { error: e.message ?? 'Đăng nhập thất bại' };
  }

  redirect('/dashboard');
}
