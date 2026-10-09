import React, { useState, useEffect, useCallback } from 'react';
import { fetchTransactions } from '../../services/api';
import { Search, Filter, ShieldAlert } from 'lucide-react';
import StatusBadge from '../../components/StatusBadge';
import RiskBadge from '../../components/RiskBadge';
import LoadingState from '../../components/LoadingState';
import EmptyState from '../../components/EmptyState';
import TransactionDetailModal from '../../components/TransactionDetailModal';

export default function DetectionMonitoring() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [riskFilter, setRiskFilter] = useState('ALL');
  const [dateFilter, setDateFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [userFilter, setUserFilter] = useState('');
  const [selectedTx, setSelectedTx] = useState(null);
  const [error, setError] = useState('');

  const loadData = useCallback(async (isInitial = false) => {
    if (isInitial) setLoading(true);
    try {
      const data = await fetchTransactions();
      setTransactions(data);
      setError('');
    } catch (err) {
      setError(err.message);
    } finally {
      if (isInitial) setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData(true);
    // Dynamic background polling every 3 seconds
    const interval = setInterval(() => loadData(false), 3000);
    return () => clearInterval(interval);
  }, [loadData]);

  const filtered = transactions.filter((tx) => {
    if (statusFilter !== 'ALL' && tx.decision !== statusFilter) {
      return false;
    }

    const score = tx.riskScore ?? 0;
    if (riskFilter === 'HIGH' && score < 70) return false;
    if (riskFilter === 'MEDIUM' && (score < 30 || score >= 70)) return false;
    if (riskFilter === 'LOW' && score >= 30) return false;

    const user = String(tx.userEmail || tx.userId || '').toLowerCase();
    if (userFilter.trim() && !user.includes(userFilter.trim().toLowerCase())) return false;

    if (dateFilter !== 'ALL') {
      const txTime = tx.createdAt ? new Date(tx.createdAt).getTime() : 0;
      const age = Date.now() - txTime;
      if (dateFilter === 'TODAY' && age > 86400000) return false;
      if (dateFilter === 'THIS_WEEK' && age > 86400000 * 7) return false;
      if (dateFilter === 'THIS_MONTH' && age > 86400000 * 30) return false;
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchId = (tx.transactionId || '').toLowerCase().includes(q);
      const matchUser = (tx.userEmail || tx.userId || '').toLowerCase().includes(q);
      const matchMerchant = (tx.merchant || '').toLowerCase().includes(q);
      if (!matchId && !matchUser && !matchMerchant) return false;
    }

    return true;
  });

  if (loading) {
    return <LoadingState message="Loading detection monitoring records..." />;
  }
  if (error && transactions.length === 0) {
    return (
      <div role="alert" className="space-y-3 rounded-lg border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-300">
        <p>Unable to load detection cases: {error}</p>
        <button
          type="button"
          onClick={() => loadData(true)}
          className="rounded-md border border-red-400/30 px-3 py-1.5 text-xs font-semibold hover:bg-red-500/10"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-white flex items-center gap-2">
          <ShieldAlert className="w-5 h-5 text-amber-400" />
          Detection Monitoring
        </h1>
        <p className="text-xs text-slate-400">
          Review, inspect, and evaluate transaction risk scores and Smile ML engine fraud signals (Live Auto-Sync).
        </p>
      </div>
      {error && (
        <div role="alert" className="rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-300">
          Refresh failed: {error}. Showing the last successfully loaded results.
        </div>
      )}

      {/* Filter Control Toolbar */}
      <div className="bg-[#102438] border border-[#29445D] rounded-xl p-4 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-[#71869C] absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by Transaction ID, User Email, Merchant..."
            className="w-full bg-[#0D2033] border border-[#29445D] rounded-lg pl-9 pr-3.5 py-2 text-xs text-[#F4F7FB] placeholder-[#71869C] focus:outline-none focus:border-[#19C99A]"
          />
        </div>

        <input
          type="text"
          value={userFilter}
          onChange={(e) => setUserFilter(e.target.value)}
          placeholder="Filter by user ID or email"
          aria-label="Filter detection cases by user"
          className="max-w-xs rounded-lg border border-[#29445D] bg-[#0D2033] px-3.5 py-2 text-xs text-[#F4F7FB] placeholder-[#71869C] focus:border-[#19C99A] focus:outline-none"
        />

        {/* Status & Risk Filters */}
        <div className="flex flex-wrap items-center gap-3 text-xs">
          <div className="flex items-center gap-1.5">
            <span className="text-[#9FB0C3] font-medium">Date:</span>
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="bg-[#0D2033] border border-[#29445D] text-[#F4F7FB] rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-[#19C99A]"
            >
              <option value="ALL">All Time</option>
              <option value="TODAY">Last 24 Hours</option>
              <option value="THIS_WEEK">Past 7 Days</option>
              <option value="THIS_MONTH">Past 30 Days</option>
            </select>
          </div>
          <div className="flex items-center gap-1.5">
            <Filter className="w-3.5 h-3.5 text-[#9FB0C3]" />
            <span className="text-[#9FB0C3] font-medium">Decision:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-[#0D2033] border border-[#29445D] text-[#F4F7FB] rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-[#19C99A]"
            >
              <option value="ALL">All Decisions</option>
              <option value="REVIEW">REVIEW</option>
              <option value="BLOCKED">BLOCKED</option>
              <option value="APPROVED">APPROVED</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-[#9FB0C3] font-medium">Risk Tier:</span>
            <select
              value={riskFilter}
              onChange={(e) => setRiskFilter(e.target.value)}
              className="bg-[#0D2033] border border-[#29445D] text-[#F4F7FB] rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-[#19C99A]"
            >
              <option value="ALL">All Scores</option>
              <option value="HIGH">High Risk (70+)</option>
              <option value="MEDIUM">Medium Risk (30-69)</option>
              <option value="LOW">Low Risk (&lt;30)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Detection Audit Table */}
     {/* Detection Audit Table */}
<div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
  <div className="flex items-center justify-between">
    <div>
      <h2 className="text-sm font-semibold text-white">
        Recent Detection Cases
      </h2>
      <p className="mt-1 text-xs text-slate-400">
        Showing {filtered.length} of {transactions.length} transaction records.
        Click any row to inspect complete details.
      </p>
    </div>
  </div>

  {filtered.length === 0 ? (
    <EmptyState
      title="No matching detection cases."
      description="No transactions match the selected filter criteria."
    />
  ) : (
    <div className="max-h-[650px] overflow-auto rounded-lg border border-slate-800">
      <table className="min-w-[1250px] w-full text-left text-xs text-slate-300">
        <thead className="sticky top-0 z-10 bg-slate-950 text-slate-400 uppercase text-[10px] font-semibold border-b border-slate-800">
          <tr>
            <th className="whitespace-nowrap py-3 px-4">
              Transaction ID
            </th>

            <th className="whitespace-nowrap py-3 px-4">
              User Account
            </th>

            <th className="whitespace-nowrap py-3 px-4">
              Amount
            </th>

            <th className="whitespace-nowrap py-3 px-4 text-center">
              Risk Score
            </th>

            <th className="whitespace-nowrap py-3 px-4 text-center">
              ML Fraud Prob
            </th>

            <th className="whitespace-nowrap py-3 px-4 text-center">
              Decision
            </th>

            <th className="min-w-[360px] py-3 px-4">
              Detection Reasons
            </th>

            <th className="whitespace-nowrap py-3 px-4">
              Date / Time
            </th>
          </tr>
        </thead>

        <tbody className="divide-y divide-slate-800/60 bg-slate-900">
          {filtered.map((tx) => {
            const reasons = Array.isArray(tx.decisionReasons)
              ? tx.decisionReasons
              : typeof tx.decisionReasons === 'string'
                ? tx.decisionReasons
                    .split('\n')
                    .map((reason) => reason.trim())
                    .filter(Boolean)
                : [];

            const formattedDate = tx.createdAt
              ? new Date(tx.createdAt).toLocaleString()
              : 'N/A';

            return (
              <tr
                key={tx.id || tx.transactionId}
                onClick={() => setSelectedTx(tx)}
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    setSelectedTx(tx);
                  }
                }}
                className="cursor-pointer transition-colors hover:bg-slate-800/60 focus:bg-slate-800 focus:outline-none"
              >
                {/* Transaction ID */}
                <td className="max-w-[220px] py-4 px-4 align-top">
                  <span className="block break-all font-mono font-medium text-slate-100">
                    {tx.transactionId || 'N/A'}
                  </span>
                </td>

                {/* User */}
                <td className="max-w-[220px] py-4 px-4 align-top">
                  <span className="block break-words font-medium text-slate-200">
                    {tx.userEmail || tx.userId || 'N/A'}
                  </span>
                </td>

                {/* Amount */}
                <td className="whitespace-nowrap py-4 px-4 align-top">
                  <span className="font-mono font-bold text-white">
                    {tx.currency || 'INR'}{' '}
                    {Number(tx.amount || 0).toLocaleString('en-IN')}
                  </span>
                </td>

                {/* Risk Score */}
                <td className="py-4 px-4 text-center align-top">
                  <RiskBadge score={tx.riskScore} />
                </td>

                {/* ML Probability */}
                <td className="whitespace-nowrap py-4 px-4 text-center align-top">
                  <span className="font-mono font-bold text-cyan-400">
                    {tx.fraudProbability != null
                      ? `${Math.round(
                          Number(tx.fraudProbability) * 100
                        )}%`
                      : 'N/A'}
                  </span>
                </td>

                {/* Decision */}
                <td className="py-4 px-4 text-center align-top">
                  <StatusBadge
                    status={tx.decision || 'UNPROCESSED'}
                  />
                </td>

                {/* Detection Reasons */}
                <td className="min-w-[360px] max-w-[520px] py-4 px-4 align-top">
                  {reasons.length > 0 ? (
                    <div className="space-y-1.5">
                      {reasons.map((reason, index) => (
                        <div
                          key={`${tx.transactionId}-reason-${index}`}
                          className="whitespace-normal break-words leading-5 text-amber-300"
                        >
                          {reason}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <span className="font-medium text-slate-500">
                      No fraud indicators detected.
                    </span>
                  )}
                </td>

                {/* Date / Time */}
                <td className="whitespace-nowrap py-4 px-4 align-top text-slate-400">
                  {formattedDate}
                </td>
              </tr>
            );
          })}
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
