'use client';

import { useTransition, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import type { ScanStatus } from '@/lib/scanner';
import { formatTimestamp } from '@/lib/format';
import { runScan, toggleAutoScan } from './actions';

export function ScanControls({
  status,
  isAdmin,
  uiRefreshSeconds,
}: {
  status: ScanStatus | null;
  isAdmin: boolean;
  uiRefreshSeconds?: number;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const scanning = status?.isScanning || pending;

  useEffect(() => {
    const seconds = uiRefreshSeconds && uiRefreshSeconds >= 10 ? uiRefreshSeconds : 30;
    const interval = setInterval(() => {
      router.refresh();
    }, seconds * 1000);
    return () => clearInterval(interval);
  }, [router, uiRefreshSeconds]);

  function scan() {
    startTransition(async () => {
      const res = await runScan();
      if (!res.ok) {
        alert('Quét lỗi: ' + res.error);
        return;
      }
      const n = res.added ?? 0;
      alert(
        n > 0
          ? `Đã quét xong — thêm ${n} tin mới.`
          : 'Đã quét xong — không có tin mới (các tin đã có từ trước).',
      );
      router.refresh();
    });
  }

  function toggle() {
    startTransition(async () => {
      await toggleAutoScan(!status?.autoScanEnabled);
      router.refresh();
    });
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
      <div className={`grid grid-cols-1 ${isAdmin ? 'md:grid-cols-3' : 'md:grid-cols-2'} gap-6 divide-y md:divide-y-0 md:divide-x divide-gray-100`}>
        
        {/* Cấu hình tự động quét */}
        <div className="flex items-center justify-between gap-4 pr-0 md:pr-6 pb-4 md:pb-0">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg shrink-0 ${status?.autoScanEnabled ? 'bg-emerald-50 text-emerald-600' : 'bg-gray-50 text-gray-400'}`}>
              🔄
            </div>
            <div>
              <div className="text-sm font-semibold text-gray-900">Tự động quét</div>
              <div className="text-xs text-gray-400">Chạy ngầm theo chu kỳ</div>
            </div>
          </div>
          
          {isAdmin ? (
            <div className="flex items-center gap-2.5">
              <span className={`text-xs font-semibold ${status?.autoScanEnabled ? 'text-emerald-600' : 'text-gray-400'}`}>
                {status?.autoScanEnabled ? 'Đang bật' : 'Đang tắt'}
              </span>
              <button
                onClick={toggle}
                disabled={pending}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500/20 disabled:opacity-50 ${
                  status?.autoScanEnabled ? 'bg-emerald-500' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                    status?.autoScanEnabled ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          ) : (
            <span className={`text-xs px-2.5 py-1 rounded-full font-semibold ${status?.autoScanEnabled ? 'bg-emerald-50 text-emerald-700' : 'bg-gray-100 text-gray-600'}`}>
              {status?.autoScanEnabled ? 'Bật' : 'Tắt'}
            </span>
          )}
        </div>

        {/* Quét thủ công (Chỉ hiển thị cho admin) */}
        {isAdmin && (
          <div className="flex items-center justify-between gap-4 md:px-6 py-4 md:py-0">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg shrink-0 ${scanning ? 'bg-blue-50 text-blue-600' : 'bg-gray-50 text-gray-500'}`}>
                📡
              </div>
              <div>
                <div className="text-sm font-semibold text-gray-900">Quét thủ công</div>
                <div className="text-xs text-gray-400">Tìm bài viết mới ngay</div>
              </div>
            </div>
            <button
              onClick={scan}
              disabled={scanning}
              className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white px-4 py-2 rounded-xl text-sm font-semibold shadow-sm hover:shadow transition duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {scanning ? (
                <>
                  <span className="inline-block w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  Đang quét…
                </>
              ) : (
                <>
                  <span>🔍</span>
                  Quét ngay
                </>
              )}
            </button>
          </div>
        )}

        {/* Lần quét gần nhất */}
        <div className="flex items-center gap-4 md:pl-6 pt-4 md:pt-0">
          <div className="w-10 h-10 rounded-xl bg-violet-50 text-violet-600 flex items-center justify-center text-lg shrink-0">
            ⏱️
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-semibold text-gray-900">Lần quét cuối cùng</div>
            {status?.lastRun ? (
              <div className="flex items-center gap-2.5 mt-0.5 flex-wrap">
                <span className="text-xs text-gray-500 font-medium">
                  {formatTimestamp(status.lastRun)}
                </span>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${status.lastAdded > 0 ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-100 text-gray-600'}`}>
                  +{status.lastAdded} tin mới
                </span>
              </div>
            ) : (
              <div className="text-xs text-gray-400 mt-0.5">Chưa thực hiện quét</div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
