import createApiServices from './make-api-request';

const api = createApiServices();

export type Target = {
  id: string;
  name: string;
  position: string;
  bio: string;
  createdAt: string;
  updatedAt: string;
};

export type TargetInput = { name: string; position: string; bio: string };

export const TargetService = {
  fetchTargets: async (token: string): Promise<Target[]> => {
    if (!token) return [];
    try {
      return await api.makeAuthRequest({
        url: '/targets',
        method: 'GET',
        token,
      });
    } catch {
      return [];
    }
  },

  fetchTarget: async (id: string, token: string): Promise<Target | null> => {
    if (!token) return null;
    try {
      return await api.makeAuthRequest({
        url: `/targets/${id}`,
        method: 'GET',
        token,
      });
    } catch {
      return null;
    }
  },

  createTarget: async (input: TargetInput, token: string): Promise<Target> => {
    return api.makeAuthRequest({
      url: '/targets',
      method: 'POST',
      data: input,
      token,
    });
  },

  updateTarget: async (id: string, input: Partial<TargetInput>, token: string): Promise<Target> => {
    return api.makeAuthRequest({
      url: `/targets/${id}`,
      method: 'PATCH',
      data: input,
      token,
    });
  },

  deleteTarget: async (id: string, token: string): Promise<void> => {
    return api.makeAuthRequest({
      url: `/targets/${id}`,
      method: 'DELETE',
      token,
    });
  },
};
