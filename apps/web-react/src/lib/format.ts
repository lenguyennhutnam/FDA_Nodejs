export function formatTimestamp(ts?: string): string {
  if (!ts) return '';
  const d = new Date(ts);
  if (isNaN(d.getTime())) return ts;
  const p = (n: number) => String(n).padStart(2, '0');
  return `${p(d.getDate())}/${p(d.getMonth() + 1)}/${d.getFullYear()} ${p(d.getHours())}:${p(d.getMinutes())}`;
}

export const STATUS_META: Record<
  string,
  { label: string; className: string; icon: string }
> = {
  change: { label: 'Đổi chức vụ', className: 'bg-amber-100 text-amber-800', icon: '⚠️' },
  stable_activity: { label: 'Có hoạt động', className: 'bg-emerald-100 text-emerald-800', icon: '📝' },
  hoatdong: { label: 'Có hoạt động', className: 'bg-emerald-100 text-emerald-800', icon: '📝' },
  no_data: { label: 'Chưa có tin', className: 'bg-gray-100 text-gray-500', icon: '⚪' },
};
