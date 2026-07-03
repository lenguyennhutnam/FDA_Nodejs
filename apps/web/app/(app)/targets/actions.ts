'use server';

import { revalidatePath } from 'next/cache';
import { TargetService } from '@/lib/apis/targets';
import { getAccessToken } from '@/lib/auth';
import type { TargetInput } from '@/lib/apis/targets';

export type ActionResult = { ok: true } | { ok: false; error: string };

export async function createTarget(input: TargetInput): Promise<ActionResult> {
  const token = await getAccessToken();
  if (!token) return { ok: false, error: 'Phiên đăng nhập hết hạn' };
  try {
    await TargetService.createTarget(input, token);
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
    await TargetService.updateTarget(id, input, token);
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
    await TargetService.deleteTarget(id, token);
    revalidatePath('/targets');
    return { ok: true };
  } catch (e: any) {
    return { ok: false, error: e.message ?? 'Lỗi khi xóa mục tiêu' };
  }
}
