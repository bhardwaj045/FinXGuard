import { backendRequest } from './apiClient';
import { normalizeTransaction } from './transactionApi';

export const analyticsApi = {
  getSummary: () =>
    backendRequest('/analytics/summary'),

  getByStatus: () =>
    backendRequest('/analytics/by-status'),

  getByDecision: () =>
    backendRequest('/analytics/by-decision'),

  getByHour: () =>
    backendRequest('/analytics/by-hour'),

  getSuspicious: async () => {
    const data = await backendRequest('/analytics/suspicious');
    return (Array.isArray(data) ? data : []).map(normalizeTransaction);
  }
};
