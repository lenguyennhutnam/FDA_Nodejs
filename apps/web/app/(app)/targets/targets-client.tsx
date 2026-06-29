'use client';

import { useState, useMemo, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Modal } from '@/components/Modal';
import type { Target } from '@/lib/targets';
import { createTarget, updateTarget, deleteTarget } from './actions';

type FormState = { name: string; position: string; bio: string };
const EMPTY: FormState = { name: '', position: '', bio: '' };

export function TargetsClient({
  targets,
  isAdmin,
}: {
  targets: Target[];
  isAdmin: boolean;
}) {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Target | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY);
  const [error, setError] = useState('');
  const [pending, startTransition] = useTransition();

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return targets;
    return targets.filter(
      (t) =>
        t.name.toLowerCase().includes(q) || t.position.toLowerCase().includes(q),
    );
  }, [targets, search]);

  function openAdd() {
    setEditing(null);
    setForm(EMPTY);
    setError('');
    setModalOpen(true);
  }

  function openEdit(t: Target) {
    setEditing(t);
    setForm({ name: t.name, position: t.position, bio: t.bio });
    setError('');
    setModalOpen(true);
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    if (!form.name.trim()) {
      setError('Vui lòng nhập họ tên');
      return;
    }
    startTransition(async () => {
      const res = editing
        ? await updateTarget(editing.id, form)
        : await createTarget(form);
      if (res.ok) {
        setModalOpen(false);
        router.refresh();
      } else {
        setError(res.error);
      }
    });
  }

  function remove(t: Target) {
    if (!confirm(`Xóa mục tiêu "${t.name}"?`)) return;
    startTransition(async () => {
      const res = await deleteTarget(t.id);
      if (!res.ok) alert(res.error);
      else router.refresh();
    });
  }

  return (
    <main className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Mục tiêu bảo vệ</h1>
          <p className="text-gray-500 mt-1 text-sm">{targets.length} mục tiêu</p>
        </div>
        {isAdmin && (
          <button
            onClick={openAdd}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700"
          >
            + Thêm mục tiêu
          </button>
        )}
      </div>

      <input
        type="search"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Tìm theo tên hoặc chức vụ…"
        className="w-full max-w-sm mb-4 border rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
      />

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-600 text-left">
            <tr>
              <th className="px-4 py-3 font-medium">Họ tên</th>
              <th className="px-4 py-3 font-medium">Chức vụ</th>
              <th className="px-4 py-3 font-medium">Tiểu sử</th>
              {isAdmin && <th className="px-4 py-3 font-medium w-32">Thao tác</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filtered.length === 0 ? (
              <tr>
                <td
                  colSpan={isAdmin ? 4 : 3}
                  className="px-4 py-8 text-center text-gray-400"
                >
                  {targets.length === 0
                    ? 'Chưa có mục tiêu nào. Bấm "Thêm mục tiêu" để bắt đầu.'
                    : 'Không tìm thấy mục tiêu khớp.'}
                </td>
              </tr>
            ) : (
              filtered.map((t) => (
                <tr key={t.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-900">{t.name}</td>
                  <td className="px-4 py-3 text-gray-700">{t.position || '—'}</td>
                  <td className="px-4 py-3 text-gray-500 max-w-xs truncate">
                    {t.bio || '—'}
                  </td>
                  {isAdmin && (
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button
                          onClick={() => openEdit(t)}
                          className="text-blue-600 hover:underline"
                        >
                          Sửa
                        </button>
                        <button
                          onClick={() => remove(t)}
                          className="text-red-600 hover:underline"
                          disabled={pending}
                        >
                          Xóa
                        </button>
                      </div>
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? 'Sửa mục tiêu' : 'Thêm mục tiêu'}
      >
        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-900">Họ tên *</label>
            <input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full border rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              autoFocus
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-900">Chức vụ</label>
            <input
              value={form.position}
              onChange={(e) => setForm({ ...form, position: e.target.value })}
              className="w-full border rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-900">Tiểu sử</label>
            <textarea
              value={form.bio}
              onChange={(e) => setForm({ ...form, bio: e.target.value })}
              rows={4}
              className="w-full border rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="px-4 py-2 rounded-lg text-sm border text-gray-700 hover:bg-gray-50"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={pending}
              className="px-4 py-2 rounded-lg text-sm bg-blue-600 text-white font-medium hover:bg-blue-700 disabled:opacity-50"
            >
              {pending ? 'Đang lưu…' : 'Lưu'}
            </button>
          </div>
        </form>
      </Modal>
    </main>
  );
}
