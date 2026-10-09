import React, { useState, useEffect } from 'react';
import { fetchSystemConfig } from '../../services/api';
import { Sliders, AlertCircle, LockKeyhole } from 'lucide-react';

export default function SystemConfiguration() {
  const [formData, setFormData] = useState({
    mlFraudThreshold: 0.90,
    amountAnomalyMultiplier: 15,
    minUserHistory: 3,
    velocityThreshold: 5,
    velocityWindow: 60
  });

  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    async function loadConfig() {
      setLoading(true);
      try {
        const config = await fetchSystemConfig();
        setFormData(config);
      } catch (e) {
        setErrorMessage(e.message);
      } finally {
        setLoading(false);
      }
    }
    loadConfig();
  }, []);

  if (loading) {
    return (
      <div className="py-12 text-center text-slate-400 text-xs">
        Loading system configuration parameters...
      </div>
    );
  }
  if (errorMessage) {
    return (
      <div role="alert" className="rounded-lg border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-300">
        Unable to load active fraud-engine configuration: {errorMessage}
      </div>
    );
  }

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h1 className="text-xl font-bold text-white flex items-center gap-2">
          <Sliders className="w-5 h-5 text-emerald-400" />
          System Configuration
        </h1>
        <p className="text-xs text-slate-400">
        Active fraud-engine thresholds. Editing is unavailable because these values are currently compiled into the processing services.
        </p>
      </div>

      <div className="bg-[#102438] border border-[#29445D] rounded-xl p-6 space-y-6">
        <div className="border-b border-[#29445D] pb-3">
          <h2 className="text-sm font-semibold text-white">Detection Engine Parameters</h2>
          <p className="text-xs text-slate-400">Current parameters reported for the fraud engine.</p>
        </div>

        {errorMessage && (
          <div className="flex items-center gap-2 p-3.5 rounded-lg bg-[#FF5C70]/10 border border-[#FF5C70]/30 text-[#FF5C70] text-xs font-semibold">
            <AlertCircle className="w-4 h-4 text-[#FF5C70] shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        <div className="mb-4 flex items-center gap-2 rounded-lg border border-sky-700/40 bg-sky-500/5 px-3 py-2 text-xs text-sky-200">
          <LockKeyhole className="h-4 w-4 shrink-0 text-sky-300" />
          <span>Read-only: configuration is not persisted by the fraud engine yet.</span>
        </div>
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* ML Fraud Threshold */}
            <div>
              <label htmlFor="cfg-ml-thresh" className="block text-xs font-semibold text-slate-300 mb-1">
                ML Fraud Threshold
              </label>
              <input
                id="cfg-ml-thresh"
                type="number"
                step="0.01"
                min="0"
                max="1"
                required
                name="mlFraudThreshold"
                value={formData.mlFraudThreshold}
                readOnly
                className="w-full bg-[#0D2033] border border-[#29445D] rounded-lg px-3.5 py-2 text-xs text-[#F4F7FB] font-mono focus:outline-none focus:border-[#19C99A]"
              />
              <span className="text-[11px] text-slate-500 block mt-1">
                Smile Logistic Regression probability trigger (default: 0.90)
              </span>
            </div>

            {/* Amount Anomaly Multiplier */}
            <div>
              <label htmlFor="cfg-amount-mult" className="block text-xs font-semibold text-slate-300 mb-1">
                Amount Anomaly Multiplier
              </label>
              <input
                id="cfg-amount-mult"
                type="number"
                step="1"
                min="1"
                required
                name="amountAnomalyMultiplier"
                value={formData.amountAnomalyMultiplier}
                readOnly
                className="w-full bg-[#0D2033] border border-[#29445D] rounded-lg px-3.5 py-2 text-xs text-[#F4F7FB] font-mono focus:outline-none focus:border-[#19C99A]"
              />
              <span className="text-[11px] text-slate-500 block mt-1">
                Multiplier over top 3 approved transactions baseline (default: 15×)
              </span>
            </div>

            {/* Minimum User History */}
            <div>
              <label htmlFor="cfg-min-hist" className="block text-xs font-semibold text-slate-300 mb-1">
                Minimum Transaction History
              </label>
              <input
                id="cfg-min-hist"
                type="number"
                step="1"
                min="1"
                required
                name="minUserHistory"
                value={formData.minUserHistory}
                readOnly
                className="w-full bg-[#0D2033] border border-[#29445D] rounded-lg px-3.5 py-2 text-xs text-[#F4F7FB] font-mono focus:outline-none focus:border-[#19C99A]"
              />
              <span className="text-[11px] text-slate-500 block mt-1">
                Approved transactions required to establish baseline (default: 3)
              </span>
            </div>

            {/* Velocity Transaction Limit */}
            <div>
              <label htmlFor="cfg-vel-limit" className="block text-xs font-semibold text-slate-300 mb-1">
                Velocity Transaction Limit
              </label>
              <input
                id="cfg-vel-limit"
                type="number"
                step="1"
                min="1"
                required
                name="velocityThreshold"
                value={formData.velocityThreshold}
                readOnly
                className="w-full bg-[#0D2033] border border-[#29445D] rounded-lg px-3.5 py-2 text-xs text-[#F4F7FB] font-mono focus:outline-none focus:border-[#19C99A]"
              />
              <span className="text-[11px] text-slate-500 block mt-1">
                Max allowed payments within velocity time window (default: 5)
              </span>
            </div>

            {/* Velocity Time Window */}
            <div className="sm:col-span-2">
              <label htmlFor="cfg-vel-win" className="block text-xs font-semibold text-slate-300 mb-1">
                Velocity Time Window
              </label>
              <div className="flex items-center gap-2">
                <input
                  id="cfg-vel-win"
                  type="number"
                  step="1"
                  min="1"
                  required
                  name="velocityWindow"
                  value={formData.velocityWindow}
                  readOnly
                  className="w-full bg-[#0D2033] border border-[#29445D] rounded-lg px-3.5 py-2 text-xs text-[#F4F7FB] font-mono focus:outline-none focus:border-[#19C99A]"
                />
                <span className="text-xs text-slate-400 font-medium shrink-0">seconds</span>
              </div>
              <span className="text-[11px] text-slate-500 block mt-1">
                Redis fixed sliding window duration in seconds (default: 60 seconds)
              </span>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
