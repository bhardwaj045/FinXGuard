import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { Calendar, Mail, Shield, User } from 'lucide-react';

export default function AdminProfile() {
  const { currentUser } = useAuth();
  const createdAt = currentUser?.createdAt
    ? new Date(currentUser.createdAt).toLocaleDateString()
    : 'Unavailable';

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-xl font-bold text-white">Administrator Profile</h1>
        <p className="text-xs text-slate-400">Account information for the authenticated administrator.</p>
      </div>
      <section className="space-y-5 rounded-xl border border-slate-800 bg-slate-900 p-6" aria-label="Administrator profile details">
        <div className="flex items-center gap-4 border-b border-slate-800 pb-5">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-purple-500/30 bg-purple-500/10 font-semibold text-purple-300">
            {currentUser?.name?.charAt(0)?.toUpperCase() || <User className="h-5 w-5" />}
          </div>
          <div>
            <h2 className="font-semibold text-white">{currentUser?.name}</h2>
            <p className="text-xs text-slate-400">{currentUser?.email}</p>
          </div>
        </div>
        <dl className="grid gap-4 sm:grid-cols-2">
          <div className="flex items-start gap-3 rounded-lg border border-slate-800 bg-slate-950/60 p-4">
            <Mail className="mt-0.5 h-4 w-4 text-slate-400" />
            <div><dt className="text-xs text-slate-500">Email</dt><dd className="mt-1 text-sm text-slate-200">{currentUser?.email}</dd></div>
          </div>
          <div className="flex items-start gap-3 rounded-lg border border-slate-800 bg-slate-950/60 p-4">
            <Shield className="mt-0.5 h-4 w-4 text-purple-300" />
            <div><dt className="text-xs text-slate-500">Role</dt><dd className="mt-1 text-sm text-slate-200">{currentUser?.role}</dd></div>
          </div>
          <div className="flex items-start gap-3 rounded-lg border border-slate-800 bg-slate-950/60 p-4 sm:col-span-2">
            <Calendar className="mt-0.5 h-4 w-4 text-slate-400" />
            <div><dt className="text-xs text-slate-500">Account created</dt><dd className="mt-1 text-sm text-slate-200">{createdAt}</dd></div>
          </div>
        </dl>
        <p className="border-t border-slate-800 pt-4 text-xs text-slate-500">Profile changes and password updates are not available through the current backend.</p>
      </section>
    </div>
  );
}
