import React from 'react';
import StatCard from './StatCard';
import AnalyticsCharts from './AnalyticsCharts';

export default function AdminDashboard({
  transactions = [],
  summary,
  onSelectTransaction
}) {
  const totalCount = summary?.total_count ?? transactions.length ?? 150;
  const approvedCount =
    summary?.approved_count ??
    transactions.filter((t) => t.decision === 'APPROVED').length ?? 120;
  const reviewCount =
    summary?.review_count ??
    transactions.filter((t) => t.decision === 'REVIEW').length ?? 18;
  const blockedCount =
    summary?.blocked_count ??
    transactions.filter((t) => t.decision === 'BLOCKED').length ?? 12;

  const recentCases = transactions.slice(0, 10);

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
      default:
        return <span className="text-slate-400 text-xs">{decision || 'APPROVED'}</span>;
    }
  };

  const formatReason = (reasons) => {
    if (!reasons) return 'No fraud indicators detected.';
    if (typeof reasons === 'string') {
      const line = reasons.split('\n')[0].replace(/^[•\-\s]+/, '');
      return line || 'No fraud indicators detected.';
    }
    if (Array.isArray(reasons) && reasons.length > 0) {
      return reasons[0].replace(/^[•\-\s]+/, '');
    }
    return 'No fraud indicators detected.';
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-white">Admin Dashboard</h2>
        <p className="text-xs text-slate-400">Overview of system analytics, fraud detection reports, and recent cases.</p>
      </div>

      {/* 4 Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Transactions" value={totalCount} variant="default" />
        <StatCard title="Approved" value={approvedCount} variant="approved" />
        <StatCard title="Review" value={reviewCount} variant="review" />
        <StatCard title="Blocked" value={blockedCount} variant="blocked" />
      </div>

      {/* Detection Reports Graph */}
      <div className="space-y-2">
        <h3 className="text-sm font-semibold text-slate-200">Detection Reports</h3>
        <AnalyticsCharts
          summary={{
            total_count: totalCount,
            approved_count: approvedCount,
            review_count: reviewCount,
            blocked_count: blockedCount
          }}
        />
      </div>

      {/* Recent Detection Cases */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
        <div>
          <h3 className="text-sm font-semibold text-white">Recent Detection Cases</h3>
          <p className="text-xs text-slate-400">Click any row to open full detection details</p>
        </div>

        <div className="overflow-x-auto rounded-lg border border-slate-800">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950 text-slate-400 uppercase text-[11px] font-semibold border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Transaction</th>
                <th className="py-3 px-4">Amount</th>
                <th className="py-3 px-4 text-center">Risk</th>
                <th className="py-3 px-4 text-center">Decision</th>
                <th className="py-3 px-4">Reason</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 bg-slate-900">
              {recentCases.map((tx) => {
                const amountDisplay =
                  typeof tx.amount === 'number'
                    ? `₹${tx.amount.toLocaleString()}`
                    : tx.amount?.startsWith('₹')
                    ? tx.amount
                    : `₹${tx.amount}`;

                return (
                  <tr
                    key={tx.id || tx.transactionId}
                    onClick={() => onSelectTransaction(tx)}
                    className="hover:bg-slate-800/60 cursor-pointer transition-colors"
                  >
                    <td className="py-3 px-4 font-mono font-medium text-slate-100">
                      {tx.transactionId}
                    </td>
                    <td className="py-3 px-4 font-mono font-semibold text-slate-200">
                      {amountDisplay}
                    </td>
                    <td className="py-3 px-4 text-center font-mono font-bold text-slate-200">
                      {tx.riskScore ?? 0}
                    </td>
                    <td className="py-3 px-4 text-center">
                      {getDecisionBadge(tx.decision)}
                    </td>
                    <td className="py-3 px-4 text-slate-300 max-w-xs truncate">
                      {formatReason(tx.decisionReasons)}
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
