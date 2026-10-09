import React, { useEffect } from 'react';
import { X, Shield, Calendar, CreditCard } from 'lucide-react';
import StatusBadge from './StatusBadge';
import RiskBadge from './RiskBadge';

export default function TransactionDetailModal({ transaction, onClose }) {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!transaction) return null;

  const rawReasons = Array.isArray(transaction.decisionReasons)
    ? transaction.decisionReasons
    : typeof transaction.decisionReasons === 'string'
    ? transaction.decisionReasons.split('\n').filter(Boolean)
    : [];

  // Strip points annotations like (+20) or (+30) if present in raw strings
  const reasons = rawReasons
    .map((r) => String(r).replace(/^[•\-\s]+/, '').replace(/\s*\(\+\d+\)/g, '').trim())
    .filter(Boolean);

  const mlProbPercent = transaction.fraudProbability != null
    ? Math.round(Number(transaction.fraudProbability) * 100)
    : 0;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full p-6 space-y-6 shadow-2xl relative text-slate-100 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-slate-800 pb-4">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h3 id="modal-title" className="text-lg font-bold font-mono text-white">
                {transaction.transactionId}
              </h3>
              <StatusBadge
                status={transaction.decision || transaction.status}
                riskScore={transaction.riskScore}
                fraudProbability={transaction.fraudProbability}
              />
            </div>
            <p className="text-xs text-slate-400 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-slate-500" />
              {new Date(transaction.createdAt || Date.now()).toLocaleString()}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Risk & ML Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex justify-between items-center">
            <div>
              <span className="text-xs font-medium text-slate-400 block">Risk Score</span>
              <span className="text-xs text-slate-500">Calculated by Fraud Decision Engine</span>
            </div>
            <RiskBadge score={transaction.riskScore} />
          </div>

          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex justify-between items-center">
            <div>
              <span className="text-xs font-medium text-slate-400 block">ML Fraud Probability</span>
              <span className="text-xs text-slate-500">Smile Logistic Regression Model</span>
            </div>
            <span className="text-base font-bold font-mono text-cyan-400">
              {transaction.fraudProbability != null ? `${Math.round(Number(transaction.fraudProbability) * 100)}%` : 'N/A'}
            </span>
          </div>
        </div>

        {/* Detection Reasons */}
        <div className="space-y-2">
          <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-2">
            <Shield className="w-4 h-4 text-emerald-400" />
            Detection Reasons
          </h4>
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
            {reasons.length > 0 ? (
              <ul className="space-y-2">
                {reasons.map((reason, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-xs text-amber-300 font-medium">
                    <span className="text-amber-500 font-bold">•</span>
                    <span>{reason}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-xs text-emerald-400 font-medium flex items-center gap-1.5">
                ✓ No fraud indicators detected.
              </p>
            )}
          </div>
        </div>

        {/* Transaction Details Grid */}
        <div className="space-y-2">
          <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-slate-400" />
            Transaction Details
          </h4>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 bg-slate-950 p-4 rounded-xl border border-slate-800 text-xs">
            <div>
              <span className="text-slate-500 block mb-0.5">Amount</span>
              <span className="font-mono font-bold text-white">
                {transaction.currency || 'INR'} {Number(transaction.amount || 0).toLocaleString()}
              </span>
            </div>

            <div>
              <span className="text-slate-500 block mb-0.5">Merchant</span>
              <span className="font-semibold text-slate-200">{transaction.merchant || 'N/A'}</span>
            </div>

            <div>
              <span className="text-slate-500 block mb-0.5">Category</span>
              <span className="font-semibold text-slate-300">{transaction.merchantCategory || 'General'}</span>
            </div>

            <div>
              <span className="text-slate-500 block mb-0.5">Country</span>
              <span className="font-semibold text-slate-200">{transaction.country || 'IN'}</span>
            </div>

            <div>
              <span className="text-slate-500 block mb-0.5">City</span>
              <span className="font-semibold text-slate-200">{transaction.city || 'N/A'}</span>
            </div>

            <div>
              <span className="text-slate-500 block mb-0.5">Device</span>
              <span className="font-mono text-slate-200">{transaction.device || 'N/A'}</span>
            </div>

            <div>
              <span className="text-slate-500 block mb-0.5">Channel</span>
              <span className="font-semibold text-slate-200">{transaction.channel || 'ONLINE'}</span>
            </div>

            <div>
              <span className="text-slate-500 block mb-0.5">User ID</span>
              <span className="font-mono text-slate-300">{transaction.userId || 'N/A'}</span>
            </div>
          </div>
        </div>

        {/* Action button */}
        <div className="pt-2 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs border border-slate-700 transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
