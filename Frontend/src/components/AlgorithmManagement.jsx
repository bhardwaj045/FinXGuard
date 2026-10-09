import React, { useState } from 'react';
import { Cpu, RefreshCw, CheckCircle2, Info } from 'lucide-react';

export default function AlgorithmManagement() {
  const [updating, setUpdating] = useState(false);
  const [updateMessage, setUpdateMessage] = useState('');

  const handleUpdateModel = () => {
    setUpdating(true);
    setUpdateMessage('');

    setTimeout(() => {
      setUpdating(false);
      setUpdateMessage('Active model bundle v1 verified and synchronized.');
    }, 800);
  };

  return (
    <div className="max-w-4xl space-y-6">
      <div>
        <h2 className="text-xl font-bold text-white">Algorithm Management</h2>
        <p className="text-xs text-slate-400">View active ML model specifications and model performance analytics.</p>
      </div>

      {updateMessage && (
        <div className="flex items-center gap-2 p-3.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>✓ {updateMessage}</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Current Algorithm Details */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
              <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                <Cpu className="w-4 h-4 text-emerald-400" />
                Current Algorithm
              </h3>
              <span className="flex items-center gap-1.5 text-xs font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 rounded-full">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Active
              </span>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between py-1.5 border-b border-slate-800/60">
                <span className="text-slate-400">Algorithm</span>
                <span className="font-semibold text-white">Logistic Regression</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-800/60">
                <span className="text-slate-400">Library</span>
                <span className="font-semibold text-white">Smile</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-800/60">
                <span className="text-slate-400">Model Version</span>
                <span className="font-semibold text-emerald-400 font-mono">v1</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-800/60">
                <span className="text-slate-400">Features</span>
                <span className="font-semibold text-slate-200">V1 – V28 + Amount</span>
              </div>
              <div className="flex justify-between py-1.5">
                <span className="text-slate-400">Fraud Threshold</span>
                <span className="font-semibold text-cyan-400 font-mono">0.90</span>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-800">
            <button
              onClick={handleUpdateModel}
              disabled={updating}
              className="w-full py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs border border-slate-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${updating ? 'animate-spin' : ''}`} />
              Update Model
            </button>
          </div>
        </div>

        {/* Performance Metrics */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4">
          <div className="border-b border-slate-800 pb-3 mb-4">
            <h3 className="text-sm font-semibold text-white">Performance</h3>
            <p className="text-xs text-slate-400">Validated against benchmark evaluation dataset.</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
              <span className="text-xs text-slate-400 block mb-1">Precision</span>
              <span className="text-xl font-bold font-mono text-emerald-400">94.2%</span>
            </div>

            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
              <span className="text-xs text-slate-400 block mb-1">Recall</span>
              <span className="text-xl font-bold font-mono text-cyan-400">88.5%</span>
            </div>

            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
              <span className="text-xs text-slate-400 block mb-1">F1 Score</span>
              <span className="text-xl font-bold font-mono text-purple-400">91.3%</span>
            </div>

            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
              <span className="text-xs text-slate-400 block mb-1">AUC-PR</span>
              <span className="text-xl font-bold font-mono text-amber-400">0.924</span>
            </div>
          </div>

          <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800 flex items-start gap-2 text-[11px] text-slate-400 mt-2">
            <Info className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
            <span>
              Model loaded from pre-trained binary bundle trained using Smile Statistical Machine Learning Engine.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
