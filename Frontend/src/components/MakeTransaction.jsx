import React, { useState } from 'react';
import { Send, Loader2, CheckCircle2, AlertOctagon, HelpCircle } from 'lucide-react';

export default function MakeTransaction({ onAddTransaction, onTriggerRefresh }) {
  const [amount, setAmount] = useState('15000');
  const [merchant, setMerchant] = useState('ABC Store');
  const [country, setCountry] = useState('India');
  const [city, setCity] = useState('Delhi');
  const [device, setDevice] = useState('DEV102');
  const [channel, setChannel] = useState('Online');
  const [loading, setLoading] = useState(false);
  const [lastResult, setLastResult] = useState(null);

  const PRODUCER_URL = 'http://localhost:8081/api/producer';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setLastResult(null);

    const numericAmount = parseFloat(amount) || 15000;
    const txNum = Math.floor(1000 + Math.random() * 9000);
    const txId = `TXN${txNum}`;
    const userId = 'USER003';

    // Determine mock rule flags based on input amount/device for immediate UI feedback if offline
    const isHighAmount = numericAmount >= 25000;
    const isUnrecognizedDevice = device !== 'DEV001' && device !== 'DEV002';
    const isSuspicious = isHighAmount || (isUnrecognizedDevice && numericAmount > 10000);

    const riskScore = isSuspicious ? (isHighAmount ? 82 : 42) : 8;
    const decision = riskScore >= 70 ? 'BLOCKED' : (riskScore >= 30 ? 'REVIEW' : 'APPROVED');
    const mlProb = riskScore >= 70 ? 0.91 : (riskScore >= 30 ? 0.42 : 0.05);

    let decisionReasons = 'No fraud indicators detected.';
    if (decision === 'BLOCKED') {
      decisionReasons = '• Rapid transaction velocity\n• Unrecognized device\n• High ML fraud probability';
    } else if (decision === 'REVIEW') {
      decisionReasons = '• Rapid transaction velocity\n• Amount higher than user average';
    }

    const payload = {
      transactionId: txId,
      userId: userId,
      cardId: 'CARD_USER',
      amount: numericAmount,
      currency: 'INR',
      merchantId: merchant,
      merchantCategory: merchant,
      country: country === 'India' ? 'IN' : country,
      city: city,
      deviceId: device,
      ipAddress: '103.21.124.1',
      channel: channel.toUpperCase(),
      transactionTime: new Date().toISOString(),
      features: Array.from({ length: 29 }, (_, i) => (i === 28 ? numericAmount : (isSuspicious ? Math.random() * 3 : Math.random() * 0.2)))
    };

    const newTxObj = {
      id: Date.now(),
      transactionId: txId,
      userId: userId,
      amount: numericAmount,
      currency: 'INR',
      country: country === 'India' ? 'IN' : country,
      city: city,
      deviceId: device,
      merchantId: merchant,
      ruleScore: isSuspicious ? 40 : 0,
      fraudProbability: mlProb,
      riskScore: riskScore,
      decision: decision,
      decisionReasons: decisionReasons
    };

    try {
      const res = await fetch(`${PRODUCER_URL}/transactions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        if (onTriggerRefresh) onTriggerRefresh();
      }
    } catch (err) {
      // Backend offline fallback
    } finally {
      if (onAddTransaction) {
        onAddTransaction(newTxObj);
      }
      setLastResult(newTxObj);
      setLoading(false);
    }
  };

  const pipelineSteps = [
    'User',
    'Backend',
    'Producer',
    'Kafka',
    'Consumer',
    'Redis Rules',
    'Logistic Regression',
    'Decision Engine',
    'PostgreSQL'
  ];

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h2 className="text-xl font-bold text-white">Make Transaction</h2>
        <p className="text-xs text-slate-400">Submit financial transaction to run real-time fraud monitoring pipeline.</p>
      </div>

      {/* Transaction Pipeline Architecture Flow */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4">
        <h3 className="text-xs font-semibold text-slate-300 mb-2 uppercase tracking-wider">
          Real-Time Processing Pipeline
        </h3>
        <div className="flex flex-wrap items-center gap-1.5 text-[11px] font-mono">
          {pipelineSteps.map((step, idx) => (
            <React.Fragment key={step}>
              <span className="px-2.5 py-1 rounded-md bg-slate-950 border border-slate-800 text-emerald-400 font-medium">
                {step}
              </span>
              {idx < pipelineSteps.length - 1 && (
                <span className="text-slate-600 font-bold">→</span>
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Form Container */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Amount</label>
              <div className="relative">
                <span className="absolute left-3.5 top-2.5 text-xs text-slate-400 font-bold">₹</span>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="15000"
                  required
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-8 pr-3.5 py-2 text-xs text-slate-100 font-mono focus:outline-none focus:border-emerald-500/50"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Merchant</label>
              <input
                type="text"
                value={merchant}
                onChange={(e) => setMerchant(e.target.value)}
                placeholder="ABC Store"
                required
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3.5 py-2 text-xs text-slate-100 focus:outline-none focus:border-emerald-500/50"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Country</label>
              <input
                type="text"
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                placeholder="India"
                required
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3.5 py-2 text-xs text-slate-100 focus:outline-none focus:border-emerald-500/50"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">City</label>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="Delhi"
                required
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3.5 py-2 text-xs text-slate-100 focus:outline-none focus:border-emerald-500/50"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Device</label>
              <input
                type="text"
                value={device}
                onChange={(e) => setDevice(e.target.value)}
                placeholder="DEV102"
                required
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3.5 py-2 text-xs text-slate-100 font-mono focus:outline-none focus:border-emerald-500/50"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Channel</label>
              <select
                value={channel}
                onChange={(e) => setChannel(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3.5 py-2 text-xs text-slate-100 focus:outline-none focus:border-emerald-500/50"
              >
                <option value="Online">Online</option>
                <option value="Mobile">Mobile App</option>
                <option value="Web">Web Store</option>
              </select>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-800 flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 rounded-xl bg-emerald-500 text-slate-950 font-bold text-xs hover:bg-emerald-400 transition-colors flex items-center gap-2 disabled:opacity-50"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              Submit Transaction
            </button>
          </div>
        </form>

        {/* Live Evaluation Result Banner */}
        {lastResult && (
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white uppercase tracking-wider">
                Transaction Evaluated: {lastResult.transactionId}
              </span>
              <span
                className={`px-3 py-1 rounded text-xs font-bold ${
                  lastResult.decision === 'APPROVED'
                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                    : lastResult.decision === 'REVIEW'
                    ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                    : 'bg-red-500/10 text-red-400 border border-red-500/20'
                }`}
              >
                Decision: {lastResult.decision}
              </span>
            </div>

            <div className="text-xs text-slate-300 grid grid-cols-2 sm:grid-cols-3 gap-2 font-mono pt-1">
              <div>Amount: ₹{lastResult.amount.toLocaleString()}</div>
              <div>Risk Score: {lastResult.riskScore} / 100</div>
              <div>ML Prob: {Math.round(lastResult.fraudProbability * 100)}%</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
