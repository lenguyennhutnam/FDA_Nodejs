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
        {/* Hours filter */}
        <div className="flex items-center gap-1.5">
          {[6, 24, 48, 168].map((h) => (
            <button
              key={h}
              onClick={() => setSearchParams({ hours: String(h) })}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${
                hours === h
                  ? 'bg-blue-600 text-white'
                  : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
              }`}
            >
              {h < 24 ? `${h}g` : h < 168 ? `${h / 24}ngày` : '7ngày'}
            </button>
          ))}
        </div>
      </div>

      {/* Scan controls */}
      {isAdmin && (
        <div className="mb-6 bg-white rounded-2xl border border-gray-100 p-4 flex flex-wrap items-center gap-3">
          <Button
            variant="contained"
            onClick={handleRunScan}
            disabled={scanning || status?.isScanning}
            size="small"
            sx={{ textTransform: 'none' }}
          >
            {scanning || status?.isScanning ? '⏳ Đang quét...' : '🔍 Quét ngay'}
          </Button>
          <Button
            variant="outlined"
            onClick={handleToggleAutoScan}
            size="small"
            sx={{ textTransform: 'none' }}
          >
            {status?.autoScanEnabled ? '⏸ Tắt tự động quét' : '▶ Bật tự động quét'}
          </Button>
          {scanMsg && <span className="text-sm text-gray-600">{scanMsg}</span>}
          {status && (
            <span className="ml-auto text-xs text-gray-400">
              Lần cuối: {status.lastRun ? formatTimestamp(status.lastRun) : 'Chưa chạy'}
            </span>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Summary cards */}
        <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4 auto-rows-min">
          {summaries.length === 0 ? (
            <div className="col-span-full bg-white rounded-2xl border border-gray-100 p-10 text-center text-gray-400">
              Chưa có mục tiêu nào.{' '}
              <Link to={RouterLink.TARGETS} className="text-blue-600 underline">
                Thêm mục tiêu
              </Link>
            </div>
          ) : (
            summaries.map((s: any) => (
              <div key={s.target_name} className="bg-white rounded-2xl border border-gray-100 p-5">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <div className="font-semibold text-gray-900 truncate">{s.target_name}</div>
                    {s.target_position && (
                      <div className="text-xs text-gray-500 mt-0.5 truncate">{s.target_position}</div>
                    )}
                  </div>
                  <div className="flex gap-1.5 shrink-0">
                    {s.activity_count > 0 && (
                      <Chip label={`${s.activity_count} tin`} size="small" color="primary" />
                    )}
                    {s.change_count > 0 && (
                      <Chip label={`${s.change_count} đổi vị trí`} size="small" color="warning" />
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Recent notifications */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          <Typography variant="subtitle1" fontWeight={600} mb={2}>
            Tin mới nhất
          </Typography>
          {recent.length === 0 ? (
            <p className="text-sm text-gray-400">Không có tin mới.</p>
          ) : (
            <div className="space-y-3">
              {recent.slice(0, 10).map((n: any) => {
                const meta = STATUS_META[n.status as keyof typeof STATUS_META] ?? STATUS_META.hoatdong;
                const targetId = idByName.get(n.target_name);
                return (
                  <div key={n.id} className="flex gap-2 items-start">
                    <span className="mt-0.5 text-base shrink-0">{meta.icon}</span>
                    <div className="min-w-0">
                      <div className="text-sm text-gray-800 leading-snug">
                        <span className="font-medium">{n.target_name}</span> · {n.title}
                      </div>
                      <div className="text-xs text-gray-400 mt-0.5">
                        {formatTimestamp(n.published_at)}
                      </div>
                    </div>
                    {targetId && (
                      <Link
                        to={`${RouterLink.TARGETS}/${targetId}`}
                        className="ml-auto shrink-0 text-xs text-blue-600 hover:underline"
                      >
                        Xem
                      </Link>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
