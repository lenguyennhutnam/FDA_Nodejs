import Link from 'next/link';
import { fetchSummary, fetchRecent } from '@/lib/notifications';
import { fetchTargets } from '@/lib/targets';
import { fetchScanStatus } from '@/lib/scanner';
import { getCurrentUser } from '@/lib/session';
import { formatTimestamp, STATUS_META } from '@/lib/format';
import { HoursFilter } from './hours-filter';
import { ScanControls } from './scan-controls';

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ hours?: string }>;
}) {
  const sp = await searchParams;
  const hours = Number((sp.hours ?? '24').replace(',', '.')) || 24;

  const [summaries, recent, targets, status, user] = await Promise.all([
    fetchSummary(hours),
    fetchRecent(15),
    fetchTargets(),
    fetchScanStatus(),
    getCurrentUser(),
  ]);
  const idByName = new Map(targets.map((t) => [t.name, t.id]));
  const isAdmin = user?.role === 'admin';

  const totalActivity = summaries.reduce((a, s) => a + s.activity_count, 0);
  const totalChange = summaries.reduce((a, s) => a + s.change_count, 0);

  return (
    <main className="p-8 max-w-7xl mx-auto">
      <div className="flex items-start justify-between mb-2 flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-500 text-sm mt-1">
            Trong {hours} giờ gần nhất · {summaries.length} mục tiêu ·{' '}
            <span className="text-emerald-600 font-medium">{totalActivity}</span> hoạt động ·{' '}
            <span className="text-amber-600 font-medium">{totalChange}</span> đổi chức vụ
          </p>
        </div>
        <HoursFilter />
      </div>

      <div className="mb-6">
        <ScanControls status={status} isAdmin={isAdmin} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Thẻ tóm tắt */}
        <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4 auto-rows-min">
          {summaries.length === 0 ? (
            <div className="col-span-full bg-white rounded-2xl border border-gray-100 p-10 text-center text-gray-400">
              Chưa có mục tiêu nào. Thêm ở trang &quot;Mục tiêu bảo vệ&quot;.
            </div>
          ) : (
            summaries.map((s) => {
              const meta = STATUS_META[s.status] ?? STATUS_META.no_data;
              const id = idByName.get(s.target_name);
              const card = (
                <div className="bg-white rounded-2xl border border-gray-100 p-5 h-full hover:shadow-md hover:border-gray-200 transition">
                  <div className="flex items-center justify-between mb-3">
                    <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${meta.className}`}>
                      {meta.label}
                    </span>
                    {s.is_new && (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 font-medium">
                        Mới
                      </span>
                    )}
                  </div>
                  <h3 className="font-semibold text-gray-900 text-lg">{s.target_name}</h3>
                  <div className="flex gap-5 mt-3">
                    <div>
                      <div className="text-xl font-bold text-gray-900">{s.activity_count}</div>
                      <div className="text-xs text-gray-400">hoạt động</div>
                    </div>
                    <div>
                      <div className="text-xl font-bold text-amber-600">{s.change_count}</div>
                      <div className="text-xs text-gray-400">đổi chức vụ</div>
                    </div>
                  </div>
                  {s.sources.length > 0 && (
                    <p className="text-xs text-gray-400 mt-3 truncate">
                      {s.sources.slice(0, 3).join(' · ')}
                    </p>
                  )}
                </div>
              );
              return id ? (
                <Link key={s.target_name} href={`/targets/${id}?hours=${hours}`}>
                  {card}
                </Link>
              ) : (
                <div key={s.target_name}>{card}</div>
              );
            })
          )}
        </div>

        {/* Tin mới nhất */}
        <aside className="bg-white rounded-2xl border border-gray-100 p-5 h-fit">
          <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-blue-500" />
            Tin mới nhất
          </h2>
          {recent.length === 0 ? (
            <p className="text-sm text-gray-400">Chưa có tin. Bấm &quot;Quét ngay&quot;.</p>
          ) : (
            <ul className="space-y-3">
              {recent.map((r, i) => (
                <li key={i} className="border-b border-gray-50 pb-3 last:border-0">
                  <a
                    href={r.article_url || r.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-gray-800 hover:text-blue-600 line-clamp-2"
                  >
                    {r.title}
                  </a>
                  <div className="text-xs text-gray-400 mt-1">
                    {r.target_name}
                    {r.press_name ? ` · ${r.press_name}` : ''}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </aside>
      </div>
    </main>
  );
}
