import api from './api';

export const analyticsService = {
  async getDashboardAnalytics() {
    const res = await api.get('/analytics/dashboard');
    return res.data.data;
  },

  async getRecommendations() {
    const res = await api.get('/analytics/recommendations');
    return res.data.recommendations;
  },

  async completeRecommendation(id) {
    const res = await api.patch(`/analytics/recommendations/${id}/complete`);
    return res.data.recommendation;
  },

  async getAdminStatistics() {
    const res = await api.get('/admin/statistics');
    return res.data.data;
  },
};
