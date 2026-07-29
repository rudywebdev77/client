import React from 'react';

export const StatsCard = ({ title, value, icon, color = 'indigo' }) => {
  const colorMap = {
    indigo: 'from-indigo-500/20 to-indigo-600/5 text-indigo-400 border-indigo-500/20',
    emerald: 'from-emerald-500/20 to-emerald-600/5 text-emerald-400 border-emerald-500/20',
    amber: 'from-amber-500/20 to-amber-600/5 text-amber-400 border-amber-500/20',
    red: 'from-red-500/20 to-red-600/5 text-red-400 border-red-500/20',
    purple: 'from-purple-500/20 to-purple-600/5 text-purple-400 border-purple-500/20',
    blue: 'from-blue-500/20 to-blue-600/5 text-blue-400 border-blue-500/20',
  };

  const bgClasses = colorMap[color] || colorMap.indigo;

  return (
    <div className={`relative overflow-hidden rounded-xl border bg-gradient-to-br bg-slate-950/40 p-5 backdrop-blur-xl shadow-lg transition-transform hover:-translate-y-0.5 ${bgClasses}`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xxs font-semibold uppercase tracking-wider text-slate-400">{title}</p>
          <h3 className="mt-2 text-2xl font-bold text-white">{value}</h3>
        </div>
        <div className="rounded-lg bg-slate-900/60 p-2.5">
          {icon}
        </div>
      </div>
    </div>
  );
};
export default StatsCard;
