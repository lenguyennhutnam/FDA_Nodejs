'use server';

import { revalidatePath } from 'next/cache';
import { apiPost } from '@/lib/api';
import { getAccessToken } from '@/lib/auth';

export type ScanActionResult = { ok: true; added?: number } | { ok: false; error: string };

export async function runScan(): Promise<ScanActionResult> {
  const token = await getAccessToken();
  if (!token) return { ok: false, error: 'Phiên đăng nhập hết hạn' };
  try {
    const res = await apiPost<{ added: number }>('/monitor/run', {}, token);
    revalidatePath('/dashboard');
    return { ok: true, added: res.added };
  } catch (e: any) {
    return { ok: false, error: e.message ?? 'Lỗi khi quét' };
  }
}

export async function toggleAutoScan(enabled: boolean): Promise<ScanActionResult> {
  const token = await getAccessToken();
  if (!token) return { ok: false, error: 'Phiên đăng nhập hết hạn' };
  try {
    await apiPost('/monitor/auto', { enabled }, token);
    revalidatePath('/dashboard');
    return { ok: true };
  } catch (e: any) {
    return { ok: false, error: e.message ?? 'Lỗi' };
  }
}
