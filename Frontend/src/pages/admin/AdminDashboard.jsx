import React, { useState, useEffect, useCallback } from 'react';
import { fetchAnalyticsSummary, fetchTransactions } from '../../services/api';
import StatusBadge from '../../components/StatusBadge';
import RiskBadge from '../../components/RiskBadge';
import LoadingState from '../../components/LoadingState';
import EmptyState from '../../components/EmptyState';
import TransactionDetailModal from '../../components/TransactionDetailModal';

export default function AdminDashboard() {
  const [summary, setSummary] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedTx, setSelectedTx] = useState(null);

  const loadAdminData = useCallback(async (isInitial = false) => {
    if (isInitial) setLoading(true);
    try {
      const [sumData, txsData] = await Promise.all([
        fetchAnalyticsSummary(),
        fetchTransactions()
      ]);
      setSummary(sumData);
      setTransactions(txsData);
      setError('');
    } catch (err) {
      setError(err.message);
    } finally {
      if (isInitial) setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAdminData(true);
    // Dynamic polling loop every 3 seconds
    const interval = setInterval(() => loadAdminData(false), 3000);
    return () => clearInterval(interval);
  }, [loadAdminData]);

  if (loading) {
    return <LoadingState message="Loading fraud monitoring analytics..." />;
  }
  if (error) {
    return <div role="alert" className="rounded-lg border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-300">{error}</div>;
  }

  const totalCount = Number(summary?.total_count ?? 0);
  const approvedCount = Number(summary?.approved_count ?? 0);
  const reviewCount = Number(summary?.review_count ?? 0);
  const blockedCount = Number(summary?.blocked_count ?? 0);
  const completedCount = approvedCount + reviewCount + blockedCount;

  const avgRiskScore = summary?.average_risk_score == null
    ? 'N/A'
    : `${Math.round(Number(summary.average_risk_score))} / 100`;

  const fraudRate = summary?.fraud_rate == null
    ? 'N/A'
    : `${Number(summary.fraud_rate).toFixed(1)}%`;

  const recentCases = transactions.slice(0, 8);
  const riskDistribution = summary?.risk_distribution || {};
  const activityTrend = Array.isArray(summary?.activity_trend) ? summary.activity_trend : [];
  const maxDailyTransactions = Math.max(
    1,
    ...activityTrend.map((day) => Number(day.total_count || 0))
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-white">Admin Fraud Prevention Dashboard</h1>
        <p className="text-xs text-slate-400">
          Real-time transaction stream analytics, decision distribution, and fraud case monitoring (Live Auto-Sync).
        </p>
      </div>

      {/* 6 Metric Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5 space-y-1">
          <span className="text-[11px] font-semibold text-slate-400 block">Total Transactions</span>
          <div className="text-xl font-bold font-mono text-white">{totalCount}</div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5 space-y-1">
          <span className="text-[11px] font-semibold text-emerald-400 block">Approved</span>
          <div className="text-xl font-bold font-mono text-emerald-400">{approvedCount}</div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5 space-y-1">
          <span className="text-[11px] font-semibold text-amber-400 block">Under Review</span>
          <div className="text-xl font-bold font-mono text-amber-400">{reviewCount}</div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5 space-y-1">
          <span className="text-[11px] font-semibold text-red-400 block">Blocked</span>
          <div className="text-xl font-bold font-mono text-red-400">{blockedCount}</div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5 space-y-1">
          <span className="text-[11px] font-semibold text-slate-400 block">Fraud Rate</span>
          <div className="text-xl font-bold font-mono text-purple-400">{fraudRate}</div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5 space-y-1">
          <span className="text-[11px] font-semibold text-slate-400 block">Avg Risk Score</span>
          <div className="text-xl font-bold font-mono text-cyan-400">{avgRiskScore}</div>
        </div>
      </div>

      {/* Detection Reports & Status Distribution Visualizer */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
        <h2 className="text-sm font-semibold text-white">Transaction Status Distribution</h2>

        {completedCount === 0 ? (
          <div className="text-center py-6 text-slate-400 text-xs italic bg-slate-950/40 rounded-lg border border-slate-800/60">
            No processed fraud decisions yet
          </div>
        ) : (
          <div className="space-y-3">
            <div className="h-4 w-full bg-slate-950 rounded-full overflow-hidden flex border border-slate-800">
              <div
                style={{ width: `${(approvedCount / completedCount) * 100}%` }}
                className="bg-emerald-500 h-full transition-all duration-500"
                title={`Approved: ${approvedCount}`}
              />
              <div
                style={{ width: `${(reviewCount / completedCount) * 100}%` }}
                className="bg-amber-500 h-full transition-all duration-500"
                title={`Review: ${reviewCount}`}
              />
              <div
                style={{ width: `${(blockedCount / completedCount) * 100}%` }}
                className="bg-red-500 h-full transition-all duration-500"
                title={`Blocked: ${blockedCount}`}
              />
            </div>

            <div className="flex flex-wrap items-center justify-between text-xs text-slate-400">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" />
                <span>Approved: <strong className="text-slate-200">{approvedCount}</strong> ({Math.round((approvedCount / completedCount) * 100)}%)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block" />
                <span>Review: <strong className="text-slate-200">{reviewCount}</strong> ({Math.round((reviewCount / completedCount) * 100)}%)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500 inline-block" />
                <span>Blocked: <strong className="text-slate-200">{blockedCount}</strong> ({Math.round((blockedCount / completedCount) * 100)}%)</span>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <section className="space-y-4 rounded-xl border border-slate-800 bg-slate-900 p-5">
          <div>
            <h2 className="text-sm font-semibold text-white">Risk Distribution</h2>
            <p className="text-xs text-slate-400">All recorded transactions, grouped by backend risk score.</p>
          </div>
          {totalCount === 0 ? (
            <EmptyState title="No risk data available." description="Risk distribution will appear after transactions are processed." />
          ) : (
            <div className="space-y-4">
              {[
                ['Low (0–29)', Number(riskDistribution.low || 0), 'bg-emerald-500'],
                ['Elevated (30–69)', Number(riskDistribution.elevated || 0), 'bg-amber-500'],
                ['High (70–100)', Number(riskDistribution.high || 0), 'bg-red-500']
              ].map(([label, count, color]) => (
                <div key={label}>
                  <div className="mb-1.5 flex justify-between text-xs">
                    <span className="text-slate-300">{label}</span>
                    <span className="font-mono text-slate-200">{count}</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-slate-950">
                    <div
                      className={`h-full ${color} transition-all duration-500`}
                      style={{ width: `${Math.min(100, (count / totalCount) * 100)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="space-y-4 rounded-xl border border-slate-800 bg-slate-900 p-5">
          <div>
            <h2 className="text-sm font-semibold text-white">Detection Activity</h2>
            <p className="text-xs text-slate-400">Daily transactions and REVIEW/BLOCKED decisions over the last seven days.</p>
          </div>
          {activityTrend.length === 0 ? (
            <EmptyState title="No recent activity." description="Daily activity will appear after transactions are processed." />
          ) : (
            <div className="space-y-3">
              {activityTrend.map((day) => {
                const total = Number(day.total_count || 0);
                const review = Number(day.review_count || 0);
                const blocked = Number(day.blocked_count || 0);
                const dayLabel = new Date(`${String(day.day).slice(0, 10)}T12:00:00`).toLocaleDateString();
                return (
                  <div key={String(day.day)} className="grid grid-cols-[5rem_1fr_3.5rem] items-center gap-3 text-xs">
                    <span className="text-slate-400">{dayLabel}</span>
                    <div className="flex h-2 overflow-hidden rounded-full bg-slate-950">
                      <div className="bg-amber-500" style={{ width: `${(review / maxDailyTransactions) * 100}%` }} />
                      <div className="bg-red-500" style={{ width: `${(blocked / maxDailyTransactions) * 100}%` }} />
                      <div className="bg-slate-500" style={{ width: `${(Math.max(0, total - review - blocked) / maxDailyTransactions) * 100}%` }} />
                    </div>
                    <span className="text-right font-mono text-slate-200">{total}</span>
                  </div>
                );
              })}
              <div className="flex gap-4 border-t border-slate-800 pt-3 text-[11px] text-slate-400">
                <span><i className="mr-1.5 inline-block h-2 w-2 rounded-full bg-amber-500" />Review</span>
                <span><i className="mr-1.5 inline-block h-2 w-2 rounded-full bg-red-500" />Blocked</span>
                <span><i className="mr-1.5 inline-block h-2 w-2 rounded-full bg-slate-500" />Other</span>
              </div>
            </div>
          )}
        </section>
      </div>

      {/* Recent Detection Cases */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
        <div>
          <h2 className="text-sm font-semibold text-white">Recent Detection Cases</h2>
          <p className="text-xs text-slate-400">Select any transaction row to inspect ML model features and rules</p>
        </div>

        {recentCases.length === 0 ? (
          <EmptyState title="No detection data available." description="No recent fraud detection cases recorded in the system ledger." />
        ) : (
          <div className="overflow-x-auto rounded-lg border border-slate-800">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] font-semibold border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">Transaction ID</th>
                  <th className="py-3 px-4">User</th>
                  <th className="py-3 px-4">Amount</th>
                  <th className="py-3 px-4 text-center">Risk Score</th>
                  <th className="py-3 px-4 text-center">ML Fraud Prob</th>
                  <th className="py-3 px-4 text-center">Decision</th>
                  <th className="py-3 px-4">Date / Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 bg-slate-900">
                {recentCases.map((tx) => (
                  <tr
                    key={tx.id || tx.transactionId}
                    onClick={() => setSelectedTx(tx)}
                    tabIndex={0}
                    onKeyDown={(e) => e.key === 'Enter' && setSelectedTx(tx)}
                    className="hover:bg-slate-800/60 cursor-pointer transition-colors focus:outline-none focus:bg-slate-800"
                  >
                    <td className="py-3 px-4 font-mono font-medium text-slate-100">
                      {tx.transactionId}
                    </td>
                    <td className="py-3 px-4 font-medium text-slate-200">
                      {tx.userId}
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-white">
                      {tx.currency || 'INR'} {Number(tx.amount).toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <RiskBadge score={tx.riskScore} />
                    </td>
                    <td className="py-3 px-4 text-center font-mono font-semibold text-cyan-400">
                      {tx.fraudProbability != null ? `${Math.round(Number(tx.fraudProbability) * 100)}%` : 'N/A'}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <StatusBadge status={tx.decision || 'UNPROCESSED'} />
                    </td>
                    <td className="py-3 px-4 text-slate-400 text-[11px]">
                      {tx.createdAt || tx.transactionTime
                        ? new Date(tx.createdAt || tx.transactionTime).toLocaleString()
                        : 'Unavailable'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {selectedTx && (
        <TransactionDetailModal
          transaction={selectedTx}
          onClose={() => setSelectedTx(null)}
        />
      )}
    </div>
  );
}
