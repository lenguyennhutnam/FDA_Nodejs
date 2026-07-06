import { useState, useEffect } from 'react';
import { useAppSelector } from '@/hooks';
import { StoreService } from '@/utils/store';
import { SettingService, type PublicSettings, type DataStats, type PressSource } from '@/lib/apis/settings';
import { UserService } from '@/lib/apis/users';
import { CircularProgress, Box } from '@mui/material';

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="bg-white rounded-2xl border border-gray-100 p-6">
      <h2 className="font-semibold text-gray-900 mb-4">{title}</h2>
      <div className="space-y-4">{children}</div>
    </section>
  );
}

function Row({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div className="min-w-0">
        <div className="text-sm font-medium text-gray-900">{label}</div>
        {hint && <div className="text-xs text-gray-400 mt-0.5">{hint}</div>}
      </div>
      <div className="shrink-0">{children}</div>
    </div>
  );
}

function Toggle({ checked, onChange, disabled }: { checked: boolean; onChange: (v: boolean) => void; disabled?: boolean }) {
  return (
    <button type="button" role="switch" aria-checked={checked} disabled={disabled}
      onClick={() => onChange(!checked)}
      className={`relative w-11 h-6 rounded-full transition ${checked ? 'bg-blue-600' : 'bg-gray-300'} disabled:opacity-50`}>
      <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition ${checked ? 'translate-x-5' : ''}`} />
    </button>
  );
}

function formatBytes(n: number): string {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / 1024 / 1024).toFixed(1)} MB`;
}

const numCls = 'w-24 border rounded-lg px-2 py-1.5 text-sm text-gray-900 text-right focus:outline-none focus:ring-2 focus:ring-blue-500';
const CLEAR_RANGES = [
  { value: '1h', label: '1 giờ qua' }, { value: '24h', label: '24 giờ qua' },
  { value: '7d', label: '7 ngày qua' }, { value: '4w', label: '4 tuần qua' },
  { value: 'all', label: 'Toàn bộ' },
];

export default function SettingsPage() {
  const user = useAppSelector((state) => state.auth.info);
  const isAdmin = user?.role === 'admin';
  const ro = !isAdmin;

  const [settings, setSettings] = useState<PublicSettings | null>(null);
  const [stats, setStats] = useState<DataStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [pending, setPending] = useState(false);

  const [scan, setScan] = useState<any>({});
  const [tg, setTg] = useState<any>({});
  const [botToken, setBotToken] = useState('');
  const [chatId, setChatId] = useState('');
  const [filterCt, setFilterCt] = useState(false);
  const [press, setPress] = useState<PressSource[]>([]);
  const [newPress, setNewPress] = useState({ name: '', homepage_url: '' });
  const [clearRange, setClearRange] = useState('all');

  const [pwdCurrent, setPwdCurrent] = useState('');
  const [pwdNew, setPwdNew] = useState('');
  const [pwdConfirm, setPwdConfirm] = useState('');
  const [pwdPending, setPwdPending] = useState(false);

  useEffect(() => {
    const token = StoreService.getAuthToken() ?? '';
    Promise.all([
      SettingService.fetchSettings(token),
      SettingService.fetchDataStats(token),
    ]).then(([s, st]) => {
      if (s) {
        setSettings(s);
        setScan({
          search_match_mode: s.search_match_mode,
          max_results_per_target: s.max_results_per_target,
          scan_lookback_days: s.scan_lookback_days,
          require_name_in_title: s.require_name_in_title,
          auto_scan_enabled: s.auto_scan_enabled,
          scan_interval_minutes: s.scan_interval_minutes,
          ui_refresh_seconds: s.ui_refresh_seconds,
        });
        setTg({ enabled: s.telegram.enabled, notify_role_change_only: s.telegram.notify_role_change_only, notify_on_empty: s.telegram.notify_on_empty });
        setFilterCt(s.filter_chinh_thong_only);
        setPress(s.press_sources);
      }
      setStats(st);
    }).finally(() => setLoading(false));
  }, []);

  const token = () => StoreService.getAuthToken() ?? '';

  const save = async () => {
    const patch = {
      ...scan,
      filter_chinh_thong_only: filterCt,
      press_sources: press,
      telegram: {
        ...tg,
        ...(botToken.trim() ? { bot_token: botToken.trim() } : {}),
        ...(chatId.trim() ? { chat_id: chatId.trim() } : {}),
      },
    };
    setPending(true);
    try {
      await SettingService.saveSettings(patch, token());
      setBotToken(''); setChatId('');
      alert('Đã lưu cài đặt.');
    } catch (e: any) { alert('Lỗi: ' + e.message); }
    finally { setPending(false); }
  };

  const doTestTelegram = async () => {
    setPending(true);
    try {
      await SettingService.testTelegram(botToken.trim(), chatId.trim(), token());
      alert('Đã gửi tin nhắn thử — kiểm tra Telegram.');
    } catch (e: any) { alert('Lỗi: ' + e.message); }
    finally { setPending(false); }
  };

  const doClear = async () => {
    const label = CLEAR_RANGES.find((r) => r.value === clearRange)?.label ?? '';
    if (!confirm(`Xóa dữ liệu tin (${label})? Không thể hoàn tác.`)) return;
    setPending(true);
    try {
      const res = await SettingService.clearData(clearRange, token());
      alert(`Đã xóa ${res.removed} tin.`);
    } catch (e: any) { alert('Lỗi: ' + e.message); }
    finally { setPending(false); }
  };

  const doChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pwdCurrent || !pwdNew || !pwdConfirm) return alert('Vui lòng nhập đầy đủ thông tin');
    if (pwdNew !== pwdConfirm) return alert('Mật khẩu mới không khớp');
    
    setPwdPending(true);
    try {
      await UserService.changePasswordApi({ currentPassword: pwdCurrent, newPassword: pwdNew }, token());
      alert('Đổi mật khẩu thành công!');
      setPwdCurrent(''); setPwdNew(''); setPwdConfirm('');
    } catch (err: any) {
      alert('Lỗi: ' + err.message);
    } finally {
      setPwdPending(false);
    }
  };

  const handleAddPress = () => {
    if (!newPress.name || !newPress.homepage_url) return;
    setPress([...press, { ...newPress, id: Date.now().toString() }]);
    setNewPress({ name: '', homepage_url: '' });
  };

  const handleRemovePress = (id: string) => {
    setPress(press.filter(p => p.id !== id));
  };

  if (loading || !settings) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <main className="p-8 max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Cài đặt hệ thống</h1>
        {isAdmin && (
          <button onClick={save} disabled={pending}
            className="bg-blue-600 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-60">
            {pending ? 'Đang lưu…' : 'Lưu cài đặt'}
          </button>
        )}
      </div>

      {ro && (
        <p className="mb-4 text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
          Bạn đang ở chế độ chỉ xem. Các thay đổi đối với hệ thống sẽ không được lưu.
        </p>
      )}

      <div className="space-y-6">
        <Section title="🔒 Tài khoản cá nhân">
          <form onSubmit={doChangePassword} className="space-y-3 pt-2">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Mật khẩu hiện tại</label>
              <input type="password" required value={pwdCurrent} onChange={e => setPwdCurrent(e.target.value)} 
                className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Mật khẩu mới</label>
              <input type="password" required minLength={8} value={pwdNew} onChange={e => setPwdNew(e.target.value)} 
                className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Xác nhận mật khẩu mới</label>
              <input type="password" required minLength={8} value={pwdConfirm} onChange={e => setPwdConfirm(e.target.value)} 
                className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500" />
            </div>
            <button type="submit" disabled={pwdPending} className="mt-2 bg-blue-100 text-blue-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-200 disabled:opacity-50 transition-colors">
              {pwdPending ? 'Đang xử lý...' : 'Đổi mật khẩu'}
            </button>
          </form>
        </Section>
        <Section title="⚙️ Cài đặt quét">
          <Row label="Số tin tối đa / mục tiêu" hint="1–100">
            <input type="number" min={1} max={100} value={scan.max_results_per_target} disabled={ro}
              onChange={(e) => setScan({ ...scan, max_results_per_target: Number(e.target.value) })} className={numCls} />
          </Row>
          <Row label="Chỉ lấy tin trong (ngày)" hint="1–90">
            <input type="number" min={1} max={90} value={scan.scan_lookback_days} disabled={ro}
              onChange={(e) => setScan({ ...scan, scan_lookback_days: Number(e.target.value) })} className={numCls} />
          </Row>
          <Row label="Chỉ lấy bài có tên trong tiêu đề">
            <Toggle checked={scan.require_name_in_title} disabled={ro}
              onChange={(v) => setScan({ ...scan, require_name_in_title: v })} />
          </Row>
          <Row label="Tự động quét nền">
            <Toggle checked={scan.auto_scan_enabled} disabled={ro}
              onChange={(v) => setScan({ ...scan, auto_scan_enabled: v })} />
          </Row>
          <Row label="Chu kỳ quét (phút)" hint="Tối thiểu 5 phút">
            <input type="number" min={5} max={1440} value={scan.scan_interval_minutes} disabled={ro}
              onChange={(e) => setScan({ ...scan, scan_interval_minutes: Number(e.target.value) })} className={numCls} />
          </Row>
          <Row label="Làm mới giao diện (giây)" hint="10–300">
            <input type="number" min={10} max={300} value={scan.ui_refresh_seconds} disabled={ro}
              onChange={(e) => setScan({ ...scan, ui_refresh_seconds: Number(e.target.value) })} className={numCls} />
          </Row>
        </Section>

        <Section title="✈️ Thông báo Telegram">
          <Row label="Bật gửi Telegram">
            <Toggle checked={tg.enabled} disabled={ro} onChange={(v) => setTg({ ...tg, enabled: v })} />
          </Row>
          <Row label="Chỉ thông báo đổi chức vụ">
            <Toggle checked={tg.notify_role_change_only} disabled={ro}
              onChange={(v) => setTg({ ...tg, notify_role_change_only: v })} />
          </Row>
          <div className="space-y-2 pt-2 border-t border-gray-100">
            <input type="password" value={botToken} disabled={ro} onChange={(e) => setBotToken(e.target.value)}
              placeholder={settings.telegram.bot_token_configured ? 'Bot token (đã cấu hình — nhập để thay)' : 'Bot token (từ @BotFather)'}
              className="w-full border rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500" />
            <input type="text" value={chatId} disabled={ro} onChange={(e) => setChatId(e.target.value)}
              placeholder={settings.telegram.chat_id_configured ? 'Chat ID (đã cấu hình — nhập để thay)' : 'Chat ID người/nhóm nhận'}
              className="w-full border rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500" />
            {isAdmin && (
              <button onClick={doTestTelegram} disabled={pending}
                className="text-sm px-3 py-1.5 rounded-lg border text-gray-700 hover:bg-gray-50 disabled:opacity-60">
                Gửi thử
              </button>
            )}
          </div>
        </Section>

        <Section title="📰 Nguồn tin & Lọc">
          <Row label="Chỉ quét từ báo chính thống" hint="Lọc các bài viết từ tên miền không có trong danh sách bên dưới">
            <Toggle checked={filterCt} disabled={ro} onChange={setFilterCt} />
          </Row>
          
          <div className="mt-4 pt-4 border-t border-gray-100">
            <h3 className="text-sm font-medium text-gray-900 mb-3">Danh sách báo chính thống</h3>
            <div className="space-y-2 mb-3 max-h-60 overflow-y-auto custom-scrollbar pr-2">
              {press.length === 0 ? (
                <p className="text-xs text-gray-400">Chưa có nguồn nào.</p>
              ) : (
                press.map((p) => (
                  <div key={p.id} className="flex items-center justify-between bg-gray-50 rounded-lg px-3 py-2 border border-gray-200">
                    <div className="min-w-0">
                      <div className="text-sm font-medium text-gray-800">{p.name}</div>
                      <div className="text-xs text-gray-500 truncate">{p.homepage_url}</div>
                    </div>
                    {!ro && (
                      <button onClick={() => handleRemovePress(p.id)} className="text-red-500 hover:text-red-700 p-1">
                        ✕
                      </button>
                    )}
                  </div>
                ))
              )}
            </div>
            {!ro && (
              <div className="flex gap-2">
                <input type="text" placeholder="Tên báo (VD: VnExpress)" value={newPress.name} onChange={e => setNewPress({ ...newPress, name: e.target.value })} 
                  className="flex-1 border rounded-lg px-3 py-1.5 text-sm focus:ring-2 focus:ring-blue-500" />
                <input type="text" placeholder="Domain (VD: vnexpress.net)" value={newPress.homepage_url} onChange={e => setNewPress({ ...newPress, homepage_url: e.target.value })} 
                  className="flex-1 border rounded-lg px-3 py-1.5 text-sm focus:ring-2 focus:ring-blue-500" />
                <button onClick={handleAddPress} className="bg-gray-100 border text-gray-700 px-4 py-1.5 rounded-lg text-sm font-medium hover:bg-gray-200">
                  Thêm
                </button>
              </div>
            )}
          </div>
        </Section>

        <Section title="🗄️ Quản lý dữ liệu">
          {stats && (
            <p className="text-sm text-gray-600">
              {stats.total} tin ({stats.hoatdong} hoạt động · {stats.biendong} đổi chức vụ) · {formatBytes(stats.bytes)}
            </p>
          )}
          {isAdmin && (
            <>
              <div className="flex flex-wrap gap-3 pt-2">
                {CLEAR_RANGES.map((r) => (
                  <label key={r.value} className="flex items-center gap-1.5 text-sm text-gray-700">
                    <input type="radio" name="clearRange" value={r.value}
                      checked={clearRange === r.value} onChange={() => setClearRange(r.value)} />
                    {r.label}
                  </label>
                ))}
              </div>
              <button onClick={doClear} disabled={pending}
                className="mt-2 px-4 py-2 rounded-lg text-sm bg-red-600 text-white font-medium hover:bg-red-700 disabled:opacity-60">
                Xóa dữ liệu đã chọn
              </button>
            </>
          )}
        </Section>
      </div>
    </main>
  );
}

// // Re-export formatBytes for use in the file
// function formatBytes(n: number): string {
//   if (n < 1024) return `${n} B`;
//   if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
//   return `${(n / 1024 / 1024).toFixed(1)} MB`;
// }
