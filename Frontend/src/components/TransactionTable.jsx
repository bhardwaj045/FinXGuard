import React, { useState } from 'react';

export default function TransactionTable({ transactions = [], onSelectTransaction }) {
  const [filterDecision, setFilterDecision] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const filtered = transactions.filter(tx => {
    const matchesDecision = filterDecision === 'ALL' || tx.decision === filterDecision;
    const q = searchQuery.toLowerCase();
    const matchesQuery =
      !searchQuery ||
      (tx.transactionId && tx.transactionId.toLowerCase().includes(q)) ||
      (tx.userId && tx.userId.toLowerCase().includes(q));
    return matchesDecision && matchesQuery;
  });

  const getDecisionBadge = (decision) => {
    switch (decision) {
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
            {decision || 'UNPROCESSED'}
          </span>
        );
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
      {/* Header controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
        <div>
          <h2 className="text-base font-semibold text-white">Transactions</h2>
          <p className="text-xs text-slate-400">Click any transaction row to inspect full details</p>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <input
            type="text"
            placeholder="Search User / Tx..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-slate-700"
          />

          <div className="flex items-center bg-slate-950 border border-slate-800 p-0.5 rounded-lg text-xs">
            {['ALL', 'APPROVED', 'REVIEW', 'BLOCKED'].map(opt => (
              <button
                key={opt}
                onClick={() => setFilterDecision(opt)}
                className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
                  filterDecision === opt
                    ? 'bg-slate-800 text-white font-semibold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {opt}
              </button>
            ))}
          </div>
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
              <th className="py-3 px-4 text-center">Decision</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 bg-slate-900">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan="5" className="text-center py-6 text-slate-500">
                  No transactions match the criteria.
                </td>
              </tr>
            ) : (
              filtered.map((tx) => {
                const amountDisplay = typeof tx.amount === 'number'
                  ? `₹${tx.amount.toLocaleString()}`
                  : (tx.amount?.startsWith('₹') ? tx.amount : `₹${tx.amount}`);

                return (
                  <tr
                    key={tx.id || tx.transactionId}
                    onClick={() => onSelectTransaction(tx)}
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
                      {getDecisionBadge(tx.decision)}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
