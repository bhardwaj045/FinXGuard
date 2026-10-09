import { backendRequest, producerRequest } from './apiClient';

export function normalizeTransaction(tx) {
  if (!tx) return null;

  const rawDecision = tx.decision && String(tx.decision).trim() ? String(tx.decision).trim().toUpperCase() : null;
  const rawStatus = tx.status ? String(tx.status).trim().toUpperCase() : 'PENDING';

  const riskScoreVal = (tx.riskScore === null || tx.riskScore === undefined)
    ? (tx.ruleScore === null || tx.ruleScore === undefined ? null : Number(tx.ruleScore))
    : Number(tx.riskScore);

  const fraudProbVal = (tx.fraudProbability === null || tx.fraudProbability === undefined)
    ? null
    : Number(tx.fraudProbability);

  let reasons = [];
  if (Array.isArray(tx.decisionReasons)) {
    reasons = tx.decisionReasons;
  } else if (typeof tx.decisionReasons === 'string' && tx.decisionReasons.trim()) {
    try {
      const parsed = JSON.parse(tx.decisionReasons);
      if (Array.isArray(parsed)) {
        reasons = parsed;
      } else {
        reasons = [tx.decisionReasons];
      }
    } catch (e) {
      reasons = tx.decisionReasons
        .split('\n')
        .map((r) => r.replace(/^[•\-\s]+/, '').trim())
        .filter(Boolean);
    }
  }

  return {
    ...tx,
    id: tx.id || tx.transactionId,
    transactionId: tx.transactionId,
    userId: tx.userId || null,
    amount: Number(tx.amount || 0),
    currency: tx.currency || 'INR',
    merchant: tx.merchantId || tx.merchant || 'N/A',
    merchantCategory: tx.merchantCategory || 'General',
    country: tx.country || 'IN',
    city: tx.city || 'N/A',
    device: tx.deviceId || tx.device || 'N/A',
    channel: (tx.channel || 'ONLINE').toUpperCase(),
    createdAt: tx.createdAt || tx.transactionTime || tx.processedAt || null,
    ruleScore: tx.ruleScore ?? null,
    fraudProbability: fraudProbVal,
    riskScore: riskScoreVal,
    decision: rawDecision,
    status: rawStatus,
    decisionReasons: reasons
  };
}

export const transactionApi = {
  submitTransaction: async (txPayload) => {
    const payload = {
      amount: Number(txPayload.amount),
      currency: txPayload.currency || 'INR',
      merchantId: txPayload.merchant,
      merchantCategory: txPayload.merchantCategory,
      country: txPayload.country,
      city: txPayload.city,
      deviceId: txPayload.device,
      channel: txPayload.channel
    };

    const accepted = await producerRequest('/transactions', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
    const transactionId = accepted?.transactionId;
    if (!transactionId) {
      throw new Error('Producer accepted the request without returning a transaction ID.');
    }

    for (let attempt = 0; attempt < 30; attempt += 1) {
      try {
        const result = await backendRequest(`/transactions/my/${encodeURIComponent(transactionId)}`);
        const transaction = normalizeTransaction(result);
        if (transaction?.decision && ['APPROVED', 'REVIEW', 'BLOCKED'].includes(transaction.decision)) {
          return transaction;
        }
      } catch (error) {
        if (error.status !== 404) throw error;
      }
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
    throw new Error(`Transaction ${transactionId} is still processing. Check My Transactions for its result.`);
  },

  getMyTransactions: async () => {
    const data = await backendRequest('/transactions/my');
    return (Array.isArray(data) ? data : []).map(normalizeTransaction);
  },

  getMyTransactionById: async (transactionId) => {
    const data = await backendRequest(`/transactions/my/${encodeURIComponent(transactionId)}`);
    return normalizeTransaction(data);
  },

  getTransactionById: async (transactionId) => {
    const data = await backendRequest(`/transactions/${encodeURIComponent(transactionId)}`);
    return normalizeTransaction(data);
  },

  getMyAlerts: async () => {
    const transactions = await backendRequest('/alerts/my');
    return (Array.isArray(transactions) ? transactions : [])
      .map(normalizeTransaction)
      .map((transaction) => ({
        id: transaction.transactionId,
        transactionId: transaction.transactionId,
        alertType: transaction.decision === 'BLOCKED' ? 'TRANSACTION_BLOCKED' : 'TRANSACTION_UNDER_REVIEW',
        shortExplanation: transaction.decisionReasons.length > 0
          ? transaction.decisionReasons.join(' • ')
          : 'Suspicious activity detected.',
        createdAt: transaction.createdAt,
        decision: transaction.decision,
        riskScore: transaction.riskScore,
        reasons: transaction.decisionReasons,
        amount: transaction.amount,
        currency: transaction.currency
      }));
  }
};
