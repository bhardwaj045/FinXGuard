import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { fetchUserAlerts } from '../../services/api';
import { Bell } from 'lucide-react';
import LoadingState from '../../components/LoadingState';
import EmptyState from '../../components/EmptyState';

export default function UserAlerts() {
  const { currentUser } = useAuth();
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadAlerts() {
      setLoading(true);
      try {
        const data = await fetchUserAlerts();
        setAlerts(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    loadAlerts();
  }, [currentUser]);

  if (loading) {
    return <LoadingState message="Loading security notifications..." />;
  }

  return (
    <div className="max-w-4xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <Bell className="w-5 h-5 text-emerald-400" />
            Security Alerts
          </h1>
          <p className="text-xs text-slate-400">
            Real-time security alerts regarding transaction verifications and fraud interventions.
          </p>
        </div>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4">
        {error ? (
          <div role="alert" className="rounded-lg border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-300">{error}</div>
        ) : alerts.length === 0 ? (
          <EmptyState
            title="No suspicious activity detected."
            description="All your past transactions are approved with no security flags."
          />
        ) : (
          <div className="space-y-3">
            {alerts.map((alt) => (
              <div
                key={alt.id}
                className="space-y-3 rounded-xl border border-amber-500/30 bg-slate-950 p-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded text-[10px] font-bold font-mono uppercase bg-amber-500/10 text-amber-400 border border-amber-500/20">
                      {alt.decision}
                    </span>
                    <span className="text-xs font-mono text-slate-400">
                      Tx: <strong className="text-white">{alt.transactionId}</strong>
                    </span>
                  </div>

                  <div>
                    <span className="text-[11px] text-slate-500">
                      {alt.createdAt ? new Date(alt.createdAt).toLocaleString() : 'Timestamp unavailable'}
                    </span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-x-5 gap-y-1 text-xs text-slate-300">
                  <span>Amount: {alt.currency} {Number(alt.amount).toLocaleString()}</span>
                  <span>Risk score: {alt.riskScore ?? 'Unavailable'}</span>
                </div>
                <p className="text-xs font-medium leading-relaxed text-slate-200">
                  {alt.shortExplanation || 'No decision reason was included by the backend.'}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
