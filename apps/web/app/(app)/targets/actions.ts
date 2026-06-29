'use server';

import { revalidatePath } from 'next/cache';
import { apiPost, apiPatch, apiDelete } from '@/lib/api';
import { getAccessToken } from '@/lib/auth';
import type { TargetInput } from '@/lib/targets';

export type ActionResult = { ok: true } | { ok: false; error: string };

export async function createTarget(input: TargetInput): Promise<ActionResult> {
  const token = await getAccessToken();
  if (!token) return { ok: false, error: 'Phiên đăng nhập hết hạn' };
  try {
    await apiPost('/targets', input, token);
    revalidatePath('/targets');
    return { ok: true };
  } catch (e: any) {
    return { ok: false, error: e.message ?? 'Lỗi khi thêm mục tiêu' };
  }
}

export async function updateTarget(id: string, input: TargetInput): Promise<ActionResult> {
  const token = await getAccessToken();
  if (!token) return { ok: false, error: 'Phiên đăng nhập hết hạn' };
  try {
    await apiPatch(`/targets/${id}`, input, token);
    revalidatePath('/targets');
    return { ok: true };
  } catch (e: any) {
    return { ok: false, error: e.message ?? 'Lỗi khi sửa mục tiêu' };
  }
}

export async function deleteTarget(id: string): Promise<ActionResult> {
  const token = await getAccessToken();
  if (!token) return { ok: false, error: 'Phiên đăng nhập hết hạn' };
  try {
    await apiDelete(`/targets/${id}`, token);
    revalidatePath('/targets');
    return { ok: true };
  } catch (e: any) {
    return { ok: false, error: e.message ?? 'Lỗi khi xóa mục tiêu' };
  }
}
