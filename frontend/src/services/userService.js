import usersApi from './api';

export const authService = {
  register: async (userData) => {
    const response = await usersApi.post('/auth/register', userData);
    return response.data;
  },

  login: async (email, password) => {
    const response = await usersApi.post('/auth/login', { email, password });
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('userId', response.data.userId);
    }
    return response.data;
  },

  verifyIdentity: async (formData) => {
    const response = await usersApi.post('/user/verify-identity', formData, {
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
    const response = await usersApi.get(`/user/profile/${userId}`);
    return response.data;
  },

  updateReputation: async (userId, score) => {
    const response = await usersApi.patch('/user/reputation', { userId, score });
    return response.data;
  },
};
