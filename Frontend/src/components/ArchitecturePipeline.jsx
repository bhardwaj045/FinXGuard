import React from 'react';

export default function ArchitecturePipeline() {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-sm font-semibold text-white mb-1">
            Risk Score Calculation
          </h3>
          <p className="text-xs text-slate-400">
            We first check Redis rules and then use Logistic Regression to calculate fraud probability.
          </p>
          <div className="mt-3 inline-block p-3 bg-slate-950 border border-slate-800 rounded-lg text-xs font-mono text-slate-300">
            Risk Score = (Logistic Regression Prob × 50) + (Rule Score × 0.5)
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2 text-center text-xs sm:w-80">
          <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
            <span className="text-slate-400 block text-[11px]">Approved</span>
            <span className="font-semibold text-emerald-400">0 - 29</span>
          </div>
          <div className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/20">
            <span className="text-slate-400 block text-[11px]">Review</span>
            <span className="font-semibold text-amber-400">30 - 69</span>
          </div>
          <div className="p-2 rounded-lg bg-red-500/10 border border-red-500/20">
            <span className="text-slate-400 block text-[11px]">Blocked</span>
            <span className="font-semibold text-red-400">70 - 100</span>
          </div>
        </div>
      </div>
    </div>
  );
}
