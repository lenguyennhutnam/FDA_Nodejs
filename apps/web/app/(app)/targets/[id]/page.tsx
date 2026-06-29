import Link from 'next/link';
import { notFound } from 'next/navigation';
import { fetchTarget } from '@/lib/targets';
import { fetchDetail } from '@/lib/notifications';
import { STATUS_META } from '@/lib/format';
import { DetailClient } from './detail-client';

export default async function TargetDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ hours?: string }>;
}) {
  const { id } = await params;
  const sp = await searchParams;
  const hours = Number((sp.hours ?? '24').replace(',', '.')) || 24;

  const target = await fetchTarget(id);
  if (!target) notFound();

  const detail = await fetchDetail(target.name, hours);
  const summary = detail?.summary;
  const meta = summary ? STATUS_META[summary.status] ?? STATUS_META.no_data : STATUS_META.no_data;

  return (
    <main className="p-8">
      <Link href="/dashboard" className="text-sm text-blue-600 hover:underline">
        ← Quay lại Dashboard
      </Link>

      <div className="bg-white rounded-xl shadow-sm p-6 mt-3 mb-6">
        <div className="flex items-start justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{target.name}</h1>
            {target.position && <p className="text-gray-600 mt-1">{target.position}</p>}
            <p className="text-gray-400 text-sm mt-1">Trong {hours} giờ gần nhất</p>
          </div>
          <span className={`text-sm px-3 py-1 rounded-full ${meta.className}`}>{meta.label}</span>
        </div>
        {target.bio && (
          <p className="text-sm text-gray-600 mt-4 border-t pt-4 whitespace-pre-line">
            {target.bio}
          </p>
        )}
        {summary && (
          <div className="flex gap-6 mt-4 text-sm">
            <span className="text-gray-700">
              <b className="text-gray-900 text-lg">{summary.activity_count}</b> hoạt động
            </span>
            <span className="text-gray-700">
              <b className="text-gray-900 text-lg">{summary.change_count}</b> đổi chức vụ
            </span>
          </div>
        )}
      </div>

      {detail ? (
        <DetailClient targetId={id} detail={detail} />
      ) : (
        <p className="text-gray-400">Không tải được dữ liệu tin.</p>
      )}
    </main>
  );
}
