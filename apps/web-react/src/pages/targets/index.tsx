'use client';

import { useState, useEffect, useCallback } from 'react';
import { Box, Button, Typography } from '@mui/material';
import { FaEdit, FaTrash } from 'react-icons/fa';
import { IoAddCircle } from 'react-icons/io5';
import { TTable } from '@/components/tTable';
import TSearchText from '@/components/tSearchText';
import { TFormModal } from '@/components/tFormModal';
import { TShowConfirm } from '@/components/tShowConfirm';
import { addActionToRows } from '@/lib/utils/table-helper';
import { useAppSelector } from '@/hooks';
import { StoreService } from '@/utils/store';
import { TargetService, type Target, type TargetInput } from '@/lib/apis/targets';

const columns = [
  { id: 'name', label: 'Họ tên', minWidth: 200 },
  { id: 'position', label: 'Chức vụ', minWidth: 180 },
  { id: 'bio', label: 'Tiểu sử', minWidth: 350 },
  { id: 'actions', label: 'Thao tác', minWidth: 150, align: 'center' as const },
];

const formColumns = [
  { id: 'name', label: 'Họ tên *', type: 'text', required: true },
  { id: 'position', label: 'Chức vụ', type: 'text' },
  { id: 'bio', label: 'Tiểu sử', type: 'textarea', rows: 4 },
];

export default function TargetsPage() {
  const user = useAppSelector((state) => state.auth.info);
  const isAdmin = user?.role === 'admin';

  const [targets, setTargets] = useState<Target[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const [modalOpen, setModalOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [selectedTarget, setSelectedTarget] = useState<Target | null>(null);
  const [pending, setPending] = useState(false);

  const fetchTargets = useCallback(async () => {
    const token = StoreService.getAuthToken() ?? '';
    const data = await TargetService.fetchTargets(token);
    setTargets(data);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchTargets();
  }, [fetchTargets]);

  const filtered = targets.filter((t) => {
    const q = search.trim().toLowerCase();
    if (!q) return true;
    return t.name.toLowerCase().includes(q) || t.position.toLowerCase().includes(q);
  });

  const tableColumns = isAdmin ? columns : columns.filter((c) => c.id !== 'actions');

  const rowsRender = isAdmin
    ? addActionToRows(
        filtered,
        [
          {
            label: 'Sửa',
            icon: <FaEdit />,
            color: '#0A8DEE',
            onClick: (row: Target) => { setSelectedTarget(row); setModalOpen(true); },
          },
          {
            label: 'Xoá',
            icon: <FaTrash style={{ fontSize: '14px' }} />,
            color: '#ff6666',
            onClick: (row: Target) => { setSelectedTarget(row); setDeleteConfirmOpen(true); },
          },
        ],
        'center'
      )
    : filtered;

  const handleSubmit = async (values: Record<string, any>) => {
    const { name, position, bio } = values;
    if (!name?.trim()) { alert('Vui lòng nhập họ tên'); return; }
    const token = StoreService.getAuthToken() ?? '';
    setPending(true);
    try {
      const input: TargetInput = { name, position: position || '', bio: bio || '' };
      if (selectedTarget) {
        await TargetService.updateTarget(selectedTarget.id, input, token);
      } else {
        await TargetService.createTarget(input, token);
      }
      setModalOpen(false);
      fetchTargets();
    } catch (e: any) {
      alert(e.message || 'Đã xảy ra lỗi khi lưu');
    } finally {
      setPending(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedTarget) return;
    const token = StoreService.getAuthToken() ?? '';
    setPending(true);
    try {
      await TargetService.deleteTarget(selectedTarget.id, token);
      setDeleteConfirmOpen(false);
      fetchTargets();
    } catch (e: any) {
      alert(e.message || 'Đã xảy ra lỗi khi xóa');
    } finally {
      setPending(false);
    }
  };

  return (
    <Box sx={{ p: 4, width: '100%' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 700, color: '#1a1a1a', fontFamily: 'Be Vietnam Pro' }}>
            Mục tiêu bảo vệ
          </Typography>
          <Typography variant="body2" sx={{ color: '#666', mt: 0.5, fontFamily: 'Be Vietnam Pro' }}>
            Tổng số: {targets.length} mục tiêu
          </Typography>
        </Box>
        {isAdmin && (
          <Button
            variant="contained"
            startIcon={<IoAddCircle size={18} />}
            onClick={() => { setSelectedTarget(null); setModalOpen(true); }}
            sx={{
              backgroundColor: '#1976d2',
              textTransform: 'none',
              borderRadius: '8px',
              fontFamily: 'Be Vietnam Pro',
              fontWeight: 600,
            }}
          >
            Thêm mục tiêu
          </Button>
        )}
      </Box>

      <Box sx={{ display: 'flex', mb: 2, gap: 2 }}>
        <TSearchText placeholder="Tìm theo tên hoặc chức vụ..." onSearch={setSearch} sx={{ width: '320px' }} />
      </Box>

      <Box sx={{ backgroundColor: '#fff', borderRadius: '12px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
        <TTable columns={tableColumns} rows={rowsRender} loading={loading || pending} showIndex />
      </Box>

      <TFormModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        columns={formColumns}
        initialValues={selectedTarget ? { name: selectedTarget.name, position: selectedTarget.position || '', bio: selectedTarget.bio || '' } : {}}
        onSubmit={handleSubmit}
        customTitle={selectedTarget ? 'Cập nhật thông tin mục tiêu' : 'Thêm mục tiêu bảo vệ mới'}
        loading={pending}
      />

      <TShowConfirm
        visible={deleteConfirmOpen}
        title="Xác nhận xóa mục tiêu"
        message={`Bạn có chắc chắn muốn xóa mục tiêu "${selectedTarget?.name}"?`}
        onConfirm={handleDelete}
        onCancel={() => setDeleteConfirmOpen(false)}
        onClose={() => setDeleteConfirmOpen(false)}
      />
    </Box>
  );
}
