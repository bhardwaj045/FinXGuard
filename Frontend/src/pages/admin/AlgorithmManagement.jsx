import React, { useEffect, useState } from 'react';
import { Cpu, Info, CheckCircle2 } from 'lucide-react';
import { fetchAlgorithmMetadata } from '../../services/api';
import LoadingState from '../../components/LoadingState';

export default function AlgorithmManagement() {
  const [metadata, setMetadata] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchAlgorithmMetadata()
      .then(setMetadata)
      .catch((requestError) => setError(requestError.message));
  }, []);

  if (error) {
    return <div role="alert" className="rounded-lg border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-300">{error}</div>;
  }
  if (!metadata) return <LoadingState message="Loading model metadata..." />;

  const metrics = [
    ['Precision', metadata.precision],
    ['Recall', metadata.recall],
    ['F1 Score', metadata.f1],
    ['AUC-PR', metadata.aucPr]
  ];

  return (
    <div className="max-w-4xl space-y-6">
      <div>
        <h1 className="text-xl font-bold text-white flex items-center gap-2">
          <Cpu className="w-5 h-5 text-emerald-400" />
          Algorithm Management
        </h1>
        <p className="text-xs text-slate-400">
        Model metadata reported by the backend. Evaluation metrics are shown only when measured values are available.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Model Specs */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h2 className="text-sm font-semibold text-white">Active Detection Model</h2>
            <span className="flex items-center gap-1.5 text-xs font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 rounded-full">
              <CheckCircle2 className="w-3.5 h-3.5" />
              {metadata.modelVersion}
            </span>
          </div>

          <div className="space-y-3 text-xs">
            <div className="flex justify-between py-2 border-b border-slate-800/60">
              <span className="text-slate-400 font-medium">Algorithm</span>
              <span className="font-semibold text-white font-mono">{metadata.algorithm}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-slate-800/60">
              <span className="text-slate-400 font-medium">Machine Learning Library</span>
              <span className="font-semibold text-white font-mono">{metadata.library}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-slate-800/60">
              <span className="text-slate-400 font-medium">Features</span>
              <span className="font-semibold text-slate-200 font-mono">{metadata.kaggleFeatures}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-slate-800/60">
              <span className="text-slate-400 font-medium">Model Bundle Version</span>
              <span className="font-semibold text-emerald-400 font-mono">{metadata.modelVersion}</span>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-slate-400 font-medium">Resolution Strategy</span>
              <span className="font-semibold text-slate-300">Application fraud model</span>
            </div>
          </div>
        </div>

        {/* Evaluation Metrics */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4">
          <div className="border-b border-slate-800 pb-3">
            <h2 className="text-sm font-semibold text-white">Model Evaluation Metrics</h2>
            <p className="text-xs text-slate-400">Evaluation results are displayed only when measured values are published by the backend.</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {metrics.map(([label, value]) => (
              <div key={label} className="rounded-xl border border-slate-800 bg-slate-950 p-4">
                <span className="mb-1 block text-xs text-slate-400">{label}</span>
                <span className="font-mono text-xl font-bold text-slate-300">
                  {value == null ? 'Not available' : value}
                </span>
                {value == null && <span className="mt-1 block text-[10px] text-slate-500">No measured value is published by the backend.</span>}
              </div>
            ))}
          </div>

          <div className="border-t border-slate-800 pt-3">
            <p className="mb-2 text-xs font-semibold text-slate-400">Application model features</p>
            <div className="flex flex-wrap gap-2">
              {metadata.applicationFeatures.map((feature) => (
                <span key={feature} className="rounded-lg border border-slate-800 bg-slate-950 px-2.5 py-1 text-[11px] text-slate-300">{feature}</span>
              ))}
            </div>
          </div>

          <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800 flex items-start gap-2 text-[11px] text-slate-400">
            <Info className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
            <span>
              No training control is exposed here because the backend does not provide a model-training endpoint.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
