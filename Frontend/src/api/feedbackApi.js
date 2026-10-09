import { backendRequest } from './apiClient';

export const feedbackApi = {
  submitFeedback: (transactionId, actualFraud, feedbackSource = 'ANALYST') =>
    backendRequest('/feedback', {
      method: 'POST',
      body: JSON.stringify({ transactionId, actualFraud, feedbackSource })
    }),

  getAllFeedback: () =>
    backendRequest('/feedback'),

  getFeedbackByTransaction: (transactionId) =>
    backendRequest(`/feedback/${encodeURIComponent(transactionId)}`)
};
