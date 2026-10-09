import React from 'react';
import { Shield } from 'lucide-react';

export default function Navbar({ isPolling }) {
  return (
    <header className="border-b border-slate-800 bg-slate-900 px-6 py-4 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        {/* Logo & Platform Title */}
        <div className="flex items-center gap-3">
          <div className="bg-slate-800 p-2 rounded-lg border border-slate-700">
            <Shield className="w-6 h-6 text-slate-200" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white tracking-wide">
              FinXGuard
            </h1>
          </div>
        </div>

        {/* System Status Indicator */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800/80 border border-slate-700/60 text-xs font-medium text-slate-300">
          <span className={`h-2 w-2 rounded-full ${isPolling ? 'bg-emerald-400' : 'bg-slate-500'}`} />
          <span>System Status: {isPolling ? 'Connected' : 'Paused'}</span>
        </div>
      </div>
    </header>
  );
}
