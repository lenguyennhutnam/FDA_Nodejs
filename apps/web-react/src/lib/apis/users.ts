import createApiServices from './make-api-request';

const api = createApiServices();

export type User = {
  id: string | number;
  email: string;
  role: 'admin' | 'viewer';
  createdAt: string;
  updatedAt: string;
};

export type CreateUserInput = {
  email: string;
  password?: string;
  role?: 'admin' | 'viewer';
};

export type UpdateUserInput = {
  password?: string;
  role?: 'admin' | 'viewer';
};

export type ChangePasswordInput = {
  currentPassword?: string;
  newPassword?: string;
};

export const UserService = {
  fetchUsers: async (token: string): Promise<User[]> => {
    if (!token) return [];
    try {
      const res = await api.makeAuthRequest({
        url: '/users',
        method: 'GET',
        token,
      });
      return res;
    } catch (err) {
      console.error('Lỗi khi fetch danh sách người dùng:', err);
      return [];
    }
  },

  createUser: async (input: CreateUserInput, token: string): Promise<User> => {
    return api.makeAuthRequest({
      url: '/users',
      method: 'POST',
      data: input,
      token,
    });
  },

  updateUser: async (id: string | number, input: UpdateUserInput, token: string): Promise<User> => {
    return api.makeAuthRequest({
      url: `/users/${id}`,
      method: 'PATCH',
      data: input,
      token,
    });
  },

  deleteUser: async (id: string | number, token: string): Promise<void> => {
    return api.makeAuthRequest({
      url: `/users/${id}`,
      method: 'DELETE',
      token,
    });
  },

  changePasswordApi: async (input: ChangePasswordInput, token: string): Promise<{ success: boolean; message: string }> => {
    return api.makeAuthRequest({
      url: '/users/change-password',
      method: 'POST',
      data: input,
      token,
    });
  },
};
