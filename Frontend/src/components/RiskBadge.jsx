import React from 'react';

export default function RiskBadge({ score }) {
  if (score === null || score === undefined) {
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded text-xs font-mono font-bold border bg-slate-800 text-slate-400 border-slate-700">
        N/A
      </span>
    );
  }

  let colorClasses = 'bg-slate-800 text-slate-300 border-slate-700';
  if (score >= 70) {
    colorClasses = 'bg-red-500/10 text-red-400 border-red-500/30';
  } else if (score >= 30) {
    colorClasses = 'bg-amber-500/10 text-amber-400 border-amber-500/30';
  } else {
    colorClasses = 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
  }

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded text-xs font-mono font-bold border ${colorClasses}`}
      aria-label={`Risk Score: ${score} out of 100`}
    >
      {score} / 100
    </span>
  );
}
