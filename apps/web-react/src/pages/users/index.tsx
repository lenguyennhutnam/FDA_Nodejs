import { useState, useEffect, useCallback } from 'react';
import { Navigate } from 'react-router-dom';
import { Box, Button, Typography } from '@mui/material';
import { FaEdit, FaLock, FaTrash } from 'react-icons/fa';
import { IoAddCircle } from 'react-icons/io5';
import { useAppSelector } from '@/hooks';
import { StoreService } from '@/utils/store';
import { TTable } from '@/components/tTable';
import TSearchText from '@/components/tSearchText';
import { TFormModal } from '@/components/tFormModal';
import { TShowConfirm } from '@/components/tShowConfirm';
import { ButtonExcel } from '@/components/ButtonExcel';
import { formatTimestamp } from '@/lib/format';
import { addActionToRows } from '@/lib/utils/table-helper';
import { UserService, type User } from '@/lib/apis/users';
import { RouterLink } from '@/routers/routers';

const columns = [
  { id: 'email', label: 'Email', minWidth: 200 },
  { id: 'role', label: 'Vai trò', minWidth: 120 },
  { id: 'createdAt_display', label: 'Ngày tạo', minWidth: 150 },
  { id: 'updatedAt_display', label: 'Cập nhật lần cuối', minWidth: 150 },
  { id: 'actions', label: 'Thao tác', minWidth: 250, align: 'center' as const },
];

const createFormColumns = [
  { id: 'email', label: 'Email', type: 'text', required: true },
  { id: 'password', label: 'Mật khẩu', type: 'password', required: true },
  {
    id: 'role', label: 'Vai trò', type: 'select', required: true,
    options: [
      { value: 'viewer', label: 'Viewer (Xem báo cáo/Gán nhãn tin)' },
      { value: 'admin', label: 'Admin (Toàn quyền hệ thống)' },
    ],
  },
];

const editRoleFormColumns = [
  { id: 'email', label: 'Tài khoản', type: 'label' },
  {
    id: 'role', label: 'Vai trò', type: 'select', required: true,
    options: [
      { value: 'viewer', label: 'Viewer' },
      { value: 'admin', label: 'Admin' },
    ],
  },
];

const resetPwdFormColumns = [
  { id: 'email', label: 'Tài khoản cần reset', type: 'label' },
  { id: 'password', label: 'Mật khẩu mới', type: 'password', required: true },
];

export default function UsersPage() {
  const user = useAppSelector((state) => state.auth.info);

  // Chỉ admin mới được vào trang này
  if (user && user.role !== 'admin') {
    return <Navigate to={RouterLink.DASHBOARD} replace />;
  }

  const currentUserId = user?.id ?? '';

  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [pending, setPending] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [editRoleOpen, setEditRoleOpen] = useState(false);
  const [resetPwdOpen, setResetPwdOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  const fetchUsers = useCallback(async () => {
    const token = StoreService.getAuthToken() ?? '';
    const data = await UserService.fetchUsers(token);
    setUsers(data);
    setLoading(false);
  }, []);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const filtered = users.filter((u) => {
    const q = search.trim().toLowerCase();
    return !q || u.email.toLowerCase().includes(q);
  });

  const rowsRender = addActionToRows(
    filtered.map((u) => ({
      ...u,
      createdAt_display: formatTimestamp(u.createdAt),
      updatedAt_display: formatTimestamp(u.updatedAt),
    })),
    [
      {
        label: 'Sửa vai trò', icon: <FaEdit />, color: '#0A8DEE',
        onClick: (row: User) => { setSelectedUser(row); setEditRoleOpen(true); },
        disabled: (row: User) => row.id.toString() === currentUserId.toString(),
      },
      {
        label: 'Reset mật khẩu', icon: <FaLock style={{ fontSize: '14px' }} />, color: '#FF9800',
        onClick: (row: User) => { setSelectedUser(row); setResetPwdOpen(true); },
      },
      {
        label: 'Xoá', icon: <FaTrash style={{ fontSize: '14px' }} />, color: '#ff6666',
        onClick: (row: User) => { setSelectedUser(row); setDeleteConfirmOpen(true); },
        disabled: (row: User) => row.id.toString() === currentUserId.toString(),
      },
    ],
    'center'
  );

  const token = () => StoreService.getAuthToken() ?? '';

  const handleCreate = async (values: Record<string, any>) => {
    const { email, password, role } = values;
    if (!email?.trim() || !password?.trim()) { alert('Vui lòng nhập đầy đủ email và mật khẩu'); return; }
    if (password.length < 8) { alert('Mật khẩu phải từ 8 ký tự trở lên'); return; }
    setPending(true);
    try {
      const newUser = await UserService.createUser({ email, password, role }, token());
      setUsers([...users, newUser]);
      setCreateOpen(false);
    } catch (e: any) { alert(e.message ?? 'Lỗi khi tạo tài khoản'); }
    finally { setPending(false); }
  };

  const handleEditRole = async (values: Record<string, any>) => {
    if (!selectedUser) return;
    setPending(true);
    try {
      const updated = await UserService.updateUser(selectedUser.id, { role: values.role }, token());
      setUsers(users.map((u) => u.id === updated.id ? updated : u));
      setEditRoleOpen(false);
    } catch (e: any) { alert(e.message ?? 'Lỗi khi cập nhật vai trò'); }
    finally { setPending(false); }
  };

  const handleResetPwd = async (values: Record<string, any>) => {
    if (!selectedUser) return;
    if (values.password.length < 8) { alert('Mật khẩu phải từ 8 ký tự'); return; }
    setPending(true);
    try {
      await UserService.updateUser(selectedUser.id, { password: values.password }, token());
      setResetPwdOpen(false);
      alert(`Đã đặt lại mật khẩu cho ${selectedUser.email}`);
    } catch (e: any) { alert(e.message ?? 'Lỗi khi reset mật khẩu'); }
    finally { setPending(false); }
  };

  const handleDelete = async () => {
    if (!selectedUser) return;
    if (selectedUser.id.toString() === currentUserId.toString()) {
      alert('Bạn không thể tự xóa tài khoản của chính mình!'); return;
    }
    setPending(true);
    try {
      await UserService.deleteUser(selectedUser.id, token());
      setUsers(users.filter((u) => u.id !== selectedUser.id));
      setDeleteConfirmOpen(false);
    } catch (e: any) { alert(e.message ?? 'Lỗi khi xóa tài khoản'); }
    finally { setPending(false); }
  };

  const exportToExcel = async () => {
    try {
      const XLSX = await import('xlsx');
      const data = users.map((u, i) => ({
        'STT': i + 1, 'Email': u.email, 'Vai trò': u.role,
        'Ngày tạo': formatTimestamp(u.createdAt),
        'Cập nhật lần cuối': formatTimestamp(u.updatedAt),
      }));
      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.json_to_sheet(data);
      XLSX.utils.book_append_sheet(wb, ws, 'Danh sách người dùng');
      XLSX.writeFile(wb, `danh-sach-nguoi-dung-${Date.now()}.xlsx`);
    } catch { console.error('Lỗi xuất Excel'); }
  };

  return (
    <Box sx={{ p: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#1a1a1a' }}>Quản lý tài khoản</Typography>
          <Typography variant="body2" sx={{ color: '#666', mt: 0.5 }}>{users.length} tài khoản</Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button variant="contained" startIcon={<IoAddCircle />}
            sx={{ backgroundColor: '#098DEE', textTransform: 'none', '&:hover': { backgroundColor: '#0776c9' } }}
            onClick={() => setCreateOpen(true)}>
            Thêm tài khoản
          </Button>
          <ButtonExcel onClick={exportToExcel} />
        </Box>
      </Box>

      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'flex-end' }}>
        <TSearchText onSearch={setSearch} />
      </Box>

      <Box sx={{ bgcolor: 'white', borderRadius: 2, overflow: 'hidden', border: '1px solid #e0e0e0' }}>
        <TTable rows={rowsRender} columns={columns} showIndex total={filtered.length}
          pageSize={filtered.length} pageIndex={1} hidePagination loading={loading || pending} />
      </Box>

      <TFormModal open={createOpen} onClose={() => setCreateOpen(false)} columns={createFormColumns}
        onSubmit={handleCreate} customTitle="Thêm tài khoản mới" />

      {selectedUser && (
        <TFormModal open={editRoleOpen} onClose={() => setEditRoleOpen(false)}
          columns={editRoleFormColumns}
          initialValues={{ email: selectedUser.email, role: selectedUser.role }}
          onSubmit={handleEditRole} customTitle="Thay đổi vai trò" />
      )}

      {selectedUser && (
        <TFormModal open={resetPwdOpen} onClose={() => setResetPwdOpen(false)}
          columns={resetPwdFormColumns}
          initialValues={{ email: selectedUser.email, password: '' }}
          onSubmit={handleResetPwd} customTitle="Đặt lại mật khẩu" />
      )}

      <TShowConfirm visible={deleteConfirmOpen} title="Xác nhận xóa"
        message={`Bạn có chắc chắn muốn xóa tài khoản "${selectedUser?.email}"?`}
        onConfirm={handleDelete} onClose={() => setDeleteConfirmOpen(false)}
        onCancel={() => setDeleteConfirmOpen(false)} />
    </Box>
  );
}
