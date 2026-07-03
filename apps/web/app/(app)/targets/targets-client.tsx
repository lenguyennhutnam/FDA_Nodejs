'use client';

import { useState, useMemo, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Box, Button, Typography } from '@mui/material';
import { FaEdit, FaTrash } from 'react-icons/fa';
import { IoAddCircle } from 'react-icons/io5';

import { TTable } from '@/components/tTable';
import TSearchText from '@/components/tSearchText';
import { TFormModal } from '@/components/tFormModal';
import { TShowConfirm } from '@/components/tShowConfirm';

import { addActionToRows } from '@/lib/utils/table-helper';
import type { Target } from '@/lib/targets';
import { createTarget, updateTarget, deleteTarget } from './actions';

const columns = [
  { id: "name", label: "Họ tên", minWidth: 200 },
  { id: "position", label: "Chức vụ", minWidth: 180 },
  { id: "bio", label: "Tiểu sử", minWidth: 350 },
  { id: "actions", label: "Thao tác", minWidth: 150, align: "center" as const }
];

const formColumns = [
  { id: "name", label: "Họ tên *", type: "text", required: true },
  { id: "position", label: "Chức vụ", type: "text" },
  { id: "bio", label: "Tiểu sử", type: "textarea", rows: 4 }
];

export function TargetsClient({
  targets,
  isAdmin,
}: {
  targets: Target[];
  isAdmin: boolean;
}) {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [pending, startTransition] = useTransition();

  // Modals state
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);

  const [selectedTarget, setSelectedTarget] = useState<Target | null>(null);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return targets;
    return targets.filter(
      (t) =>
        t.name.toLowerCase().includes(q) || t.position.toLowerCase().includes(q),
    );
  }, [targets, search]);

  const tableColumns = useMemo(() => {
    if (!isAdmin) {
      return columns.filter(c => c.id !== "actions");
    }
    return columns;
  }, [isAdmin]);

  const rowsRender = useMemo(() => {
    if (!isAdmin) return filtered;
    return addActionToRows(
      filtered,
      [
        {
          label: "Sửa",
          icon: <FaEdit />,
          color: "#0A8DEE",
          onClick: (row: Target) => {
            setSelectedTarget(row);
            setModalOpen(true);
          }
        },
        {
          label: "Xoá",
          icon: <FaTrash style={{ fontSize: "14px" }} />,
          color: "#ff6666",
          onClick: (row: Target) => {
            setSelectedTarget(row);
            setDeleteConfirmOpen(true);
          }
        }
      ],
      "center"
    );
  }, [filtered, isAdmin]);

  const openAdd = () => {
    setSelectedTarget(null);
    setModalOpen(true);
  };

  const handleSubmit = (values: Record<string, any>) => {
    const { name, position, bio } = values;
    if (!name?.trim()) {
      alert('Vui lòng nhập họ tên');
      return;
    }

    startTransition(async () => {
      const formPayload = { name, position: position || '', bio: bio || '' };
      const res = selectedTarget
        ? await updateTarget(selectedTarget.id, formPayload)
        : await createTarget(formPayload);
      if (res.ok) {
        setModalOpen(false);
        router.refresh();
      } else {
        alert(res.error || 'Đã xảy ra lỗi khi lưu thông tin');
      }
    });
  };

  const handleDelete = () => {
    if (!selectedTarget) return;
    startTransition(async () => {
      const res = await deleteTarget(selectedTarget.id);
      if (!res.ok) {
        alert(res.error || 'Đã xảy ra lỗi khi xóa');
      } else {
        setDeleteConfirmOpen(false);
        router.refresh();
      }
    });
  };

  return (
    <Box sx={{ p: 4, width: '100%' }} suppressHydrationWarning>
      {/* Header section */}
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
            onClick={openAdd}
            sx={{
              backgroundColor: '#1976d2',
              textTransform: 'none',
              borderRadius: '8px',
              fontFamily: 'Be Vietnam Pro',
              fontWeight: 600,
              boxShadow: '0 2px 8px rgba(25, 118, 210, 0.25)',
              '&:hover': {
                backgroundColor: '#1565c0',
              }
            }}
          >
            Thêm mục tiêu
          </Button>
        )}
      </Box>

      {/* Filter toolbar */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, gap: 2 }}>
        <TSearchText
          placeholder="Tìm theo tên hoặc chức vụ..."
          onSearch={setSearch}
          sx={{ width: '320px' }}
        />
      </Box>

      {/* Main Grid table */}
      <Box sx={{ backgroundColor: '#fff', borderRadius: '12px', boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)', overflow: 'hidden' }}>
        <TTable
          columns={tableColumns}
          rows={rowsRender}
          loading={pending}
          showIndex
        />
      </Box>

      {/* Add / Edit Form Modal */}
      <TFormModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        columns={formColumns}
        initialValues={selectedTarget ? {
          name: selectedTarget.name,
          position: selectedTarget.position || '',
          bio: selectedTarget.bio || ''
        } : {}}
        onSubmit={handleSubmit}
        customTitle={selectedTarget ? 'Cập nhật thông tin mục tiêu' : 'Thêm mục tiêu bảo vệ mới'}
        loading={pending}
      />

      {/* Delete confirmation dialogue */}
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
