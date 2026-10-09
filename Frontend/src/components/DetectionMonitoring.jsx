import React, { useState } from 'react';
import TransactionDetailModal from './TransactionDetailModal';

export default function DetectionMonitoring({ transactions = [], onSelectTransaction }) {
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [modalTx, setModalTx] = useState(null);

  const filtered = transactions.filter((tx) => {
    if (filterStatus === 'ALL') return true;
    return tx.decision === filterStatus;
  });

  const getStatusBadge = (status) => {
    switch (status) {
      case 'APPROVED':
        return (
          <span className="px-2.5 py-0.5 rounded text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            APPROVED
          </span>
        );
      case 'REVIEW':
        return (
          <span className="px-2.5 py-0.5 rounded text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">
            REVIEW
          </span>
        );
      case 'BLOCKED':
        return (
          <span className="px-2.5 py-0.5 rounded text-xs font-semibold bg-red-500/10 text-red-400 border border-red-500/20">
            BLOCKED
          </span>
        );
      case 'UNPROCESSED':
      case 'LEGACY':
      default:
        return (
          <span className="px-2.5 py-0.5 rounded text-xs font-semibold bg-slate-800 text-slate-400 border border-slate-700">
            {status || 'UNPROCESSED'}
          </span>
        );
    }
  };

  const handleRowClick = (tx) => {
    setModalTx(tx);
    if (onSelectTransaction) {
      onSelectTransaction(tx);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-white">Detection Monitoring</h2>
        <p className="text-xs text-slate-400">Monitor evaluated transactions and inspect live detection reasons.</p>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
        {/* Filters */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-400">Filters:</span>
            <div className="flex items-center bg-slate-950 border border-slate-800 p-0.5 rounded-lg text-xs">
              {['ALL', 'APPROVED', 'REVIEW', 'BLOCKED'].map((opt) => (
                <button
                  key={opt}
                  onClick={() => setFilterStatus(opt)}
                  className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                    filterStatus === opt
                      ? 'bg-slate-800 text-white font-semibold'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {opt === 'ALL' ? 'All' : opt.charAt(0) + opt.slice(1).toLowerCase()}
                </button>
              ))}
            </div>
          </div>
          <div className="text-xs text-slate-400">
            Showing {filtered.length} transactions
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto rounded-lg border border-slate-800">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950 text-slate-400 uppercase text-[11px] font-semibold border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Transaction</th>
                <th className="py-3 px-4">User</th>
                <th className="py-3 px-4">Amount</th>
                <th className="py-3 px-4 text-center">Risk</th>
                <th className="py-3 px-4 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 bg-slate-900">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan="5" className="text-center py-6 text-slate-500">
                    No transactions found for filter "{filterStatus}".
                  </td>
                </tr>
              ) : (
                filtered.map((tx) => {
                  const amountDisplay =
                    typeof tx.amount === 'number'
                      ? `₹${tx.amount.toLocaleString()}`
                      : tx.amount?.startsWith('₹')
                      ? tx.amount
                      : `₹${tx.amount}`;

                  return (
                    <tr
                      key={tx.id || tx.transactionId}
                      onClick={() => handleRowClick(tx)}
                      className="hover:bg-slate-800/60 cursor-pointer transition-colors"
                    >
                      <td className="py-3 px-4 font-mono font-medium text-slate-100">
                        {tx.transactionId}
                      </td>
                      <td className="py-3 px-4 font-medium text-white">
                        {tx.userId}
                      </td>
                      <td className="py-3 px-4 font-mono font-semibold text-slate-200">
                        {amountDisplay}
                      </td>
                      <td className="py-3 px-4 text-center font-mono font-bold text-slate-200">
                        {tx.riskScore != null ? tx.riskScore : 'N/A'}
                      </td>
                      <td className="py-3 px-4 text-center">
                        {getStatusBadge(tx.decision)}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {modalTx && (
        <TransactionDetailModal
          transaction={modalTx}
          onClose={() => setModalTx(null)}
        />
      )}
    </div>
  );
}
