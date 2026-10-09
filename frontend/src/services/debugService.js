import api from './api';

export const debugService = {
  async runCode({ language, sourceCode, stdin }) {
    const res = await api.post('/debug/run', { language, sourceCode, stdin });
    return res.data.result;
  },

  async analyzeCode({ language, sourceCode, title, mode, expectedOutput, testCases }) {
    const res = await api.post('/debug/analyze', {
      language,
      sourceCode,
      title,
      mode,
      expectedOutput,
      testCases,
    });
    return res.data;
  },

  async runTestCases({ language, sourceCode, testCases }) {
    const res = await api.post('/debug/test-cases', { language, sourceCode, testCases });
    return res.data.results;
  },

  async getHistory({ language, errorType, page = 1, limit = 10, search = '' }) {
    const params = new URLSearchParams();
    if (language) params.append('language', language);
    if (errorType) params.append('errorType', errorType);
    if (page) params.append('page', page);
    if (limit) params.append('limit', limit);
    if (search) params.append('search', search);

    const res = await api.get(`/debug/history?${params.toString()}`);
    return res.data;
  },

  async getSessionById(id) {
    const res = await api.get(`/debug/session/${id}`);
    return res.data.session;
  },

  async deleteSession(id) {
    const res = await api.delete(`/debug/session/${id}`);
    return res.data;
  },

  async updateSessionStatus(id, status) {
    const res = await api.patch(`/debug/session/${id}/status`, { status });
    return res.data.session;
  },
};
