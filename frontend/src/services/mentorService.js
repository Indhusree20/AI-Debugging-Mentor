import api from './api';

export const mentorService = {
  async chat({ sessionId, language, sourceCode, userMessage, chatHistory }) {
    const res = await api.post('/mentor/chat', {
      sessionId,
      language,
      sourceCode,
      userMessage,
      chatHistory,
    });
    return res.data.message;
  },

  async getHint({ sessionId, tier }) {
    const res = await api.post('/mentor/hint', { sessionId, tier });
    return res.data.hint;
  },
};
