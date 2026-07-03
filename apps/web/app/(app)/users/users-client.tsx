'use client';

import { useState, useMemo, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Box, Button, Typography } from '@mui/material';
import { FaEdit, FaLock, FaTrash } from 'react-icons/fa';
import { IoAddCircle } from 'react-icons/io5';

import { TTable } from '@/components/tTable';
import TSearchText from '@/components/tSearchText';
import { TFormModal } from '@/components/tFormModal';
import { TShowConfirm } from '@/components/tShowConfirm';
import { ButtonExcel } from '@/components/ButtonExcel';

import { formatTimestamp } from '@/lib/format';
import { addActionToRows } from '@/lib/utils/table-helper';
import {
  User,
  createUser,
  updateUser,
  deleteUser,
} from '@/lib/users';

const columns = [
  { id: "email", label: "Email", minWidth: 200 },
  { id: "role", label: "Vai trò", minWidth: 120 },
  { id: "createdAt_display", label: "Ngày tạo", minWidth: 150 },
  { id: "updatedAt_display", label: "Cập nhật lần cuối", minWidth: 150 },
  { id: "actions", label: "Thao tác", minWidth: 250, align: "center" as const }
];

const createFormColumns = [
  { id: "email", label: "Email", type: "text", required: true },
  { id: "password", label: "Mật khẩu", type: "password", required: true },
  {
    id: "role",
    label: "Vai trò",
    type: "select",
    required: true,
    options: [
      { value: "viewer", label: "Viewer (Xem báo cáo/Gán nhãn tin)" },
      { value: "admin", label: "Admin (Toàn quyền hệ thống)" }
    ]
  }
];

const editRoleFormColumns = [
  { id: "email", label: "Tài khoản", type: "label" },
  {
    id: "role",
    label: "Vai trò",
    type: "select",
    required: true,
    options: [
      { value: "viewer", label: "Viewer (Xem báo cáo/Gán nhãn tin)" },
      { value: "admin", label: "Admin (Toàn quyền hệ thống)" }
    ]
  }
];

const resetPwdFormColumns = [
  { id: "email", label: "Tài khoản cần reset", type: "label" },
  { id: "password", label: "Mật khẩu mới", type: "password", required: true }
];

export function UsersClient({
  initialUsers,
  currentUserId,
  token,
}: {
  initialUsers: User[];
  currentUserId: string | number;
  token: string;
}) {
  const router = useRouter();
  const [users, setUsers] = useState<User[]>(initialUsers);
  const [search, setSearch] = useState('');
  const [pending, startTransition] = useTransition();

  // Modals state
  const [createOpen, setCreateOpen] = useState(false);
  const [editRoleOpen, setEditRoleOpen] = useState(false);
  const [resetPwdOpen, setResetPwdOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return users;
    return users.filter((u) => u.email.toLowerCase().includes(q));
  }, [users, search]);

  const rowsRender = useMemo(() => {
    const formatted = filtered.map(u => ({
      ...u,
      createdAt_display: formatTimestamp(u.createdAt),
      updatedAt_display: formatTimestamp(u.updatedAt),
    }));

    return addActionToRows(
      formatted,
      [
        {
          label: "Sửa vai trò",
          icon: <FaEdit />,
          color: "#0A8DEE",
          onClick: (row: User) => {
            setSelectedUser(row);
            setEditRoleOpen(true);
          },
          disabled: (row: User) => row.id.toString() === currentUserId.toString()
        },
        {
          label: "Reset mật khẩu",
          icon: <FaLock style={{ fontSize: "14px" }} />,
          color: "#FF9800",
          onClick: (row: User) => {
            setSelectedUser(row);
            setResetPwdOpen(true);
          }
        },
        {
          label: "Xoá",
          icon: <FaTrash style={{ fontSize: "14px" }} />,
          color: "#ff6666",
          onClick: (row: User) => {
            setSelectedUser(row);
            setDeleteConfirmOpen(true);
          },
          disabled: (row: User) => row.id.toString() === currentUserId.toString()
        }
      ],
      "center"
    );
  }, [filtered, currentUserId]);

  const handleCreate = (values: Record<string, any>) => {
    const { email, password, role } = values;
    if (!email?.trim() || !password?.trim()) {
      alert('Vui lòng nhập đầy đủ email và mật khẩu');
      return;
    }
    if (password.length < 8) {
      alert('Mật khẩu phải từ 8 ký tự trở lên');
      return;
    }

    startTransition(async () => {
      try {
        const newUser = await createUser({ email, password, role }, token);
        setUsers([...users, newUser]);
        setCreateOpen(false);
        router.refresh();
      } catch (err: any) {
        alert(err.message ?? 'Đã xảy ra lỗi khi tạo tài khoản');
      }
    });
  };

  const handleEditRole = (values: Record<string, any>) => {
    if (!selectedUser) return;
    const { role } = values;

    startTransition(async () => {
      try {
        const updated = await updateUser(selectedUser.id, { role }, token);
        setUsers(users.map(u => u.id === updated.id ? updated : u));
        setEditRoleOpen(false);
        router.refresh();
      } catch (err: any) {
        alert(err.message ?? 'Đã xảy ra lỗi khi cập nhật vai trò');
      }
    });
  };

  const handleResetPwd = (values: Record<string, any>) => {
    if (!selectedUser) return;
    const { password } = values;
    if (password.length < 8) {
      alert('Mật khẩu phải từ 8 ký tự trở lên');
      return;
    }

    startTransition(async () => {
      try {
        await updateUser(selectedUser.id, { password }, token);
        setResetPwdOpen(false);
        alert(`Đã đặt lại mật khẩu cho tài khoản ${selectedUser.email} thành công!`);
        router.refresh();
      } catch (err: any) {
        alert(err.message ?? 'Đã xảy ra lỗi khi reset mật khẩu');
      }
    });
  };

  const handleDelete = () => {
    if (!selectedUser) return;
    if (selectedUser.id.toString() === currentUserId.toString()) {
      alert('Bạn không thể tự xóa tài khoản của chính mình!');
      return;
    }

    startTransition(async () => {
      try {
        await deleteUser(selectedUser.id, token);
        setUsers(users.filter(u => u.id !== selectedUser.id));
        setDeleteConfirmOpen(false);
        router.refresh();
      } catch (err: any) {
        alert(err.message ?? 'Đã xảy ra lỗi khi xóa tài khoản');
      }
    });
  };

  const exportToExcel = async () => {
    try {
      const XLSX = await import('xlsx');
      const excelData = users.map((u, index) => ({
        'STT': index + 1,
        'Email': u.email,
        'Vai trò': u.role,
        'Ngày tạo': formatTimestamp(u.createdAt),
        'Cập nhật lần cuối': formatTimestamp(u.updatedAt),
      }));

      const workbook = XLSX.utils.book_new();
      const worksheet = XLSX.utils.json_to_sheet(excelData);
      worksheet['!cols'] = [
        { wch: 5 },
        { wch: 30 },
        { wch: 15 },
        { wch: 25 },
        { wch: 25 }
      ];
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Danh sách người dùng');
      XLSX.writeFile(workbook, `danh-sach-nguoi-dung-${new Date().getTime()}.xlsx`);
    } catch (err) {
      console.error('Lỗi khi xuất Excel:', err);
    }
  };

  return (
    <Box sx={{ p: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#1a1a1a' }}>
            Quản lý tài khoản
          </Typography>
          <Typography variant="body2" sx={{ color: '#666', mt: 0.5 }}>
            {users.length} tài khoản trong hệ thống
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="contained"
            startIcon={<IoAddCircle />}
            sx={{
              backgroundColor: '#098DEE',
              textTransform: 'none',
              fontWeight: 500,
              '&:hover': { backgroundColor: '#0776c9' }
            }}
            onClick={() => setCreateOpen(true)}
          >
            Thêm tài khoản
          </Button>
          <ButtonExcel onClick={exportToExcel} />
        </Box>
      </Box>

      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'flex-end' }}>
        <TSearchText onSearch={setSearch} />
      </Box>

      <Box sx={{ bgcolor: 'white', borderRadius: 2, overflow: 'hidden', border: '1px solid #e0e0e0' }}>
        <TTable
          rows={rowsRender}
          columns={columns}
          showIndex={true}
          total={filtered.length}
          pageSize={filtered.length}
          pageIndex={1}
          hidePagination={true}
        />
      </Box>

      {/* CREATE MODAL */}
      <TFormModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        columns={createFormColumns}
        onSubmit={handleCreate}
        customTitle="Thêm tài khoản mới"
      />

      {/* EDIT ROLE MODAL */}
      {selectedUser && (
        <TFormModal
          open={editRoleOpen}
          onClose={() => setEditRoleOpen(false)}
          columns={editRoleFormColumns}
          initialValues={{
            email: selectedUser.email,
            role: selectedUser.role
          }}
          onSubmit={handleEditRole}
          customTitle="Thay đổi vai trò"
        />
      )}

      {/* RESET PASSWORD MODAL */}
      {selectedUser && (
        <TFormModal
          open={resetPwdOpen}
          onClose={() => setResetPwdOpen(false)}
          columns={resetPwdFormColumns}
          initialValues={{
            email: selectedUser.email,
            password: ''
          }}
          onSubmit={handleResetPwd}
          customTitle="Đặt lại mật khẩu"
        />
      )}

      {/* DELETE CONFIRM DIALOG */}
      <TShowConfirm
        visible={deleteConfirmOpen}
        title="Xác nhận xóa"
        message={`Bạn có chắc chắn muốn xóa tài khoản "${selectedUser?.email}"?`}
        onConfirm={handleDelete}
        onClose={() => setDeleteConfirmOpen(false)}
        onCancel={() => setDeleteConfirmOpen(false)}
      />
    </Box>
  );
}
