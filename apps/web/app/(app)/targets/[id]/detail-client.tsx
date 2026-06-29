'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import type { NotificationRecord, TargetDetail } from '@/lib/notifications';
import { formatTimestamp } from '@/lib/format';
import { labelArticles } from './actions';

type Tab = 'relevant' | 'irrelevant';

function RecordCard({
  rec,
  checked,
  onToggle,
  dimmed,
}: {
  rec: NotificationRecord;
  checked: boolean;
  onToggle: () => void;
  dimmed?: boolean;
}) {
  const ai = rec.ai_result || {};
  const url = rec.article_url || rec.resolved_url || rec.url || '';
  const press = rec.press_name || rec.press_domain || '';
  const bullets = Array.isArray(ai.Activity_Bullets) ? ai.Activity_Bullets : [];
  const isChange = !!ai.Is_Change;

  return (
    <article
      className={`border rounded-lg p-4 cursor-pointer transition ${
        checked ? 'border-blue-400 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
      } ${dimmed ? 'opacity-60' : ''}`}
      onClick={onToggle}
    >
      <div className="flex items-start gap-3">
        <input
          type="checkbox"
          checked={checked}
          onChange={onToggle}
          onClick={(e) => e.stopPropagation()}
          className="mt-1"
        />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            {press && <span className="text-xs text-gray-500">{press}</span>}
            {isChange && (
              <span className="text-xs px-1.5 py-0.5 rounded bg-amber-100 text-amber-800">
                Đổi chức vụ
              </span>
            )}
          </div>
          <h3 className="font-medium text-gray-900 mt-1">
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="hover:text-blue-600"
            >
              {rec.title}
            </a>
          </h3>
          {rec.timestamp && (
            <div className="text-xs text-gray-400 mt-1">{formatTimestamp(rec.timestamp)}</div>
          )}
          {(ai.From_Position || ai.To_Position || ai.Position_Full_Official) && (
            <dl className="text-sm mt-2 text-gray-700">
              {(ai.Position_Full_Official || ai.To_Position) && (
                <div className="flex gap-2">
                  <dt className="text-gray-400">Chức vụ:</dt>
                  <dd>{ai.Position_Full_Official || ai.To_Position}</dd>
                </div>
              )}
              {ai.From_Position && (
                <div className="flex gap-2">
                  <dt className="text-gray-400">Trước đây:</dt>
                  <dd>{ai.From_Position}</dd>
                </div>
              )}
            </dl>
          )}
          {bullets.length > 0 && (
            <ul className="list-disc list-inside text-sm text-gray-600 mt-2">
              {bullets.map((b, i) => (
                <li key={i}>{b}</li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </article>
  );
}

export function DetailClient({
  targetId,
  detail,
}: {
  targetId: string;
  detail: TargetDetail;
}) {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>('relevant');
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [pending, startTransition] = useTransition();

  const rel = detail.records_hoatdong;
  const irrel = detail.records_hoatdong_irrelevant;
  const bd = detail.records_biendong;
  const activeList = tab === 'relevant' ? rel : irrel;

  function keyOf(r: NotificationRecord) {
    return r.url || r.article_url || '';
  }

  function toggle(r: NotificationRecord) {
    const k = keyOf(r);
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(k) ? next.delete(k) : next.add(k);
      return next;
    });
  }

  function applyLabel(label: string) {
    const urls = Array.from(selected);
    if (!urls.length) return;
    startTransition(async () => {
      const res = await labelArticles(targetId, urls, label);
      if (!res.ok) {
        alert(res.error);
        return;
      }
      setSelected(new Set());
      router.refresh();
    });
  }

  function exportJson() {
    const blob = new Blob([JSON.stringify(detail, null, 2)], {
      type: 'application/json',
    });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `target_${detail.target_name}_${detail.since_hours}h.json`;
    a.click();
    URL.revokeObjectURL(a.href);
  }

  return (
    <div className="space-y-8">
      {/* Hoạt động */}
      <section>
        <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
          <h2 className="text-lg font-semibold text-gray-900">Hoạt động</h2>
          <button
            onClick={exportJson}
            className="text-sm px-3 py-1.5 rounded-lg border text-gray-700 hover:bg-gray-50"
          >
            Tải JSON
          </button>
        </div>

        <div className="flex gap-2 mb-3">
          <button
            onClick={() => {
              setTab('relevant');
              setSelected(new Set());
            }}
            className={`text-sm px-3 py-1.5 rounded-lg ${
              tab === 'relevant' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'
            }`}
          >
            Tin liên quan ({rel.length})
          </button>
          <button
            onClick={() => {
              setTab('irrelevant');
              setSelected(new Set());
            }}
            className={`text-sm px-3 py-1.5 rounded-lg ${
              tab === 'irrelevant' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'
            }`}
          >
            Không liên quan ({irrel.length})
          </button>
        </div>

        {selected.size > 0 && (
          <div className="flex items-center gap-2 mb-3 bg-gray-50 border rounded-lg px-3 py-2">
            <span className="text-sm text-gray-600">{selected.size} bài được chọn</span>
            <div className="flex-1" />
            {tab === 'relevant' ? (
              <button
                onClick={() => applyLabel('irrelevant')}
                disabled={pending}
                className="text-sm px-3 py-1 rounded-lg border text-gray-700 hover:bg-white disabled:opacity-50"
              >
                Đánh dấu không liên quan
              </button>
            ) : (
              <button
                onClick={() => applyLabel('')}
                disabled={pending}
                className="text-sm px-3 py-1 rounded-lg border text-gray-700 hover:bg-white disabled:opacity-50"
              >
                Khôi phục
              </button>
            )}
            <button
              onClick={() => setSelected(new Set())}
              className="text-sm px-3 py-1 rounded-lg text-gray-500 hover:text-gray-700"
            >
              Bỏ chọn
            </button>
          </div>
        )}

        <div className="space-y-3">
          {activeList.length === 0 ? (
            <p className="text-sm text-gray-400">
              {tab === 'relevant' ? 'Chưa có tin liên quan.' : 'Chưa có tin không liên quan.'}
            </p>
          ) : (
            activeList.map((r) => (
              <RecordCard
                key={keyOf(r)}
                rec={r}
                checked={selected.has(keyOf(r))}
                onToggle={() => toggle(r)}
                dimmed={tab === 'irrelevant'}
              />
            ))
          )}
        </div>
      </section>

      {/* Đổi chức vụ */}
      <section>
        <h2 className="text-lg font-semibold text-gray-900 mb-3">Thay đổi chức vụ</h2>
        <div className="space-y-3">
          {bd.length === 0 ? (
            <p className="text-sm text-gray-400">Chưa có tin.</p>
          ) : (
            bd.map((r) => (
              <RecordCard
                key={keyOf(r)}
                rec={r}
                checked={selected.has(keyOf(r))}
                onToggle={() => toggle(r)}
              />
            ))
          )}
        </div>
      </section>
    </div>
  );
}
