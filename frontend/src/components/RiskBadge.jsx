import React from 'react';
import { ShieldCheck, ShieldAlert, AlertTriangle } from 'lucide-react';

export default function RiskBadge({ level, showIcon = true, size = 'md' }) {
  const normalized = (level || 'LOW').toUpperCase();

  const configs = {
    LOW: {
      label: 'Low Risk',
      color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 shadow-emerald-500/10',
      icon: ShieldCheck,
      dot: 'bg-emerald-500'
    },
    MEDIUM: {
      label: 'Medium Risk',
      color: 'bg-amber-500/10 text-amber-400 border-amber-500/30 shadow-amber-500/10',
      icon: AlertTriangle,
      dot: 'bg-amber-500'
    },
    HIGH: {
      label: 'High Risk',
      color: 'bg-rose-500/10 text-rose-400 border-rose-500/30 shadow-rose-500/10 animate-pulse-subtle',
      icon: ShieldAlert,
      dot: 'bg-rose-500'
    }
  };

  const current = configs[normalized] || configs.LOW;
  const Icon = current.icon;

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs font-medium',
    md: 'px-2.5 py-1 text-xs font-semibold',
    lg: 'px-3.5 py-1.5 text-sm font-semibold'
  };

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border shadow-sm ${current.color} ${sizeClasses[size]}`}>
      <span className={`h-2 w-2 rounded-full ${current.dot} ${normalized === 'HIGH' ? 'animate-ping' : ''}`}></span>
      {showIcon && <Icon className="w-3.5 h-3.5" />}
      <span>{current.label}</span>
    </span>
  );
}
