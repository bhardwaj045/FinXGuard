import React, { useState } from 'react';
import TransactionDetailModal from './TransactionDetailModal';

export default function MyTransactions({ transactions = [], onSelectTransaction }) {
  const [modalTx, setModalTx] = useState(null);
  const [search, setSearch] = useState('');

  const filtered = transactions.filter((tx) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      tx.transactionId?.toLowerCase().includes(q) ||
      tx.merchantId?.toLowerCase().includes(q) ||
      tx.city?.toLowerCase().includes(q)
    );
  });

  const getStatusBadge = (status) => {
    switch (status) {
      case 'APPROVED':
        return (
          <span className="px-2.5 py-0.5 rounded text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            Approved
          </span>
        );
      case 'REVIEW':
        return (
          <span className="px-2.5 py-0.5 rounded text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">
            Review
          </span>
        );
      case 'BLOCKED':
        return (
          <span className="px-2.5 py-0.5 rounded text-xs font-semibold bg-red-500/10 text-red-400 border border-red-500/20">
            Blocked
          </span>
        );
      default:
        return <span className="text-slate-400 text-xs">Approved</span>;
    }
  };

  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <h2 className="text-xl font-bold text-white">My Transactions</h2>
        <p className="text-xs text-slate-400">Complete transaction history and evaluation records.</p>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
        <div className="flex items-center justify-between gap-4">
          <input
            type="text"
            placeholder="Filter transactions..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-lg px-3.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-slate-700 w-64"
          />
          <span className="text-xs text-slate-400">
            Total: {filtered.length}
          </span>
        </div>

        <div className="overflow-x-auto rounded-lg border border-slate-800">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950 text-slate-400 uppercase text-[11px] font-semibold border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Transaction</th>
                <th className="py-3 px-4">Merchant</th>
                <th className="py-3 px-4">City</th>
                <th className="py-3 px-4">Amount</th>
                <th className="py-3 px-4 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 bg-slate-900">
              {filtered.map((tx) => {
                const amountDisplay =
                  typeof tx.amount === 'number'
                    ? `₹${tx.amount.toLocaleString()}`
                    : tx.amount?.startsWith('₹')
                    ? tx.amount
                    : `₹${tx.amount}`;

                return (
                  <tr
                    key={tx.id || tx.transactionId}
                    onClick={() => setModalTx(tx)}
                    className="hover:bg-slate-800/60 cursor-pointer transition-colors"
                  >
                    <td className="py-3 px-4 font-mono font-medium text-slate-100">
                      {tx.transactionId}
                    </td>
                    <td className="py-3 px-4 font-medium text-white">
                      {tx.merchantId || tx.merchantCategory || 'Retail'}
                    </td>
                    <td className="py-3 px-4 text-slate-300">
                      {tx.city || 'Delhi'}
                    </td>
                    <td className="py-3 px-4 font-mono font-semibold text-slate-200">
                      {amountDisplay}
                    </td>
                    <td className="py-3 px-4 text-center">
                      {getStatusBadge(tx.decision)}
                    </td>
                  </tr>
                );
              })}
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
