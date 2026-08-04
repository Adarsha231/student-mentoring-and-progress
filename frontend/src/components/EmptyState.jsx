import React from 'react';
import { SearchX } from 'lucide-react';

export default function EmptyState({ title = 'No records found', message = 'Try adjusting your search query or filters.' }) {
  return (
    <div className="p-12 text-center glass-panel rounded-2xl border border-dark-border max-w-md mx-auto my-8">
      <div className="h-16 w-16 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center mx-auto mb-4">
        <SearchX className="w-8 h-8" />
      </div>
      <h3 className="text-base font-bold text-white mb-1">{title}</h3>
      <p className="text-xs text-slate-400">{message}</p>
    </div>
  );
}
