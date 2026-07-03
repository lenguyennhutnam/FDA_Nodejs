import Link from 'next/link';
import { fetchSummary, fetchRecent } from '@/lib/notifications';
import { fetchTargets } from '@/lib/targets';
import { fetchScanStatus } from '@/lib/scanner';
import { getCurrentUser } from '@/lib/session';
import { fetchSettings } from '@/lib/settings';
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

  const [summaries, recent, targets, status, user, settings] = await Promise.all([
    fetchSummary(hours),
    fetchRecent(30),
    fetchTargets(),
    fetchScanStatus(),
    getCurrentUser(),
    fetchSettings(),
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
        <ScanControls
          status={status}
          isAdmin={isAdmin}
          uiRefreshSeconds={settings?.ui_refresh_seconds}
        />
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
        <aside className="bg-white rounded-2xl border border-gray-100 p-5 h-[620px] flex flex-col shadow-sm">
          <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2 shrink-0">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-pulse" />
            Tin mới nhất
          </h2>
          <div className="flex-1 overflow-y-auto pr-1 space-y-3 scrollbar-thin scrollbar-thumb-gray-200">
            {recent.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-gray-400 py-10">
                <span className="text-3xl mb-2">📭</span>
                <p className="text-sm">Chưa có tin tức nào.</p>
                <p className="text-xs text-gray-400 mt-1">Bấm &quot;Quét ngay&quot; để tìm kiếm.</p>
              </div>
            ) : (
              recent.map((r, i) => (
                <div
                  key={i}
                  className="bg-gray-50/50 rounded-xl p-3.5 border border-gray-100 hover:border-blue-100 hover:bg-blue-50/10 transition duration-150 group"
                >
                  <a
                    href={r.article_url || r.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm font-medium text-gray-800 group-hover:text-blue-600 line-clamp-2 leading-snug"
                  >
                    {r.title}
                  </a>
                  <div className="flex items-center justify-between mt-2.5 text-[11px] text-gray-400">
                    <span className="font-medium text-gray-600 bg-white border border-gray-100 px-1.5 py-0.5 rounded">
                      {r.target_name}
                    </span>
                    <span className="truncate max-w-[120px]" title={r.press_name}>
                      {r.press_name || 'Báo điện tử'}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </aside>
      </div>
    </main>
  );
}
