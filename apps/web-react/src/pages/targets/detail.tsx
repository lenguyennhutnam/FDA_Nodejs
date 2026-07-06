import { useState, useEffect, useCallback } from 'react';
import { useParams, useSearchParams, Link } from 'react-router-dom';
import { Box, CircularProgress } from '@mui/material';
import { StoreService } from '@/utils/store';
import { TargetService, type Target } from '@/lib/apis/targets';
import { NotificationService, type NotificationRecord, type TargetDetail } from '@/lib/apis/notifications';
import { formatTimestamp, STATUS_META } from '@/lib/format';
import { RouterLink } from '@/routers/routers';

import { TButton } from '@/components/tButton';
import { TTabs, TTab } from '@/components/tTabs';

function parseAiResult(ai: any) {
  if (typeof ai === 'string') {
    try { return JSON.parse(ai); } catch { return {}; }
  }
  return ai || {};
}

function RecordCard({ rec, checked, onToggle, dimmed, onChangeNewsKind }: { rec: NotificationRecord; checked: boolean; onToggle: () => void; dimmed?: boolean; onChangeNewsKind?: (kind: 'hoatdong' | 'biendong') => void }) {
  const ai = parseAiResult(rec.ai_result);
  const url = rec.article_url || rec.resolved_url || rec.url || '';
  const press = rec.press_name || rec.press_domain || '';
  const bullets = Array.isArray(ai.Activity_Bullets) ? ai.Activity_Bullets : [];
  const isChange = rec.news_kind === 'biendong';

  return (
    <article
      className={`group relative border rounded-2xl p-5 cursor-pointer transition-all duration-300 overflow-hidden ${
        checked 
          ? 'border-blue-400 bg-blue-50/50 shadow-md shadow-blue-900/5 translate-x-1' 
          : 'border-gray-200 bg-white hover:border-blue-300 hover:shadow-lg hover:shadow-gray-200/50 hover:-translate-y-0.5'
      } ${dimmed ? 'opacity-60 saturate-50' : ''}`}
      onClick={onToggle}
    >
      {/* Decorative accent for selected state */}
      {checked && <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500 rounded-l-2xl"></div>}
      
      <div className="flex items-start gap-4">
        <div className="pt-1">
          <div className={`w-5 h-5 rounded-md border flex items-center justify-center transition-colors ${checked ? 'bg-blue-600 border-blue-600' : 'border-gray-300 group-hover:border-blue-400'}`}>
            {checked && <span className="text-white text-xs font-bold">✓</span>}
          </div>
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between mb-1.5">
            <div className="flex items-center gap-2 flex-wrap">
              {press && <span className="text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-100 px-2 py-0.5 rounded">{press}</span>}
              {isChange && <span className="text-xs font-semibold px-2 py-0.5 rounded bg-gradient-to-r from-amber-100 to-orange-100 text-amber-800 border border-amber-200">Đổi chức vụ</span>}
            </div>
            
            {onChangeNewsKind && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onChangeNewsKind(isChange ? 'hoatdong' : 'biendong');
                }}
                className={`text-xs px-2.5 py-1 rounded-md transition-colors border ${
                  isChange 
                    ? 'border-gray-200 text-gray-600 hover:bg-gray-100' 
                    : 'border-amber-200 text-amber-700 bg-amber-50 hover:bg-amber-100'
                }`}
              >
                {isChange ? 'Chuyển thành Hoạt động thường' : 'Đánh dấu Đổi chức vụ'}
              </button>
            )}
          </div>
          <h3 className="font-bold text-gray-900 text-lg leading-snug">
            <a href={url} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()} className="hover:text-blue-600 transition-colors">
              {rec.title}
            </a>
          </h3>
          {rec.timestamp && <div className="text-xs font-mono text-gray-400 mt-1">{formatTimestamp(rec.timestamp)}</div>}
          
          {(ai.From_Position || ai.To_Position || ai.Position_Full_Official) && (
            <div className="mt-3 bg-gray-50/80 rounded-xl p-3 border border-gray-100">
              <dl className="text-sm text-gray-700 grid grid-cols-[max-content_1fr] gap-x-3 gap-y-1">
                {(ai.Position_Full_Official || ai.To_Position) && (
                  <>
                    <dt className="text-gray-400 font-medium">Chức vụ:</dt>
                    <dd className="font-semibold text-gray-900">{ai.Position_Full_Official || ai.To_Position}</dd>
                  </>
                )}
                {ai.From_Position && (
                  <>
                    <dt className="text-gray-400 font-medium">Trước đây:</dt>
                    <dd className="line-through text-gray-500">{ai.From_Position}</dd>
                  </>
                )}
              </dl>
            </div>
          )}
          
          {bullets.length > 0 && (
            <ul className="mt-3 space-y-1.5">
              {bullets.map((b, i) => (
                <li key={i} className="text-sm text-gray-700 flex items-start gap-2">
                  <span className="text-blue-500 mt-0.5">•</span>
                  <span className="leading-relaxed">{b}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </article>
  );
}

export default function TargetDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const hours = Number(searchParams.get('hours') ?? '24') || 24;

  const [target, setTarget] = useState<Target | null>(null);
  const [detail, setDetail] = useState<TargetDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [tab, setTab] = useState<Tab>('relevant');
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [pending, setPending] = useState(false);

  const fetchData = useCallback(async () => {
    if (!id) return;
    const token = StoreService.getAuthToken() ?? '';
    try {
      const tg = await TargetService.fetchTarget(id, token);
      if (!tg) {
        setError('Không tìm thấy mục tiêu');
        return;
      }
      setTarget(tg);
      const dt = await NotificationService.fetchDetail(tg.name, hours, token);
      setDetail(dt);
    } catch (e: any) {
      setError(e.message || 'Lỗi khi tải dữ liệu');
    } finally {
      setLoading(false);
    }
  }, [id, hours]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error || !target) {
    return (
      <main className="p-8">
        <Link to={RouterLink.TARGETS} className="text-sm text-blue-600 hover:underline">← Quay lại</Link>
        <p className="text-gray-500 mt-4">{error || 'Không tìm thấy thông tin.'}</p>
      </main>
    );
  }

  const summary = detail?.summary;
  const meta = summary ? STATUS_META[summary.status] ?? STATUS_META.no_data : STATUS_META.no_data;
  
  const rel = detail?.records_hoatdong || [];
  const irrel = detail?.records_hoatdong_irrelevant || [];
  const bd = detail?.records_biendong || [];

  const keyOf = (r: NotificationRecord) => r.url || r.article_url || '';
  
  const toggle = (r: NotificationRecord) => {
    const k = keyOf(r);
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(k) ? next.delete(k) : next.add(k);
      return next;
    });
  };

  const updateNewsKind = async (r: NotificationRecord, kind: 'hoatdong'|'biendong') => {
    const url = keyOf(r);
    const token = StoreService.getAuthToken() ?? '';
    setPending(true);
    try {
      await NotificationService.setNewsKind(url, target.name, kind, token);
      await fetchData();
    } catch (e: any) {
      alert(e.message || 'Lỗi khi cập nhật trạng thái');
    } finally {
      setPending(false);
    }
  };

  const applyLabel = async (label: string) => {
    const urls = Array.from(selected);
    if (!urls.length) return;
    const token = StoreService.getAuthToken() ?? '';
    setPending(true);
    try {
      await NotificationService.label(urls, label, token);
      setSelected(new Set());
      await fetchData();
    } catch (e: any) {
      alert(e.message || 'Lỗi khi gán nhãn');
    } finally {
      setPending(false);
    }
  };

  const exportJson = () => {
    if (!detail) return;
    const blob = new Blob([JSON.stringify(detail, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `target_${detail.target_name}_${detail.since_hours}h.json`;
    a.click();
    URL.revokeObjectURL(a.href);
  };

  // Bulk actions toolbar component
  const BulkActions = ({ isRelevantTab }: { isRelevantTab: boolean }) => {
    if (selected.size === 0) return null;
    return (
      <div className="sticky top-4 z-10 flex items-center gap-3 mb-4 bg-white/80 backdrop-blur-lg border border-gray-200/50 shadow-[0_8px_30px_rgb(0,0,0,0.08)] rounded-xl px-4 py-3 transform transition-all duration-300">
        <span className="text-sm font-semibold bg-blue-100 text-blue-700 px-2 py-0.5 rounded-md">{selected.size} bài đã chọn</span>
        <div className="flex-1" />
        {isRelevantTab ? (
          <TButton 
            variant="outlined"
            color="warning"
            onClick={() => applyLabel('irrelevant')} 
            disabled={pending} 
            sx={{ borderRadius: '8px', textTransform: 'none' }}
          >
            ❌ Đánh dấu không liên quan
          </TButton>
        ) : (
          <TButton 
            variant="outlined"
            color="success"
            onClick={() => applyLabel('')} 
            disabled={pending}
            sx={{ borderRadius: '8px', textTransform: 'none' }}
          >
            ✅ Khôi phục lại
          </TButton>
        )}
        <TButton 
          variant="text"
          color="inherit"
          onClick={() => setSelected(new Set())} 
          sx={{ borderRadius: '8px', textTransform: 'none', color: 'text.secondary' }}
        >
          Bỏ chọn
        </TButton>
      </div>
    );
  };

  return (
    <main className="p-4 sm:p-8 max-w-6xl mx-auto min-h-screen bg-gray-50/30">
      <Link to={RouterLink.DASHBOARD} className="inline-flex items-center gap-1 text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors mb-4">
        <span>←</span> Quay lại Dashboard
      </Link>

      {/* Hero Banner Section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-indigo-900 via-blue-900 to-blue-800 rounded-3xl shadow-xl p-8 sm:p-10 text-white mb-8">
        {/* Background decorative elements */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 rounded-full bg-white/10 blur-3xl"></div>
        <div className="absolute bottom-0 left-0 -ml-10 -mb-10 w-40 h-40 rounded-full bg-blue-400/20 blur-2xl"></div>
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-start justify-between gap-6">
          <div className="flex-1">
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-2">{target.name}</h1>
            {target.position && (
              <div className="flex items-center gap-2 text-blue-100 text-lg font-medium">
                <span>💼</span> {target.position}
              </div>
            )}
            <p className="text-blue-200/80 text-sm mt-2 font-mono">Dữ liệu trong {hours} giờ qua</p>
            
            {target.bio && (
              <div className="mt-6 bg-white/10 backdrop-blur-md rounded-2xl p-5 border border-white/10">
                <p className="text-sm text-blue-50 leading-relaxed whitespace-pre-line">{target.bio}</p>
              </div>
            )}
          </div>
          
          <div className="shrink-0 flex flex-col gap-4 items-end">
            <span className="inline-flex items-center gap-1.5 bg-white/10 backdrop-blur-md px-4 py-1.5 rounded-full border border-white/20 text-sm font-medium">
              <span>{meta.icon}</span> {meta.label}
            </span>
            
            {summary && (
              <div className="flex flex-col gap-2 w-full md:w-auto">
                <div className="bg-white/10 backdrop-blur-md rounded-xl p-3 px-5 border border-white/10 flex items-center justify-between gap-4">
                  <span className="text-blue-200 text-sm font-medium">Hoạt động</span>
                  <span className="text-2xl font-bold">{summary.activity_count}</span>
                </div>
                <div className="bg-white/10 backdrop-blur-md rounded-xl p-3 px-5 border border-white/10 flex items-center justify-between gap-4">
                  <span className="text-amber-200 text-sm font-medium">Đổi chức vụ</span>
                  <span className="text-2xl font-bold">{summary.change_count}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {!detail ? (
        <div className="text-center py-12 bg-white rounded-3xl border border-gray-100 shadow-sm">
          <span className="text-4xl block mb-2 opacity-30">📭</span>
          <p className="text-gray-400">Không tải được dữ liệu tin tức.</p>
        </div>
      ) : (
        <div className="space-y-8">
          <section className="bg-white rounded-3xl p-2 sm:p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-4 px-2">
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <span className="bg-blue-100 text-blue-600 p-1.5 rounded-lg">📰</span> Bảng tin Hoạt động
              </h2>
              <TButton 
                variant="outlined" 
                onClick={exportJson} 
                sx={{ borderRadius: '10px', textTransform: 'none', borderColor: '#e5e7eb', color: '#4b5563' }}
              >
                📥 Xuất JSON
              </TButton>
            </div>

            <TTabs 
              onChange={(newTab: number) => {
                setTab(newTab === 0 ? 'relevant' : 'irrelevant');
                setSelected(new Set());
              }}
            >
              <TTab label={`📌 Tin liên quan (${rel.length})`}>
                <BulkActions isRelevantTab={true} />
                <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                  {rel.length === 0 ? (
                    <div className="text-center py-10 bg-gray-50/50 rounded-2xl border border-dashed border-gray-200">
                      <p className="text-sm text-gray-400 font-medium">Chưa có tin liên quan nào.</p>
                    </div>
                  ) : (
                    rel.map((r) => <RecordCard key={keyOf(r)} rec={r} checked={selected.has(keyOf(r))} onToggle={() => toggle(r)} onChangeNewsKind={(kind) => updateNewsKind(r, kind)} />)
                  )}
                </div>
              </TTab>
              <TTab label={`🗑️ Không liên quan (${irrel.length})`}>
                <BulkActions isRelevantTab={false} />
                <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                  {irrel.length === 0 ? (
                    <div className="text-center py-10 bg-gray-50/50 rounded-2xl border border-dashed border-gray-200">
                      <p className="text-sm text-gray-400 font-medium">Thùng rác trống.</p>
                    </div>
                  ) : (
                    irrel.map((r) => <RecordCard key={keyOf(r)} rec={r} checked={selected.has(keyOf(r))} onToggle={() => toggle(r)} dimmed />)
                  )}
                </div>
              </TTab>
            </TTabs>
          </section>

          {bd.length > 0 && (
            <section className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
              <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <span className="bg-amber-100 text-amber-600 p-1.5 rounded-lg">⚠️</span> Cảnh báo Đổi chức vụ
              </h2>
              <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                {bd.map((r) => <RecordCard key={keyOf(r)} rec={r} checked={selected.has(keyOf(r))} onToggle={() => toggle(r)} onChangeNewsKind={(kind) => updateNewsKind(r, kind)} />)}
              </div>
            </section>
          )}
        </div>
      )}
    </main>
  );
}
