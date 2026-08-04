import React from 'react';

export default function StatCard({ title, value, icon: Icon, color = 'blue', subtitle, trend }) {
  const colorStyles = {
    blue: 'border-blue-500/20 text-blue-400 bg-blue-500/10',
    emerald: 'border-emerald-500/20 text-emerald-400 bg-emerald-500/10',
    amber: 'border-amber-500/20 text-amber-400 bg-amber-500/10',
    rose: 'border-rose-500/20 text-rose-400 bg-rose-500/10',
    purple: 'border-purple-500/20 text-purple-400 bg-purple-500/10',
  };

  return (
    <div className="glass-card rounded-xl p-5 border border-dark-border relative overflow-hidden group">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-dark-muted mb-1">{title}</p>
          <h3 className="text-2xl font-bold text-white tracking-tight">{value}</h3>
          {subtitle && <p className="text-xs text-slate-400 mt-1">{subtitle}</p>}
        </div>
        <div className={`p-3 rounded-xl border ${colorStyles[color] || colorStyles.blue} group-hover:scale-110 transition-transform duration-200`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
      {trend && (
        <div className="mt-3 pt-3 border-t border-dark-border/50 text-xs flex items-center justify-between text-slate-400">
          <span>{trend}</span>
        </div>
      )}
    </div>
  );
}
