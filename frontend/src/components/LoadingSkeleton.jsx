import React from 'react';

export default function LoadingSkeleton({ type = 'card', count = 3 }) {
  if (type === 'card') {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className="h-48 rounded-xl bg-dark-card border border-dark-border/50 p-5 space-y-4">
            <div className="h-4 bg-dark-border rounded w-2/3"></div>
            <div className="h-3 bg-dark-border/60 rounded w-1/2"></div>
            <div className="h-10 bg-dark-border/40 rounded-lg"></div>
            <div className="h-4 bg-dark-border/60 rounded w-3/4"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="p-8 text-center animate-pulse space-y-3">
      <div className="h-6 bg-dark-border rounded w-1/3 mx-auto"></div>
      <div className="h-4 bg-dark-border/50 rounded w-1/4 mx-auto"></div>
    </div>
  );
}
