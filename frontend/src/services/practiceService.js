import api from './api';

export const practiceService = {
  async getProblems(params = {}) {
    const response = await api.get('/practice/problems', { params });
    return response.data.problems || [];
  },

  async getProblemBySlug(slug) {
    const response = await api.get(`/practice/problems/${slug}`);
    return response.data.problem;
  },

  async runCode(slug, payload) {
    const response = await api.post(`/practice/problems/${slug}/run`, payload);
    return response.data;
  },

  async submitCode(slug, payload) {
    const response = await api.post(`/practice/problems/${slug}/submit`, payload);
    return response.data;
  },

  async getProgress() {
    const response = await api.get('/practice/progress');
    return response.data.progress;
  },

  async getSubmissions(slug) {
    const response = await api.get('/practice/submissions', { params: { slug } });
    return response.data.submissions || [];
  },
};
