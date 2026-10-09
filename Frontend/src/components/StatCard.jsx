import React from 'react';

export default function StatCard({ title, value, variant = 'default' }) {
  const styles = {
    default: 'text-white',
    approved: 'text-emerald-400',
    review: 'text-amber-400',
    blocked: 'text-red-400'
  };

  const badgeBg = {
    default: 'bg-slate-800 border-slate-700',
    approved: 'bg-emerald-500/10 border-emerald-500/30',
    review: 'bg-amber-500/10 border-amber-500/30',
    blocked: 'bg-red-500/10 border-red-500/30'
  };

  return (
    <div className={`rounded-xl border ${badgeBg[variant] || badgeBg.default} bg-slate-900 p-4 transition-colors hover:border-slate-600`}>
      <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">{title}</p>
      <h3 className={`text-2xl font-bold mt-1 ${styles[variant] || styles.default}`}>{value}</h3>
    </div>
  );
}
