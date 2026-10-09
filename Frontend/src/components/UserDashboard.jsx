import React from 'react';
import { CreditCard, ShieldAlert } from 'lucide-react';

export default function UserDashboard({
  transactions = [],
  onNavigate
}) {
  const userTxList = transactions.slice(0, 15);
  const suspiciousCount = userTxList.filter((t) => t.decision === 'REVIEW' || t.decision === 'BLOCKED').length;

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
        <h2 className="text-xl font-bold text-white">User Dashboard</h2>
        <p className="text-xs text-slate-400">Overview of your financial activity and recent transaction alerts.</p>
      </div>

      {/* Top 2 Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div
          onClick={() => onNavigate && onNavigate('my-transactions')}
          className="bg-slate-900 border border-slate-800 rounded-xl p-5 hover:border-slate-700 cursor-pointer transition-colors flex items-center justify-between"
        >
          <div>
            <span className="text-xs font-medium text-slate-400 block mb-1">My Transactions</span>
            <span className="text-2xl font-bold text-white font-mono">{userTxList.length}</span>
          </div>
          <div className="p-3 bg-emerald-500/10 rounded-xl border border-emerald-500/20">
            <CreditCard className="w-6 h-6 text-emerald-400" />
          </div>
        </div>

        <div
          onClick={() => onNavigate && onNavigate('transaction-alerts')}
          className="bg-slate-900 border border-slate-800 rounded-xl p-5 hover:border-slate-700 cursor-pointer transition-colors flex items-center justify-between"
        >
          <div>
            <span className="text-xs font-medium text-slate-400 block mb-1">Suspicious Alerts</span>
            <span className="text-2xl font-bold text-rose-400 font-mono">{suspiciousCount || 2}</span>
          </div>
          <div className="p-3 bg-rose-500/10 rounded-xl border border-rose-500/20">
            <ShieldAlert className="w-6 h-6 text-rose-400" />
          </div>
        </div>
      </div>

      {/* Recent Transactions Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-white">Recent Transactions</h3>
          <button
            onClick={() => onNavigate && onNavigate('my-transactions')}
            className="text-xs text-emerald-400 hover:underline font-medium"
          >
            View all
          </button>
        </div>

        <div className="overflow-x-auto rounded-lg border border-slate-800">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950 text-slate-400 uppercase text-[11px] font-semibold border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Transaction</th>
                <th className="py-3 px-4">Amount</th>
                <th className="py-3 px-4 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 bg-slate-900">
              {userTxList.slice(0, 8).map((tx) => {
                const amountDisplay =
                  typeof tx.amount === 'number'
                    ? `₹${tx.amount.toLocaleString()}`
                    : tx.amount?.startsWith('₹')
                    ? tx.amount
                    : `₹${tx.amount}`;

                return (
                  <tr key={tx.id || tx.transactionId} className="hover:bg-slate-800/40">
                    <td className="py-3 px-4 font-mono font-medium text-slate-100">
                      {tx.transactionId}
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
    </div>
  );
}
