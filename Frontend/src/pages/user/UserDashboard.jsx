import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import { fetchTransactions, fetchUserAlerts } from '../../services/api';
import { CreditCard, CheckCircle2, AlertTriangle, ShieldAlert, ArrowUpRight, Bell } from 'lucide-react';
import StatusBadge from '../../components/StatusBadge';
import LoadingState from '../../components/LoadingState';
import EmptyState from '../../components/EmptyState';
import TransactionDetailModal from '../../components/TransactionDetailModal';
import { Link } from 'react-router-dom';

export default function UserDashboard() {
  const { currentUser } = useAuth();
  const [transactions, setTransactions] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedTx, setSelectedTx] = useState(null);

  const loadDashboardData = useCallback(async (isInitial = false) => {
    if (isInitial) setLoading(true);
    try {
      const userIdentifier = currentUser.id || currentUser.email;
      const [txs, altList] = await Promise.all([
        fetchTransactions(userIdentifier),
        fetchUserAlerts(userIdentifier)
      ]);
      setTransactions(txs);
      setAlerts(altList);
      setError('');
    } catch (err) {
      setError(err.message);
    } finally {
      if (isInitial) setLoading(false);
    }
  }, [currentUser]);

  useEffect(() => {
    loadDashboardData(true);
    // Dynamic polling interval every 3 seconds for real-time history updates
    const interval = setInterval(() => loadDashboardData(false), 3000);
    return () => clearInterval(interval);
  }, [loadDashboardData]);

  const totalCount = transactions.length;
  const approvedCount = transactions.filter((t) => t.decision === 'APPROVED').length;
  const reviewCount = transactions.filter((t) => t.decision === 'REVIEW').length;
  const blockedCount = transactions.filter((t) => t.decision === 'BLOCKED').length;

  const recentTransactions = transactions.slice(0, 5);
  const recentAlerts = alerts.slice(0, 3);

  if (loading) {
    return <LoadingState message="Loading your financial dashboard..." />;
  }
  if (error) {
    return <div role="alert" className="rounded-lg border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-300">{error}</div>;
  }
  const riskScores = transactions.map((transaction) => transaction.riskScore).filter((score) => score != null);
  const averageRiskScore = riskScores.length
    ? `${(riskScores.reduce((sum, score) => sum + Number(score), 0) / riskScores.length).toFixed(1)} / 100`
    : '—';

  return (
    <div className="space-y-6">
      {/* Header Greeting */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white">Welcome back, {currentUser.name}</h1>
          <p className="text-xs text-slate-400">Account Summary & Real-Time Fraud Protection Status</p>
        </div>
        <Link
          to="/user/make-transaction"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition-colors self-start sm:self-auto"
        >
          <span>Make Transaction</span>
          <ArrowUpRight className="w-4 h-4" />
        </Link>
      </div>

      {/* Account Summary & Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Total Transactions</span>
            <CreditCard className="w-4 h-4 text-slate-500" />
          </div>
          <div className="text-2xl font-bold font-mono text-white">{totalCount}</div>
          <span className="text-[11px] text-slate-500 block">Lifetime processed</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Approved</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-emerald-400">{approvedCount}</div>
          <span className="text-[11px] text-emerald-500/80 block">Legitimate activities</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Under Review</span>
            <AlertTriangle className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-amber-400">{reviewCount}</div>
          <span className="text-[11px] text-amber-500/80 block">Verification pending</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Blocked</span>
            <ShieldAlert className="w-4 h-4 text-red-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-red-400">{blockedCount}</div>
          <span className="text-[11px] text-red-500/80 block">Security intervention</span>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Average Risk Score</span>
            <ShieldAlert className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-cyan-400">{averageRiskScore}</div>
          <span className="text-[11px] text-slate-500 block">From processed transactions</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Transactions Table */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold text-white">Recent Transactions</h2>
              <p className="text-xs text-slate-400">Your latest payment activities (Auto-updated live)</p>
            </div>
            <Link to="/user/transactions" className="text-xs text-emerald-400 hover:underline font-medium">
              View all
            </Link>
          </div>

          {recentTransactions.length === 0 ? (
            <EmptyState
              title="No transactions available."
              description="Make your first transaction to see activity recorded here."
            />
          ) : (
            <div className="overflow-x-auto rounded-lg border border-slate-800">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] font-semibold border-b border-slate-800">
                  <tr>
                    <th className="py-2.5 px-3">Transaction ID</th>
                    <th className="py-2.5 px-3">Merchant</th>
                    <th className="py-2.5 px-3">Amount</th>
                    <th className="py-2.5 px-3 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 bg-slate-900">
                  {recentTransactions.map((tx) => (
                    <tr
                      key={tx.id || tx.transactionId}
                      onClick={() => setSelectedTx(tx)}
                      tabIndex={0}
                      onKeyDown={(e) => e.key === 'Enter' && setSelectedTx(tx)}
                      className="hover:bg-slate-800/60 cursor-pointer transition-colors focus:outline-none focus:bg-slate-800"
                    >
                      <td className="py-2.5 px-3 font-mono font-medium text-slate-100">
                        {tx.transactionId}
                      </td>
                      <td className="py-2.5 px-3 font-medium text-slate-200">{tx.merchant}</td>
                      <td className="py-2.5 px-3 font-mono font-bold text-white">
                        {tx.currency || 'INR'} {Number(tx.amount).toLocaleString()}
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        <StatusBadge
                          status={tx.decision || tx.status}
                          riskScore={tx.riskScore}
                          fraudProbability={tx.fraudProbability}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Security Alerts Preview */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h2 className="text-sm font-semibold text-white flex items-center gap-2">
                <Bell className="w-4 h-4 text-emerald-400" />
                Security Alerts
              </h2>
              <Link to="/user/alerts" className="text-xs text-emerald-400 hover:underline font-medium">
                View all
              </Link>
            </div>

            {recentAlerts.length === 0 ? (
              <p className="text-xs text-slate-500 py-4 text-center">
                No recent security alerts for your account.
              </p>
            ) : (
              <div className="space-y-2.5">
                {recentAlerts.map((alt) => (
                  <div
                    key={alt.id}
                    className="p-3 rounded-xl bg-slate-950 border border-slate-800/80 space-y-1"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-amber-400 font-mono">
                        {alt.transactionId}
                      </span>
                      <span className="text-[10px] text-slate-500">
                        {new Date(alt.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-xs text-slate-300 font-medium">{alt.shortExplanation}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="pt-3 border-t border-slate-800">
            <Link
              to="/user/make-transaction"
              className="w-full py-2 px-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 transition-colors flex items-center justify-center gap-2 border border-slate-700"
            >
              Submit New Payment
            </Link>
          </div>
        </div>
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
