'use server';

import { redirect } from 'next/navigation';
import { apiPost } from '@/lib/api';
import { setAuthCookies } from '@/lib/auth';

export async function loginAction(formData: FormData): Promise<void> {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  const result = await apiPost<{ accessToken: string; refreshToken: string }>(
    '/auth/login',
    { email, password },
  );
  await setAuthCookies(result.accessToken, result.refreshToken);

  redirect('/dashboard');
}
