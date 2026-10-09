import React from 'react';
import { PieChart, BarChart3, AlertOctagon, ShieldCheck, HelpCircle } from 'lucide-react';

export default function AnalyticsCharts({ summary }) {
  const total = summary?.total_count || 0;
  const approved = summary?.approved_count || 0;
  const review = summary?.review_count || 0;
  const blocked = summary?.blocked_count || 0;

  const getPct = (val) => total > 0 ? ((val / total) * 100).toFixed(1) : 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Decision Distribution Bar Chart */}
      <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-5 backdrop-blur">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-white flex items-center gap-2">
            <PieChart className="w-4 h-4 text-cyan-400" />
            Decision Breakdown Distribution
          </h3>
          <span className="text-xs text-slate-400">Total: {total.toLocaleString()}</span>
        </div>

        <div className="space-y-4">
          {/* Approved Bar */}
          <div>
            <div className="flex justify-between text-xs mb-1.5">
              <span className="text-emerald-400 font-medium flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5" /> APPROVED
              </span>
              <span className="text-slate-300 font-mono">{approved} ({getPct(approved)}%)</span>
            </div>
            <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-500"
                style={{ width: `${getPct(approved)}%` }}
              ></div>
            </div>
          </div>

          {/* Review Bar */}
          <div>
            <div className="flex justify-between text-xs mb-1.5">
              <span className="text-amber-400 font-medium flex items-center gap-1.5">
                <HelpCircle className="w-3.5 h-3.5" /> MANUAL REVIEW
              </span>
              <span className="text-slate-300 font-mono">{review} ({getPct(review)}%)</span>
            </div>
            <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-amber-500 to-orange-400 rounded-full transition-all duration-500"
                style={{ width: `${getPct(review)}%` }}
              ></div>
            </div>
          </div>

          {/* Blocked Bar */}
          <div>
            <div className="flex justify-between text-xs mb-1.5">
              <span className="text-rose-400 font-medium flex items-center gap-1.5">
                <AlertOctagon className="w-3.5 h-3.5" /> BLOCKED FRAUD
              </span>
              <span className="text-slate-300 font-mono">{blocked} ({getPct(blocked)}%)</span>
            </div>
            <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-rose-500 to-red-600 rounded-full transition-all duration-500"
                style={{ width: `${getPct(blocked)}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      {/* Risk Engine Architecture Metrics */}
      <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-5 backdrop-blur flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-purple-400" />
              Hybrid Evaluation Formula
            </h3>
            <span className="text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
              Score Range: 0 - 100
            </span>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 font-mono text-xs text-slate-300 space-y-2">
            <div className="flex justify-between items-center text-cyan-300">
              <span>Risk Score = (ML Prob × 50) + (Rule Score × 0.5)</span>
            </div>
            <div className="text-slate-500 text-[11px] pt-1 border-t border-slate-800/80">
              • ML Model: Smile Logistic Regression ($V_1..V_{28}$, Amount)<br/>
              • Rule Engine: Redis Velocity, Amount, Device, Country, Merchant
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3 mt-4 text-center">
          <div className="p-2.5 rounded-xl bg-emerald-500/5 border border-emerald-500/10">
            <span className="text-[11px] text-slate-400 block">Low Risk</span>
            <span className="text-xs font-bold text-emerald-400">0 - 29</span>
          </div>
          <div className="p-2.5 rounded-xl bg-amber-500/5 border border-amber-500/10">
            <span className="text-[11px] text-slate-400 block">Medium Risk</span>
            <span className="text-xs font-bold text-amber-400">30 - 69</span>
          </div>
          <div className="p-2.5 rounded-xl bg-rose-500/5 border border-rose-500/10">
            <span className="text-[11px] text-slate-400 block">High Risk</span>
            <span className="text-xs font-bold text-rose-400">70 - 100</span>
          </div>
        </div>
      </div>
    </div>
  );
}
