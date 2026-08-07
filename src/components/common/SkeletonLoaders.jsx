import React from 'react';

export const PageSkeleton = () => (
  <div className="min-h-screen bg-slate-950 p-6 animate-pulse space-y-6">
    <div className="h-8 w-48 bg-slate-800 rounded-lg"></div>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="h-32 bg-slate-900 rounded-xl border border-slate-800"></div>
      <div className="h-32 bg-slate-900 rounded-xl border border-slate-800"></div>
      <div className="h-32 bg-slate-900 rounded-xl border border-slate-800"></div>
    </div>
    <div className="h-64 bg-slate-900 rounded-xl border border-slate-800"></div>
  </div>
);

export const TableSkeleton = ({ rows = 5 }) => (
  <div className="w-full bg-slate-900 rounded-xl border border-slate-800 p-4 animate-pulse space-y-4">
    <div className="h-6 w-1/4 bg-slate-800 rounded"></div>
    {Array.from({ length: rows }).map((_, i) => (
      <div key={i} className="h-10 w-full bg-slate-800/50 rounded flex items-center justify-between px-4">
        <div className="h-4 w-1/3 bg-slate-700 rounded"></div>
        <div className="h-4 w-1/6 bg-slate-700 rounded"></div>
        <div className="h-4 w-1/6 bg-slate-700 rounded"></div>
      </div>
    ))}
  </div>
);

export const CardSkeleton = () => (
  <div className="h-48 w-full bg-slate-900 rounded-xl border border-slate-800 p-6 animate-pulse space-y-4">
    <div className="h-6 w-1/2 bg-slate-800 rounded"></div>
    <div className="h-4 w-3/4 bg-slate-800/60 rounded"></div>
    <div className="h-4 w-1/3 bg-slate-800/40 rounded"></div>
  </div>
);
