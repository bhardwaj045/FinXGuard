import { backendRequest } from './apiClient';
import { normalizeTransaction } from './transactionApi';

export const adminApi = {
  getDashboard: () =>
    backendRequest('/admin/dashboard'),

  getDetectionCases: async () => {
    const data = await backendRequest('/admin/detection');
    return (Array.isArray(data) ? data : []).map(normalizeTransaction);
  },

  getAlgorithmMetadata: () =>
    backendRequest('/admin/algorithm'),

  getSystemConfig: () =>
    backendRequest('/admin/configuration')
};
