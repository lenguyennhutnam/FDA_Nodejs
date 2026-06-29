'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import type { PublicSettings, DataStats, PressSource } from '@/lib/settings';
import { saveSettings, testTelegram, clearData } from './actions';

const SEARCH_MODE_OPTIONS: { value: string; label: string }[] = [
  { value: 'related', label: 'Liên quan tên — Tên' },
  { value: 'related_position', label: 'Liên quan chức vụ — Chức vụ' },
  { value: 'exact_name', label: 'Chính xác tên — "Tên"' },
  { value: 'exact_position', label: 'Chính xác chức vụ — "Chức vụ"' },
  { value: 'exact', label: 'Chính xác tên + chức vụ — "Tên" "Chức vụ"' },
];

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="bg-white rounded-2xl border border-gray-100 p-6">
      <h2 className="font-semibold text-gray-900 mb-4">{title}</h2>
      <div className="space-y-4">{children}</div>
    </section>
  );
}

function Row({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
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

function Toggle({
  checked,
  onChange,
  disabled,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={`relative w-11 h-6 rounded-full transition ${
        checked ? 'bg-blue-600' : 'bg-gray-300'
      } disabled:opacity-50`}
    >
      <span
        className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition ${
          checked ? 'translate-x-5' : ''
        }`}
      />
    </button>
  );
}

function formatBytes(n: number): string {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / 1024 / 1024).toFixed(1)} MB`;
}

const numCls =
  'w-24 border rounded-lg px-2 py-1.5 text-sm text-gray-900 text-right focus:outline-none focus:ring-2 focus:ring-blue-500';

const CLEAR_RANGES = [
  { value: '1h', label: '1 giờ qua' },
  { value: '24h', label: '24 giờ qua' },
  { value: '7d', label: '7 ngày qua' },
  { value: '4w', label: '4 tuần qua' },
  { value: 'all', label: 'Toàn bộ' },
];

export function SettingsClient({
  settings,
  stats,
  isAdmin,
}: {
  settings: PublicSettings;
  stats: DataStats | null;
  isAdmin: boolean;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  // Form state
  const [scan, setScan] = useState({
    search_match_mode: settings.search_match_mode,
    max_results_per_target: settings.max_results_per_target,
    scan_lookback_days: settings.scan_lookback_days,
    require_name_in_title: settings.require_name_in_title,
    auto_scan_enabled: settings.auto_scan_enabled,
    scan_interval_minutes: settings.scan_interval_minutes,
    ui_refresh_seconds: settings.ui_refresh_seconds,
  });
  const [tg, setTg] = useState({
    enabled: settings.telegram.enabled,
    notify_role_change_only: settings.telegram.notify_role_change_only,
    notify_on_empty: settings.telegram.notify_on_empty,
  });
  const [botToken, setBotToken] = useState('');
  const [chatId, setChatId] = useState('');
  const [filterCt, setFilterCt] = useState(settings.filter_chinh_thong_only);
  const [press, setPress] = useState<PressSource[]>(settings.press_sources);
  const [newPress, setNewPress] = useState({ name: '', homepage_url: '' });
  const [clearRange, setClearRange] = useState('all');

  const ro = !isAdmin;

  function save() {
    const patch: Record<string, unknown> = {
      ...scan,
      filter_chinh_thong_only: filterCt,
      press_sources: press,
      telegram: {
        ...tg,
        ...(botToken.trim() ? { bot_token: botToken.trim() } : {}),
        ...(chatId.trim() ? { chat_id: chatId.trim() } : {}),
      },
    };
    startTransition(async () => {
      const res = await saveSettings(patch);
      if (!res.ok) alert('Lỗi: ' + res.error);
      else {
        setBotToken('');
        setChatId('');
        alert('Đã lưu cài đặt.');
        router.refresh();
      }
    });
  }

  function doTestTelegram() {
    startTransition(async () => {
      const res = await testTelegram(botToken.trim(), chatId.trim());
      alert(res.ok ? 'Đã gửi tin nhắn thử — kiểm tra Telegram.' : 'Lỗi: ' + res.error);
    });
  }

  function addPress() {
    const name = newPress.name.trim();
    const url = newPress.homepage_url.trim();
    if (!name || !url) return;
    setPress([...press, { name, homepage_url: url }]);
    setNewPress({ name: '', homepage_url: '' });
  }

  function doClear() {
    const label = CLEAR_RANGES.find((r) => r.value === clearRange)?.label ?? '';
    if (!confirm(`Xóa dữ liệu tin (${label})? Không thể hoàn tác.`)) return;
    startTransition(async () => {
      const res = await clearData(clearRange);
      if (!res.ok) alert('Lỗi: ' + res.error);
      else {
        alert(`Đã xóa ${res.removed} tin.`);
        router.refresh();
      }
    });
  }

  return (
    <main className="p-8 max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Cài đặt hệ thống</h1>
        {isAdmin && (
          <button
            onClick={save}
            disabled={pending}
            className="bg-blue-600 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-60"
          >
            {pending ? 'Đang lưu…' : 'Lưu cài đặt'}
          </button>
        )}
      </div>

      {ro && (
        <p className="mb-4 text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
          Bạn đang ở chế độ chỉ xem. Chỉ admin mới được chỉnh cài đặt.
        </p>
      )}

      <div className="space-y-6">
        <Section title="⚙️ Cài đặt quét">
          <Row label="Cách tìm kiếm" hint="Cách dựng truy vấn Google News">
            <select
              value={scan.search_match_mode}
              disabled={ro}
              onChange={(e) => setScan({ ...scan, search_match_mode: e.target.value })}
              className="border rounded-lg px-2 py-1.5 text-sm text-gray-900 max-w-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {SEARCH_MODE_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </Row>
          <Row label="Số tin tối đa / mục tiêu" hint="Mỗi lần quét (1–100)">
            <input
              type="number"
              min={1}
              max={100}
              value={scan.max_results_per_target}
              disabled={ro}
              onChange={(e) => setScan({ ...scan, max_results_per_target: Number(e.target.value) })}
              className={numCls}
            />
          </Row>
          <Row label="Chỉ lấy tin trong (ngày)" hint="Bỏ qua bài cũ hơn (1–90)">
            <input
              type="number"
              min={1}
              max={90}
              value={scan.scan_lookback_days}
              disabled={ro}
              onChange={(e) => setScan({ ...scan, scan_lookback_days: Number(e.target.value) })}
              className={numCls}
            />
          </Row>
          <Row
            label="Chỉ lấy bài có tên trong tiêu đề"
            hint="Loại bài tên chỉ nằm trong thân (giảm bài lạc)"
          >
            <Toggle
              checked={scan.require_name_in_title}
              disabled={ro}
              onChange={(v) => setScan({ ...scan, require_name_in_title: v })}
            />
          </Row>
          <Row label="Tự động quét nền" hint="Quét theo chu kỳ khi server chạy">
            <Toggle
              checked={scan.auto_scan_enabled}
              disabled={ro}
              onChange={(v) => setScan({ ...scan, auto_scan_enabled: v })}
            />
          </Row>
          <Row label="Chu kỳ quét (phút)" hint="Tối thiểu 5 phút">
            <input
              type="number"
              min={5}
              max={1440}
              value={scan.scan_interval_minutes}
              disabled={ro}
              onChange={(e) => setScan({ ...scan, scan_interval_minutes: Number(e.target.value) })}
              className={numCls}
            />
          </Row>
          <Row label="Làm mới giao diện (giây)" hint="10–300">
            <input
              type="number"
              min={10}
              max={300}
              value={scan.ui_refresh_seconds}
              disabled={ro}
              onChange={(e) => setScan({ ...scan, ui_refresh_seconds: Number(e.target.value) })}
              className={numCls}
            />
          </Row>
        </Section>

        <Section title="✈️ Thông báo Telegram">
          <Row label="Bật gửi Telegram" hint="Gửi tin khi quét thấy bài mới">
            <Toggle checked={tg.enabled} disabled={ro} onChange={(v) => setTg({ ...tg, enabled: v })} />
          </Row>
          <Row label="Chỉ thông báo đổi chức vụ" hint="Tắt = gửi mọi tin hoạt động">
            <Toggle
              checked={tg.notify_role_change_only}
              disabled={ro}
              onChange={(v) => setTg({ ...tg, notify_role_change_only: v })}
            />
          </Row>
          <Row label="Gửi cả khi không có tin" hint="Khuyên tắt để tránh spam">
            <Toggle
              checked={tg.notify_on_empty}
              disabled={ro}
              onChange={(v) => setTg({ ...tg, notify_on_empty: v })}
            />
          </Row>
          <div className="space-y-2 pt-2 border-t border-gray-100">
            <input
              type="password"
              value={botToken}
              disabled={ro}
              onChange={(e) => setBotToken(e.target.value)}
              placeholder={
                settings.telegram.bot_token_configured
                  ? 'Bot token (đã cấu hình — nhập để thay)'
                  : 'Bot token (từ @BotFather)'
              }
              className="w-full border rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="text"
              value={chatId}
              disabled={ro}
              onChange={(e) => setChatId(e.target.value)}
              placeholder={
                settings.telegram.chat_id_configured
                  ? 'Chat ID (đã cấu hình — nhập để thay)'
                  : 'Chat ID người/nhóm nhận'
              }
              className="w-full border rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {isAdmin && (
              <button
                onClick={doTestTelegram}
                disabled={pending}
                className="text-sm px-3 py-1.5 rounded-lg border text-gray-700 hover:bg-gray-50 disabled:opacity-60"
              >
                Gửi thử
              </button>
            )}
          </div>
        </Section>

        <Section title="📰 Danh sách báo chính thống">
          <Row
            label="Chỉ báo chính thống"
            hint="Chưa áp dụng cho scanner hiện tại (sẽ nối sau)"
          >
            <Toggle checked={filterCt} disabled={ro} onChange={setFilterCt} />
          </Row>
          <div className="space-y-2">
            {press.length === 0 ? (
              <p className="text-sm text-gray-400">Chưa có báo nào.</p>
            ) : (
              press.map((p, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between bg-gray-50 rounded-lg px-3 py-2"
                >
                  <div className="min-w-0">
                    <div className="text-sm text-gray-900">{p.name}</div>
                    <div className="text-xs text-gray-400 truncate">{p.homepage_url}</div>
                  </div>
                  {isAdmin && (
                    <button
                      onClick={() => setPress(press.filter((_, idx) => idx !== i))}
                      className="text-red-600 text-sm hover:underline shrink-0"
                    >
                      Xóa
                    </button>
                  )}
                </div>
              ))
            )}
          </div>
          {isAdmin && (
            <div className="flex gap-2 pt-2">
              <input
                value={newPress.name}
                onChange={(e) => setNewPress({ ...newPress, name: e.target.value })}
                placeholder="Tên báo"
                className="flex-1 border rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                value={newPress.homepage_url}
                onChange={(e) => setNewPress({ ...newPress, homepage_url: e.target.value })}
                placeholder="https://vnexpress.net/"
                className="flex-1 border rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={addPress}
                className="px-3 py-2 rounded-lg text-sm border text-gray-700 hover:bg-gray-50 shrink-0"
              >
                Thêm
              </button>
            </div>
          )}
        </Section>

        <Section title="🗄️ Quản lý dữ liệu">
          {stats && (
            <p className="text-sm text-gray-600">
              {stats.total} tin ({stats.hoatdong} hoạt động · {stats.biendong} đổi chức vụ) ·{' '}
              {formatBytes(stats.bytes)}
            </p>
          )}
          {isAdmin && (
            <>
              <div className="flex flex-wrap gap-3 pt-2">
                {CLEAR_RANGES.map((r) => (
                  <label key={r.value} className="flex items-center gap-1.5 text-sm text-gray-700">
                    <input
                      type="radio"
                      name="clearRange"
                      value={r.value}
                      checked={clearRange === r.value}
                      onChange={() => setClearRange(r.value)}
                    />
                    {r.label}
                  </label>
                ))}
              </div>
              <button
                onClick={doClear}
                disabled={pending}
                className="mt-2 px-4 py-2 rounded-lg text-sm bg-red-600 text-white font-medium hover:bg-red-700 disabled:opacity-60"
              >
                Xóa dữ liệu đã chọn
              </button>
            </>
          )}
        </Section>
      </div>
    </main>
  );
}
