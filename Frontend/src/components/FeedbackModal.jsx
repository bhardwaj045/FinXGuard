import React, { useState } from 'react';
import { X, CheckCircle, AlertTriangle, MessageSquare, Loader2 } from 'lucide-react';
import { feedbackApi } from '../api/feedbackApi';

export default function FeedbackModal({ transaction, onClose, onSubmitFeedback }) {
  const [actualFraud, setActualFraud] = useState(transaction?.decision === 'BLOCKED');
  const [submitting, setSubmitting] = useState(false);
  const [doneMsg, setDoneMsg] = useState(null);

  if (!transaction) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await feedbackApi.submitFeedback(
        transaction.transactionId,
        actualFraud,
        'ANALYST_DASHBOARD'
      );
      setDoneMsg('Feedback submitted successfully!');
      setTimeout(() => {
        onSubmitFeedback && onSubmitFeedback();
        onClose();
      }, 1000);
    } catch (err) {
      alert('Error submitting feedback: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-all"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="p-2.5 bg-cyan-500/10 text-cyan-400 rounded-xl border border-cyan-500/20">
            <MessageSquare className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">Analyst Ground Truth Feedback</h3>
            <p className="text-xs text-slate-400">Record actual outcome for model retraining</p>
          </div>
        </div>

        <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-3.5 text-xs mb-5 space-y-1.5 font-mono">
          <div className="flex justify-between">
            <span className="text-slate-400">Tx ID:</span>
            <span className="text-white font-semibold">{transaction.transactionId}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Amount:</span>
            <span className="text-white">{transaction.currency} {transaction.amount}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Predicted Decision:</span>
            <span className={`font-bold ${
              transaction.decision === 'BLOCKED' ? 'text-rose-400' :
              transaction.decision === 'REVIEW' ? 'text-amber-400' : 'text-emerald-400'
            }`}>
              {transaction.decision} (Risk: {transaction.riskScore}/100)
            </span>
          </div>
        </div>

        {doneMsg ? (
          <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold text-center flex items-center justify-center gap-2">
            <CheckCircle className="w-4 h-4" /> {doneMsg}
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-2">
                What was the ground truth outcome for this transaction?
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setActualFraud(false)}
                  className={`p-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
                    !actualFraud
                      ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400 shadow-md shadow-emerald-500/10'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <CheckCircle className="w-4 h-4" /> Legit (Not Fraud)
                </button>

                <button
                  type="button"
                  onClick={() => setActualFraud(true)}
                  className={`p-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
                    actualFraud
                      ? 'bg-rose-500/20 border-rose-500 text-rose-400 shadow-md shadow-rose-500/10'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <AlertTriangle className="w-4 h-4" /> Confirmed Fraud
                </button>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800 transition-all"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-cyan-500 text-slate-950 hover:bg-cyan-400 transition-all flex items-center gap-2 shadow-lg shadow-cyan-500/20 disabled:opacity-50"
              >
                {submitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                Submit Feedback
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
