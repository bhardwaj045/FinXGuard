import React from 'react';
import { useAuth } from '../context/AuthContext';
import { User, Shield } from 'lucide-react';

export default function Header() {
  const { currentUser, role } = useAuth();

  return (
    <header className="bg-slate-900 border-b border-slate-800 px-6 py-3 flex items-center justify-between sticky top-0 z-30">
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center">
            <Shield className="w-4 h-4 text-emerald-400" />
          </div>
          <div>
            <span className="font-bold text-sm tracking-tight text-white block leading-none">FinXGuard</span>
          </div>
        </div>
      </div>

      {currentUser && (
        <div className="flex items-center gap-2.5 text-xs">
          <div className="w-7 h-7 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300">
            <User className="w-3.5 h-3.5" />
          </div>
          <div className="hidden sm:block text-left">
            <span className="font-semibold text-slate-200 block leading-tight">{currentUser.name}</span>
            <span className="text-[10px] text-slate-400">{currentUser.email}</span>
          </div>
          <span
            className={`px-2 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase border ${
              role === 'ADMIN'
                ? 'bg-purple-500/10 text-purple-400 border-purple-500/30'
                : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
            }`}
          >
            {role}
          </span>
        </div>
      )}
    </header>
  );
}
