import React from 'react';
import { Inbox } from 'lucide-react';

export default function EmptyState({ title = 'No data available.', description = 'There are no records to display at this time.' }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center bg-slate-900/60 border border-slate-800 rounded-xl">
      <Inbox className="w-10 h-10 text-slate-600 mb-3" />
      <h3 className="text-sm font-semibold text-slate-300 mb-1">{title}</h3>
      <p className="text-xs text-slate-500 max-w-sm">{description}</p>
    </div>
  );
}
