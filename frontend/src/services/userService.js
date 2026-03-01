import api from './api';

export const authService = {
  register: async (userData) => {
    const response = await api.post('/auth/register', userData);
    return response.data;
  },

  login: async (email, password) => {
    const response = await api.post('/auth/login', { email, password });
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('userId', response.data.userId);
    }
    return response.data;
  },

  verifyIdentity: async (formData) => {
    const response = await api.post('/user/verify-identity', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
  },
};

export const userService = {
  getProfile: async (userId) => {
    const response = await api.get(`/user/profile/${userId}`);
    return response.data;
  },

  updateReputation: async (userId, score) => {
    const response = await api.patch('/user/reputation', { userId, score });
    return response.data;
  },
};
