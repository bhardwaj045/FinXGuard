import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import { fetchTransactions } from '../../services/api';
import { Search, Filter, Calendar, ChevronLeft, ChevronRight } from 'lucide-react';
import StatusBadge from '../../components/StatusBadge';
import RiskBadge from '../../components/RiskBadge';
import LoadingState from '../../components/LoadingState';
import EmptyState from '../../components/EmptyState';
import TransactionDetailModal from '../../components/TransactionDetailModal';

export default function MyTransactions() {
  const { currentUser } = useAuth();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [dateFilter, setDateFilter] = useState('ALL');
  const [sortOrder, setSortOrder] = useState('NEWEST');

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const [selectedTx, setSelectedTx] = useState(null);

  const loadData = useCallback(async (isInitial = false) => {
    if (isInitial) setLoading(true);
    try {
      const userIdentifier = currentUser.id || currentUser.email;
      const data = await fetchTransactions(userIdentifier);
      setTransactions(data);
      setError('');
    } catch (err) {
      setError(err.message);
    } finally {
      if (isInitial) setLoading(false);
    }
  }, [currentUser]);

  useEffect(() => {
    loadData(true);
    // Dynamic polling interval every 3 seconds
    const interval = setInterval(() => loadData(false), 3000);
    return () => clearInterval(interval);
  }, [loadData]);

  // Filter transactions logic
  const filtered = transactions.filter((tx) => {
    if (statusFilter !== 'ALL' && tx.decision !== statusFilter) {
      return false;
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTxId = (tx.transactionId || '').toLowerCase().includes(q);
      const matchMerchant = (tx.merchant || '').toLowerCase().includes(q);
      const matchCity = (tx.city || '').toLowerCase().includes(q);
      if (!matchTxId && !matchMerchant && !matchCity) return false;
    }

    if (dateFilter !== 'ALL') {
      const txTime = tx.createdAt ? new Date(tx.createdAt).getTime() : 0;
      const now = Date.now();
      if (dateFilter === 'TODAY' && now - txTime > 86400000) return false;
      if (dateFilter === 'THIS_WEEK' && now - txTime > 86400000 * 7) return false;
      if (dateFilter === 'THIS_MONTH' && now - txTime > 86400000 * 30) return false;
    }

    return true;
  });

  const totalPages = Math.ceil(filtered.length / itemsPerPage) || 1;
  const sorted = [...filtered].sort((a, b) => {
    if (sortOrder === 'OLDEST') {
      return new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime();
    }
    if (sortOrder === 'AMOUNT_HIGH') return Number(b.amount || 0) - Number(a.amount || 0);
    if (sortOrder === 'RISK_HIGH') return Number(b.riskScore || 0) - Number(a.riskScore || 0);
    return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
  });
  const paginatedItems = sorted.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  useEffect(() => {
    setCurrentPage((page) => Math.min(page, totalPages));
  }, [totalPages]);

  if (loading) {
    return <LoadingState message="Loading your transaction history..." />;
  }
  if (error) {
    return <div role="alert" className="rounded-lg border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-300">{error}</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-white">My Transactions</h1>
        <p className="text-xs text-slate-400">Complete audit log of your card payment transactions (Live dynamic updates).</p>
      </div>

      {/* Filter Control Bar */}
      <div className="bg-[#102438] border border-[#29445D] rounded-xl p-4 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-[#71869C] absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="Search by Transaction ID, Merchant, City..."
            className="w-full bg-[#0D2033] border border-[#29445D] rounded-lg pl-9 pr-3.5 py-2 text-xs text-[#F4F7FB] placeholder-[#71869C] focus:outline-none focus:border-[#19C99A] focus:ring-1 focus:ring-[#19C99A]"
          />
        </div>

        {/* Dropdown Filters */}
        <div className="flex flex-wrap items-center gap-3 text-xs">
          <div className="flex items-center gap-1.5">
            <Filter className="w-3.5 h-3.5 text-[#9FB0C3]" />
            <span className="text-[#9FB0C3] font-medium">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="bg-[#0D2033] border border-[#29445D] text-[#F4F7FB] rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-[#19C99A]"
            >
              <option value="ALL">All Decisions</option>
              <option value="APPROVED">APPROVED</option>
              <option value="REVIEW">REVIEW</option>
              <option value="BLOCKED">BLOCKED</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-[#9FB0C3]" />
            <span className="text-[#9FB0C3] font-medium">Timeframe:</span>
            <select
              value={dateFilter}
              onChange={(e) => {
                setDateFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="bg-[#0D2033] border border-[#29445D] text-[#F4F7FB] rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-[#19C99A]"
            >
              <option value="ALL">All Time</option>
              <option value="TODAY">Last 24 Hours</option>
              <option value="THIS_WEEK">Past 7 Days</option>
              <option value="THIS_MONTH">Past 30 Days</option>
            </select>
          </div>
          <div className="flex items-center gap-1.5">
            <label htmlFor="transaction-sort" className="text-[#9FB0C3] font-medium">Sort:</label>
            <select
              id="transaction-sort"
              value={sortOrder}
              onChange={(e) => {
                setSortOrder(e.target.value);
                setCurrentPage(1);
              }}
              className="bg-[#0D2033] border border-[#29445D] text-[#F4F7FB] rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-[#19C99A]"
            >
              <option value="NEWEST">Newest first</option>
              <option value="OLDEST">Oldest first</option>
              <option value="AMOUNT_HIGH">Amount: high to low</option>
              <option value="RISK_HIGH">Risk: high to low</option>
            </select>
          </div>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
        {filtered.length === 0 ? (
          <EmptyState
            title="No matching transactions found."
            description="Try resetting your filters or search terms."
          />
        ) : (
          <>
            <div className="overflow-x-auto rounded-lg border border-slate-800">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] font-semibold border-b border-slate-800">
                  <tr>
                    <th className="py-3 px-4">Transaction ID</th>
                    <th className="py-3 px-4">Date / Time</th>
                    <th className="py-3 px-4">Merchant</th>
                    <th className="py-3 px-4">Amount</th>
                    <th className="py-3 px-4">Category</th>
                    <th className="py-3 px-4">Country</th>
                    <th className="py-3 px-4">City</th>
                    <th className="py-3 px-4">Device</th>
                    <th className="py-3 px-4">Channel</th>
                    <th className="py-3 px-4 text-center">Risk Level</th>
                    <th className="py-3 px-4 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 bg-slate-900">
                  {paginatedItems.map((tx) => (
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
                      <td className="py-3 px-4 text-slate-400">
                        {tx.createdAt ? new Date(tx.createdAt).toLocaleString() : 'Unavailable'}
                      </td>
                      <td className="py-3 px-4 font-semibold text-slate-200">{tx.merchant}</td>
                      <td className="py-3 px-4 font-mono font-bold text-white">
                        {tx.currency || 'INR'} {Number(tx.amount).toLocaleString()}
                      </td>
                      <td className="py-3 px-4 text-slate-300">{tx.merchantCategory || 'Unavailable'}</td>
                      <td className="py-3 px-4 text-slate-300 font-mono">{tx.country || 'IN'}</td>
                      <td className="py-3 px-4 text-slate-300">{tx.city || 'Unavailable'}</td>
                      <td className="py-3 px-4 text-slate-300 font-mono">{tx.device || 'Unavailable'}</td>
                      <td className="py-3 px-4 text-slate-300">{tx.channel || 'Unavailable'}</td>
                      <td className="py-3 px-4 text-center">
                        <RiskBadge score={tx.riskScore ?? 0} />
                      </td>
                      <td className="py-3 px-4 text-center">
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

            {/* Pagination Controls */}
            <div className="flex items-center justify-between pt-2 text-xs text-slate-400">
              <div>
                Showing <span className="font-semibold text-slate-200">{paginatedItems.length}</span> of{' '}
                <span className="font-semibold text-slate-200">{filtered.length}</span> results
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="p-1.5 rounded-lg bg-slate-950 border border-slate-800 hover:bg-slate-800 disabled:opacity-40 transition-colors focus:outline-none"
                  aria-label="Previous Page"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="font-mono text-slate-300">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="p-1.5 rounded-lg bg-slate-950 border border-slate-800 hover:bg-slate-800 disabled:opacity-40 transition-colors focus:outline-none"
                  aria-label="Next Page"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </>
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
