/**
 * FinXGuard Central API Layer
 */

import {
  adminApi,
  transactionApi,
  normalizeTransaction
} from '../api';

export * from '../api';

export { normalizeTransaction };

export async function fetchAnalyticsSummary() {
  return adminApi.getDashboard();
}

export async function fetchTransactions(userIdentifier = null) {
  if (userIdentifier) {
    return transactionApi.getMyTransactions();
  }
  return adminApi.getDetectionCases();
}

export async function submitTransaction(txPayload) {
  return transactionApi.submitTransaction(txPayload);
}

export async function fetchSystemConfig() {
  return adminApi.getSystemConfig();
}

export async function fetchUserAlerts() {
  return transactionApi.getMyAlerts();
}

export async function fetchAlgorithmMetadata() {
  return adminApi.getAlgorithmMetadata();
}
