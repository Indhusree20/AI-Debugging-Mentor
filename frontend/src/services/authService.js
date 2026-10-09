import api from './api';

export const authService = {
  async register(data) {
    const res = await api.post('/auth/register', data);
    if (res.data.token) {
      localStorage.setItem('mentor_token', res.data.token);
      localStorage.setItem('mentor_user', JSON.stringify(res.data.user));
    }
    return res.data;
  },

  async login(credentials) {
    const res = await api.post('/auth/login', credentials);
    if (res.data.token) {
      localStorage.setItem('mentor_token', res.data.token);
      localStorage.setItem('mentor_user', JSON.stringify(res.data.user));
    }
    return res.data;
  },

  logout() {
    localStorage.removeItem('mentor_token');
    localStorage.removeItem('mentor_user');
  },

  getCurrentUser() {
    const userStr = localStorage.getItem('mentor_user');
    return userStr ? JSON.parse(userStr) : null;
  },

  async getProfile() {
    const res = await api.get('/auth/profile');
    return res.data.user;
  },

  async updateProfile(data) {
    const res = await api.post ? await api.put('/auth/profile', data) : await api.put('/auth/profile', data);
    if (res.data.user) {
      localStorage.setItem('mentor_user', JSON.stringify(res.data.user));
    }
    return res.data.user;
  },
};
