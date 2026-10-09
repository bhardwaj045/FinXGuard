import React, { useState } from 'react';
import { Loader2 } from 'lucide-react';

export default function StreamControl({ onTriggerRefresh, onAddLocalTransaction }) {
  const [loadingAction, setLoadingAction] = useState(null);

  const PRODUCER_URL = 'http://localhost:8081/api/producer';

  const sendSingleTransaction = async (isSuspicious = false) => {
    setLoadingAction(isSuspicious ? 'suspicious' : 'normal');

    const now = new Date();
    const txNum = Math.floor(1000 + Math.random() * 9000);
    const txId = `TXN${txNum}`;
    const userNum = Math.floor(1 + Math.random() * 9);
    const userId = `USER00${userNum}`;

    const payload = isSuspicious
      ? {
          transactionId: txId,
          userId: userId,
          cardId: 'CARD_SUSPICIOUS',
          amount: 15000.0,
          currency: 'INR',
          merchantId: 'Electronics',
          merchantCategory: 'Electronics',
          country: 'IN',
          city: 'Mumbai',
          deviceId: 'DEV102',
          ipAddress: '185.220.101.5',
          channel: 'WEB',
          transactionTime: now.toISOString(),
          features: Array.from({ length: 29 }, (_, i) => (i === 28 ? 15000.0 : Math.random() * 4 - 2))
        }
      : {
          transactionId: txId,
          userId: userId,
          cardId: 'CARD_NORMAL',
          amount: 2500.0,
          currency: 'INR',
          merchantId: 'Retail',
          merchantCategory: 'Retail',
          country: 'IN',
          city: 'Delhi',
          deviceId: 'DEV001',
          ipAddress: '103.21.124.1',
          channel: 'MOBILE',
          transactionTime: now.toISOString(),
          features: Array.from({ length: 29 }, (_, i) => (i === 28 ? 2500.0 : Math.random() * 0.4 - 0.2))
        };

    try {
      const res = await fetch(`${PRODUCER_URL}/transactions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        setTimeout(() => onTriggerRefresh && onTriggerRefresh(), 600);
      }
    } catch (err) {
      console.error('Failed to send transaction to producer:', err);
    } finally {
      setLoadingAction(null);
    }
  };

  const streamCsvBatch = async (maxRecords = 10) => {
    setLoadingAction('csv');
    try {
      const res = await fetch(
        `${PRODUCER_URL}/stream-csv?path=data/creditcard.csv&delayMs=100&maxRecords=${maxRecords}`,
        { method: 'POST' }
      );
      if (res.ok) {
        setTimeout(() => onTriggerRefresh && onTriggerRefresh(), 800);
      }
    } catch (err) {
      console.error('Failed to stream CSV batch:', err);
    } finally {
      setLoadingAction(null);
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-semibold text-white">Transaction Simulator</h2>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => sendSingleTransaction(false)}
            disabled={loadingAction !== null}
            className="px-3.5 py-2 rounded-lg text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/20 transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            {loadingAction === 'normal' && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
            + Normal Transaction
          </button>

          <button
            onClick={() => sendSingleTransaction(true)}
            disabled={loadingAction !== null}
            className="px-3.5 py-2 rounded-lg text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/30 hover:bg-amber-500/20 transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            {loadingAction === 'suspicious' && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
            + Suspicious Transaction
          </button>

          <button
            onClick={() => streamCsvBatch(10)}
            disabled={loadingAction !== null}
            className="px-3.5 py-2 rounded-lg text-xs font-semibold bg-slate-800 text-white border border-slate-700 hover:bg-slate-700 transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            {loadingAction === 'csv' && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
            Stream CSV
          </button>
        </div>
      </div>
    </div>
  );
}
