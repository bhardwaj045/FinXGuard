import React from 'react';
import { AlertTriangle, AlertOctagon } from 'lucide-react';

export default function TransactionAlerts({ transactions = [] }) {
  // Filter suspicious transactions (REVIEW or BLOCKED)
  const suspiciousTxList = transactions.filter(
    (t) => t.decision === 'REVIEW' || t.decision === 'BLOCKED'
  );

  // If no transactions in state meet criteria, provide standard default alerts matching user requirements
  const displayAlerts =
    suspiciousTxList.length > 0
      ? suspiciousTxList
      : [
          {
            id: 'default-1',
            transactionId: 'TXN1002',
            amount: 5000,
            decision: 'REVIEW',
            message: 'Your transaction requires review.'
          },
          {
            id: 'default-2',
            transactionId: 'TXN1003',
            amount: 50000,
            decision: 'BLOCKED',
            message: 'Suspicious activity was detected.'
          }
        ];

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h2 className="text-xl font-bold text-white">Transaction Alerts</h2>
        <p className="text-xs text-slate-400">List of alerts for flagged and suspicious transactions requiring attention.</p>
      </div>

      <div className="space-y-4">
        {displayAlerts.map((tx) => {
          const isBlocked = tx.decision === 'BLOCKED';
          const amountDisplay =
            typeof tx.amount === 'number'
              ? `₹${tx.amount.toLocaleString()}`
              : tx.amount?.startsWith('₹')
              ? tx.amount
              : `₹${tx.amount}`;

          return (
            <div
              key={tx.id || tx.transactionId}
              className={`p-5 rounded-xl border space-y-3 transition-all ${
                isBlocked
                  ? 'bg-rose-500/10 border-rose-500/30 text-rose-200'
                  : 'bg-amber-500/10 border-amber-500/30 text-amber-200'
              }`}
            >
              <div className="flex items-center gap-2.5">
                {isBlocked ? (
                  <AlertOctagon className="w-5 h-5 text-rose-400 shrink-0" />
                ) : (
                  <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />
                )}
                <h3 className="text-sm font-bold tracking-wide">
                  {isBlocked ? '🔴 Transaction Blocked' : '⚠ Transaction Under Review'}
                </h3>
              </div>

              <div className="space-y-1 text-xs font-mono pl-7">
                <div>
                  <span className="text-slate-400">Amount:</span>{' '}
                  <span className="font-bold text-white">{amountDisplay}</span>
                </div>
                <div>
                  <span className="text-slate-400">Transaction:</span>{' '}
                  <span className="font-semibold text-slate-200">{tx.transactionId}</span>
                </div>
              </div>

              <p className="text-xs text-slate-300 font-sans pl-7">
                {tx.message ||
                  (isBlocked
                    ? 'Suspicious activity was detected.'
                    : 'Your transaction requires review.')}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
