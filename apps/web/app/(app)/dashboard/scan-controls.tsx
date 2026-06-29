'use client';

import { useTransition } from 'react';
import { useRouter } from 'next/navigation';
import type { ScanStatus } from '@/lib/scanner';
import { formatTimestamp } from '@/lib/format';
import { runScan, toggleAutoScan } from './actions';

export function ScanControls({
  status,
  isAdmin,
}: {
  status: ScanStatus | null;
  isAdmin: boolean;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const scanning = status?.isScanning || pending;

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
    <div className="flex items-center gap-3 flex-wrap">
      {status?.lastRun && (
        <span className="text-xs text-gray-400">
          Quét gần nhất: {formatTimestamp(status.lastRun)} · +{status.lastAdded} tin
        </span>
      )}
      {isAdmin && (
        <>
          <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={!!status?.autoScanEnabled}
              onChange={toggle}
              disabled={pending}
            />
            Tự động quét
          </label>
          <button
            onClick={scan}
            disabled={scanning}
            className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-60"
          >
            {scanning ? (
              <>
                <span className="inline-block w-3 h-3 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                Đang quét…
              </>
            ) : (
              'Quét ngay'
            )}
          </button>
        </>
      )}
    </div>
  );
}
