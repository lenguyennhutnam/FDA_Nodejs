import { useState, useEffect, useCallback } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useAppSelector } from '@/hooks';
import { StoreService } from '@/utils/store';
import { NotificationService } from '@/lib/apis/notifications';
import { TargetService } from '@/lib/apis/targets';
import { ScannerService, type ScanStatus } from '@/lib/apis/scanner';
import { SettingService, type PublicSettings } from '@/lib/apis/settings';
import { formatTimestamp, STATUS_META } from '@/lib/format';
import { RouterLink } from '@/routers/routers';
import { Box, CircularProgress, Button, Chip, Typography } from '@mui/material';

export default function DashboardPage() {
  const user = useAppSelector((state) => state.auth.info);
  const isAdmin = user?.role === 'admin';

  const [searchParams, setSearchParams] = useSearchParams();
  const hours = Number(searchParams.get('hours') ?? '24') || 24;

  const [summaries, setSummaries] = useState<any[]>([]);
  const [recent, setRecent] = useState<any[]>([]);
  const [idByName, setIdByName] = useState<Map<string, string>>(new Map());
  const [status, setStatus] = useState<ScanStatus | null>(null);
  const [settings, setSettings] = useState<PublicSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [scanning, setScanning] = useState(false);
  const [scanMsg, setScanMsg] = useState('');

  const [recentPage, setRecentPage] = useState(1);
  const itemsPerPage = 5;

  const fetchData = useCallback(async () => {
    const token = StoreService.getAuthToken() ?? '';
    try {
      const [sumRes, recRes, tgRes, stRes, setRes] = await Promise.all([
        NotificationService.fetchSummary(hours, token),
        NotificationService.fetchRecent(30, token),
        TargetService.fetchTargets(token),
        ScannerService.fetchScanStatus(token),
        SettingService.fetchSettings(token),
      ]);
      setSummaries(sumRes ?? []);
      setRecent(recRes ?? []);
      setIdByName(new Map((tgRes ?? []).map((t: any) => [t.name, t.id])));
      setStatus(stRes);
      setSettings(setRes);
    } finally {
      setLoading(false);
    }
  }, [hours]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Auto-refresh
  useEffect(() => {
    const interval = settings?.ui_refresh_seconds
      ? setInterval(fetchData, settings.ui_refresh_seconds * 1000)
      : null;
    return () => { if (interval) clearInterval(interval); };
  }, [settings?.ui_refresh_seconds, fetchData]);

  const handleRunScan = async () => {
    const token = StoreService.getAuthToken() ?? '';
    setScanning(true);
    setScanMsg('');
    try {
      const res = await ScannerService.runScan(undefined, token);
      setScanMsg(`✅ Quét xong. Thêm ${res.added} tin mới.`);
      fetchData();
    } catch (e: any) {
      setScanMsg(`❌ Lỗi: ${e.message}`);
    } finally {
      setScanning(false);
    }
  };

  const handleToggleAutoScan = async () => {
    const token = StoreService.getAuthToken() ?? '';
    try {
      await ScannerService.setAutoScan(!status?.autoScanEnabled, token);
      fetchData();
    } catch (e: any) {
      alert('Lỗi: ' + e.message);
    }
  };

  const totalActivity = summaries.reduce((a: number, s: any) => a + s.activity_count, 0);
  const totalChange = summaries.reduce((a: number, s: any) => a + s.change_count, 0);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <main className="p-8 max-w-7xl mx-auto min-h-screen bg-gray-50/50">
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-700 to-indigo-600 mb-2">
            Dashboard
          </h1>
          <p className="text-gray-500 text-sm">
            Trong {hours} giờ gần nhất · {summaries.length} mục tiêu ·{' '}
            <span className="text-emerald-600 font-semibold">{totalActivity}</span> hoạt động ·{' '}
            <span className="text-amber-600 font-semibold">{totalChange}</span> đổi chức vụ
          </p>
        </div>
        {/* Hours filter */}
        <div className="flex items-center gap-1.5 bg-white p-1 rounded-xl shadow-sm border border-gray-200">
          {[6, 24, 48, 168].map((h) => (
            <button
              key={h}
              onClick={() => setSearchParams({ hours: String(h) })}
              className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                hours === h
                  ? 'bg-blue-600 text-white shadow-md transform scale-[1.02]'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              {h < 24 ? `${h}g` : h < 168 ? `${h / 24}ngày` : '7ngày'}
            </button>
          ))}
        </div>
      </div>

      {/* Scan controls */}
      {isAdmin && (
        <div className="mb-8 bg-white/80 backdrop-blur-md rounded-2xl border border-gray-200/60 p-4 shadow-sm flex flex-wrap items-center gap-4 transition-all">
          <div className="flex items-center gap-3">
            <Button
              variant="contained"
              onClick={handleRunScan}
              disabled={scanning || status?.isScanning}
              size="small"
              sx={{ 
                textTransform: 'none', 
                borderRadius: '999px', 
                px: 3, 
                py: 1,
                background: 'linear-gradient(135deg, #2563eb 0%, #4f46e5 100%)',
                boxShadow: '0 4px 14px 0 rgba(37, 99, 235, 0.39)',
                '&:hover': { opacity: 0.9 }
              }}
            >
              {scanning || status?.isScanning ? '⏳ Đang quét...' : '🔍 Quét ngay'}
            </Button>
            <Button
              variant="outlined"
              onClick={handleToggleAutoScan}
              size="small"
              sx={{ 
                textTransform: 'none', 
                borderRadius: '999px',
                px: 3,
                py: 1,
                borderColor: status?.autoScanEnabled ? '#ef4444' : '#10b981',
                color: status?.autoScanEnabled ? '#ef4444' : '#10b981',
                '&:hover': {
                  borderColor: status?.autoScanEnabled ? '#dc2626' : '#059669',
                  backgroundColor: status?.autoScanEnabled ? 'rgba(239, 68, 68, 0.05)' : 'rgba(16, 185, 129, 0.05)'
                }
              }}
            >
              {status?.autoScanEnabled ? '⏸ Tắt quét tự động' : '▶ Bật quét tự động'}
            </Button>
          </div>
          
          {scanMsg && (
            <span className="text-sm font-medium animate-pulse text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full">
              {scanMsg}
            </span>
          )}
          
          {status && (
            <div className="ml-auto flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></div>
              <span className="text-xs font-mono text-gray-500 bg-gray-100 px-2.5 py-1 rounded-md">
                Lần cuối: {status.lastRun ? formatTimestamp(status.lastRun) : 'Chưa chạy'}
              </span>
            </div>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Summary cards */}
        <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-5 auto-rows-min">
          {summaries.length === 0 ? (
            <div className="col-span-full bg-white rounded-3xl border border-gray-100 p-12 text-center text-gray-400 shadow-sm flex flex-col items-center justify-center">
              <span className="text-4xl mb-3">📭</span>
              <p>Chưa có mục tiêu nào.</p>
              <Link to={RouterLink.TARGETS} className="text-blue-600 hover:text-blue-700 font-medium mt-2 hover:underline transition">
                Thêm mục tiêu mới
              </Link>
            </div>
          ) : (
            summaries.map((s: any) => {
              const targetId = idByName.get(s.target_name);
              return (
                <Link
                  key={s.target_name}
                  to={targetId ? `${RouterLink.TARGETS}/${targetId}` : '#'}
                  className="group relative bg-white rounded-2xl border border-gray-100 p-5 hover:shadow-xl hover:shadow-blue-900/5 hover:-translate-y-1 transition-all duration-300 overflow-hidden"
                >
                  {/* Decorative background accent */}
                  <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-bl-full -z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  
                  <div className="flex flex-col h-full justify-between gap-4">
                    <div className="min-w-0">
                      <div className="font-bold text-gray-900 truncate text-lg group-hover:text-blue-700 transition-colors">
                        {s.target_name}
                      </div>
                      <div className="flex items-center gap-1.5 text-sm text-gray-500 mt-1">
                        <span className="shrink-0 text-gray-400">💼</span>
                        <span className="truncate font-medium" title={s.target_position || 'Chưa rõ chức vụ'}>
                          {s.target_position || 'Chưa rõ chức vụ'}
                        </span>
                      </div>
                      {s.target_bio && (
                        <p className="mt-2 text-xs text-gray-500 line-clamp-2 leading-relaxed opacity-80 group-hover:opacity-100 transition-opacity">
                          {s.target_bio}
                        </p>
                      )}
                    </div>
                    <div className="flex gap-2 flex-wrap mt-auto pt-3 border-t border-gray-50/50">
                      <div className="flex items-center gap-1.5 bg-blue-50/80 text-blue-700 px-2.5 py-1 rounded-md text-xs font-semibold">
                        <span>📝</span> {s.activity_count} tin
                      </div>
                      {s.change_count > 0 && (
                        <div className="flex items-center gap-1.5 bg-amber-50/80 text-amber-700 px-2.5 py-1 rounded-md text-xs font-semibold">
                          <span>⚠️</span> {s.change_count} đổi chức vụ
                        </div>
                      )}
                    </div>
                  </div>
                </Link>
              );
            })
          )}
        </div>

        {/* Recent notifications */}
        <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm sticky top-6">
          <div className="flex items-center justify-between mb-4">
            <Typography variant="h6" fontWeight={700} color="text.primary">
              Tin mới nhất
            </Typography>
            <span className="bg-emerald-100 text-emerald-700 text-xs font-bold px-2 py-1 rounded-full">
              LIVE
            </span>
          </div>
          
          {recent.length === 0 ? (
            <div className="text-center py-10">
              <span className="text-3xl text-gray-200 mb-2 block">🔕</span>
              <p className="text-sm text-gray-400">Không có tin mới.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {recent.slice((recentPage - 1) * itemsPerPage, recentPage * itemsPerPage).map((n: any) => {
                const meta = STATUS_META[n.status as keyof typeof STATUS_META] ?? STATUS_META.hoatdong;
                const targetId = idByName.get(n.target_name);
                return (
                  <div key={n.id} className="group flex gap-3 items-start p-3 -mx-3 rounded-xl hover:bg-gray-50 transition-colors cursor-default">
                    <span className="mt-1 flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-full bg-white shadow-sm border border-gray-100 text-sm">
                      {meta.icon}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="text-sm text-gray-800 leading-relaxed line-clamp-2">
                        <span className="font-bold text-gray-900 mr-1">{n.target_name}</span> 
                        <a 
                          href={n.article_url || n.url || "#"} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="text-gray-600 hover:text-blue-600 hover:underline transition-colors"
                        >
                          {n.title}
                        </a>
                      </div>
                      <div className="flex items-center justify-between mt-1.5">
                        <span className="text-xs font-mono text-gray-400">
                          {formatTimestamp(n.published_at)}
                        </span>
                        {targetId && (
                          <Link
                            to={`${RouterLink.TARGETS}/${targetId}`}
                            className="opacity-0 group-hover:opacity-100 shrink-0 text-xs font-semibold text-blue-600 hover:text-blue-800 transition-all flex items-center gap-0.5"
                          >
                            Xem chi tiết <span>→</span>
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
          
          {recent.length > itemsPerPage && (
            <div className="mt-4 flex items-center justify-between border-t border-gray-100 pt-3">
              <button 
                disabled={recentPage === 1}
                onClick={() => setRecentPage(p => Math.max(1, p - 1))}
                className="text-xs font-semibold px-3 py-1.5 rounded-lg border text-gray-600 hover:bg-gray-50 disabled:opacity-30 transition-colors"
              >
                Trước
              </button>
              <span className="text-xs text-gray-500 font-medium">
                Trang {recentPage} / {Math.ceil(recent.length / itemsPerPage)}
              </span>
              <button 
                disabled={recentPage >= Math.ceil(recent.length / itemsPerPage)}
                onClick={() => setRecentPage(p => p + 1)}
                className="text-xs font-semibold px-3 py-1.5 rounded-lg border text-gray-600 hover:bg-gray-50 disabled:opacity-30 transition-colors"
              >
                Tiếp
              </button>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
