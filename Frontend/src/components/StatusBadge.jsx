import React from 'react';
import { CheckCircle2, AlertTriangle, ShieldAlert, HelpCircle, FileText } from 'lucide-react';

export default function StatusBadge({ status }) {
  let normalized = status ? String(status).toUpperCase() : '';

  switch (normalized) {
    case 'APPROVED':
      return (
        <span
          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
          aria-label="Status: Approved"
        >
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
          APPROVED
        </span>
      );
    case 'REVIEW':
      return (
        <span
          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20"
          aria-label="Status: Under Review"
        >
          <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
          REVIEW
        </span>
      );
    case 'BLOCKED':
      return (
        <span
          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-red-500/10 text-red-400 border border-red-500/20"
          aria-label="Status: Blocked"
        >
          <ShieldAlert className="w-3.5 h-3.5 text-red-400" />
          BLOCKED
        </span>
      );
    case 'FLAGGED':
      return (
        <span
          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-orange-500/10 text-orange-400 border border-orange-500/20"
          aria-label="Status: Flagged"
        >
          <AlertTriangle className="w-3.5 h-3.5 text-orange-400" />
          FLAGGED
        </span>
      );
    case 'PENDING':
      return (
        <span
          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-slate-500/10 text-slate-400 border border-slate-500/20"
          aria-label="Status: Pending"
        >
          <HelpCircle className="w-3.5 h-3.5 text-slate-400" />
          PENDING
        </span>
      );
    case 'UNPROCESSED':
    case 'LEGACY':
    default:
      return (
        <span
          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-slate-800 text-slate-400 border border-slate-700"
          aria-label="Status: Unprocessed"
        >
          <FileText className="w-3.5 h-3.5 text-slate-400" />
          UNPROCESSED
        </span>
      );
  }
}
