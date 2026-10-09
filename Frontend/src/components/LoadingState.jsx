import React from 'react';
import { Loader2 } from 'lucide-react';

export default function LoadingState({ message = 'Loading...' }) {
  return (
    <div className="flex items-center justify-center py-12 px-4 bg-slate-900/40 border border-slate-800 rounded-xl">
      <div className="flex items-center gap-3 text-slate-400 text-xs font-medium">
        <Loader2 className="w-5 h-5 animate-spin text-emerald-400" />
        <span>{message}</span>
      </div>
    </div>
  );
}
