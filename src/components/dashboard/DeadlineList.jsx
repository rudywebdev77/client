import React from 'react';
import { FiCalendar, FiClock, FiAlertTriangle } from 'react-icons/fi';

export const DeadlineList = ({ deadlines = [] }) => {
  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high':
        return 'text-red-450 bg-red-500/10 border-red-500/25';
      case 'medium':
        return 'text-amber-400 bg-amber-500/10 border-amber-500/25';
      default:
        return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/25';
    }
  };

  const getRemainingDays = (dateStr) => {
    const diffTime = new Date(dateStr) - new Date();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    if (diffDays < 0) return 'Overdue';
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Tomorrow';
    return `${diffDays} days left`;
  };

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-950/40 p-5 backdrop-blur-xl shadow-lg">
      <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-2">
        <FiCalendar className="h-4.5 w-4.5 text-indigo-400" /> Upcoming Deadlines
      </h3>

      {deadlines.length === 0 ? (
        <p className="text-sm text-slate-500 py-4 text-center">No upcoming deadlines.</p>
      ) : (
        <div className="space-y-3">
          {deadlines.map((proj) => (
            <div
              key={proj._id}
              className="flex items-center justify-between rounded-lg border border-slate-800 bg-slate-900/40 p-3 transition-colors hover:bg-slate-900/60"
            >
              <div className="overflow-hidden pr-2">
                <p className="truncate text-xs font-semibold text-white">{proj.projectName}</p>
                <p className="truncate text-xxs text-slate-500">Client: {proj.client?.fullName || 'N/A'}</p>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <span className={`rounded px-1.5 py-0.5 text-xxs font-medium border ${getPriorityColor(proj.priority)}`}>
                  {proj.priority}
                </span>
                <span className="flex items-center gap-1 text-xxs font-semibold text-slate-350">
                  <FiClock className="h-3.5 w-3.5 text-slate-500" />
                  {getRemainingDays(proj.deadline)}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
export default DeadlineList;
