import React, { useState } from 'react';
import { submitTransaction } from '../../services/api';
import { Send, Loader2, CheckCircle2, AlertOctagon, AlertTriangle, ShieldCheck, HelpCircle } from 'lucide-react';
import StatusBadge from '../../components/StatusBadge';
import RiskBadge from '../../components/RiskBadge';

export default function MakeTransaction() {
  const [amount, setAmount] = useState('');
  const [currency, setCurrency] = useState('INR');
  const [merchant, setMerchant] = useState('');
  const [merchantCategory, setMerchantCategory] = useState('');
  const [country, setCountry] = useState('');
  const [city, setCity] = useState('');
  const [device, setDevice] = useState('');
  const [channel, setChannel] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [evalResult, setEvalResult] = useState(null);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setEvalResult(null);
    setError('');

    const payload = {
      amount: parseFloat(amount) || 0,
      currency,
      merchant,
      merchantCategory,
      country,
      city,
      device,
      channel
    };

    try {
      const result = await submitTransaction(payload);
      setEvalResult(result);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h1 className="text-xl font-bold text-white">Make Transaction</h1>
        <p className="text-xs text-slate-400">
          Submit a new financial transaction for real-time payment authorization and fraud detection.
        </p>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Amount */}
            <div>
              <label htmlFor="tx-amount" className="block text-xs font-semibold text-slate-300 mb-1">
                Amount
              </label>
              <div className="relative">
                <input
                  id="tx-amount"
                  type="number"
                  step="0.01"
                  min="1"
                  required
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="1500"
                  className="w-full bg-[#0D2033] border border-[#29445D] rounded-lg px-3.5 py-2 text-xs text-[#F4F7FB] placeholder-[#71869C] font-mono focus:outline-none focus:border-[#19C99A] focus:ring-1 focus:ring-[#19C99A]"
                />
              </div>
            </div>

            {/* Currency */}
            <div>
              <label htmlFor="tx-currency" className="block text-xs font-semibold text-slate-300 mb-1">
                Currency
              </label>
              <select
                id="tx-currency"
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="w-full bg-[#0D2033] border border-[#29445D] rounded-lg px-3.5 py-2 text-xs text-[#F4F7FB] focus:outline-none focus:border-[#19C99A] focus:ring-1 focus:ring-[#19C99A]"
              >
                <option value="INR">INR (₹)</option>
                <option value="USD">USD ($)</option>
                <option value="EUR">EUR (€)</option>
                <option value="GBP">GBP (£)</option>
              </select>
            </div>

            {/* Merchant */}
            <div>
              <label htmlFor="tx-merchant" className="block text-xs font-semibold text-slate-300 mb-1">
                Merchant
              </label>
              <input
                id="tx-merchant"
                type="text"
                required
                value={merchant}
                onChange={(e) => setMerchant(e.target.value)}
                placeholder="Amazon India"
                className="w-full bg-[#0D2033] border border-[#29445D] rounded-lg px-3.5 py-2 text-xs text-[#F4F7FB] placeholder-[#71869C] focus:outline-none focus:border-[#19C99A] focus:ring-1 focus:ring-[#19C99A]"
              />
            </div>

            {/* Merchant Category */}
            <div>
              <label htmlFor="tx-category" className="block text-xs font-semibold text-slate-300 mb-1">
                Merchant Category
              </label>
              <select
                id="tx-category"
                required
                value={merchantCategory}
                onChange={(e) => setMerchantCategory(e.target.value)}
                className="w-full bg-[#0D2033] border border-[#29445D] rounded-lg px-3.5 py-2 text-xs text-[#F4F7FB] focus:outline-none focus:border-[#19C99A] focus:ring-1 focus:ring-[#19C99A]"
              >
                <option value="" disabled>Select a category</option>
                <option value="Retail">Retail</option>
                <option value="Grocery">Grocery</option>
                <option value="Dining">Dining & Coffee</option>
                <option value="Travel">Travel & Lodging</option>
                <option value="Electronics">Electronics</option>
                <option value="LUXURY_JEWELRY">Luxury Jewelry</option>
                <option value="WIRE_TRANSFER">Wire Transfer</option>
                <option value="GAMBLING">Gambling / Casino</option>
                <option value="CRYPTO">Crypto Exchange</option>
              </select>
            </div>

            {/* Country */}
            <div>
              <label htmlFor="tx-country" className="block text-xs font-semibold text-slate-300 mb-1">
                Country
              </label>
              <input
                id="tx-country"
                type="text"
                required
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                placeholder="IN"
                className="w-full bg-[#0D2033] border border-[#29445D] rounded-lg px-3.5 py-2 text-xs text-[#F4F7FB] placeholder-[#71869C] focus:outline-none focus:border-[#19C99A] focus:ring-1 focus:ring-[#19C99A]"
              />
            </div>

            {/* City */}
            <div>
              <label htmlFor="tx-city" className="block text-xs font-semibold text-slate-300 mb-1">
                City
              </label>
              <input
                id="tx-city"
                type="text"
                required
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="Mumbai"
                className="w-full bg-[#0D2033] border border-[#29445D] rounded-lg px-3.5 py-2 text-xs text-[#F4F7FB] placeholder-[#71869C] focus:outline-none focus:border-[#19C99A] focus:ring-1 focus:ring-[#19C99A]"
              />
            </div>

            {/* Device */}
            <div>
              <label htmlFor="tx-device" className="block text-xs font-semibold text-slate-300 mb-1">
                Device Identifier
              </label>
              <input
                id="tx-device"
                type="text"
                required
                value={device}
                onChange={(e) => setDevice(e.target.value)}
                placeholder="DEV001"
                className="w-full bg-[#0D2033] border border-[#29445D] rounded-lg px-3.5 py-2 text-xs text-[#F4F7FB] placeholder-[#71869C] font-mono focus:outline-none focus:border-[#19C99A] focus:ring-1 focus:ring-[#19C99A]"
              />
            </div>

            {/* Channel */}
            <div>
              <label htmlFor="tx-channel" className="block text-xs font-semibold text-slate-300 mb-1">
                Channel
              </label>
              <select
                id="tx-channel"
                required
                value={channel}
                onChange={(e) => setChannel(e.target.value)}
                className="w-full bg-[#0D2033] border border-[#29445D] rounded-lg px-3.5 py-2 text-xs text-[#F4F7FB] focus:outline-none focus:border-[#19C99A] focus:ring-1 focus:ring-[#19C99A]"
              >
                <option value="" disabled>Select a channel</option>
                <option value="MOBILE">Mobile App</option>
                <option value="POS">In-Person (POS)</option>
                <option value="WEB">Web Browser</option>
              </select>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-800 flex justify-end">
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition-colors flex items-center gap-2 disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              <span>Submit Transaction</span>
            </button>
          </div>
        </form>

        {error && <div role="alert" className="rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-300">{error}</div>}

        {/* Real-time Authorization Result Display */}
        {evalResult && (
          <div
            className={`p-5 rounded-xl border space-y-3 ${
              evalResult.decision === 'APPROVED'
                ? 'bg-emerald-500/10 border-emerald-500/30'
                : evalResult.decision === 'REVIEW'
                ? 'bg-amber-500/10 border-amber-500/30'
                : 'bg-red-500/10 border-red-500/30'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {evalResult.decision === 'APPROVED' && <CheckCircle2 className="w-5 h-5 text-emerald-400" />}
                {evalResult.decision === 'REVIEW' && <AlertTriangle className="w-5 h-5 text-amber-400" />}
                {evalResult.decision === 'BLOCKED' && <AlertOctagon className="w-5 h-5 text-red-400" />}
                <span className="font-bold text-sm text-white">
                  Authorization Decision: {evalResult.decision}
                </span>
              </div>
              <StatusBadge status={evalResult.decision} />
            </div>

            <div className="text-xs text-slate-300 grid grid-cols-2 sm:grid-cols-3 gap-2 pt-1 border-t border-slate-800/60 font-mono">
              <div>
                <span className="text-slate-500 block">Transaction ID:</span>
                <span className="font-bold text-white break-all">{evalResult.transactionId}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Amount:</span>
                <span className="font-bold text-white">
                  {evalResult.currency} {Number(evalResult.amount).toLocaleString()}
                </span>
              </div>
              <div>
                <span className="text-slate-500 block">Status / Decision:</span>
                <span className="font-bold text-white">{evalResult.decision || evalResult.status}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Risk Score:</span>
                <span className="font-bold text-white">{evalResult.riskScore != null ? `${evalResult.riskScore} / 100` : '—'}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Fraud Probability:</span>
                <span className="font-bold text-white">
                  {evalResult.fraudProbability != null ? `${Math.round(evalResult.fraudProbability * 100)}%` : '—'}
                </span>
              </div>
              <div>
                <span className="text-slate-500 block">Date / Time:</span>
                <span className="text-slate-300">
                  {evalResult.createdAt ? new Date(evalResult.createdAt).toLocaleString() : 'Just now'}
                </span>
              </div>
            </div>

            {/* Display detection reasons */}
            <div className="pt-2 space-y-1">
              <span className="text-xs font-semibold text-slate-200 block">
                Security Explanations:
              </span>
              {evalResult.decisionReasons && evalResult.decisionReasons.length > 0 ? (
                <ul className="space-y-1">
                  {evalResult.decisionReasons.map((reason, idx) => (
                    <li key={idx} className="text-xs text-slate-200 flex items-start gap-2">
                      <span className="text-amber-400 font-bold">•</span>
                      <span>{reason}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-xs text-emerald-400 font-medium">No fraud indicators detected.</p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
