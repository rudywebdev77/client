import React from 'react';
import { FiClock, FiActivity, FiUser, FiCheckSquare, FiPlus, FiAlertCircle } from 'react-icons/fi';

export const RecentActivity = ({ activities = [] }) => {
  const getActionIcon = (action) => {
    if (action.includes('create') || action.includes('submit')) {
      return <FiPlus className="h-4 w-4 text-emerald-400" />;
    }
    if (action.includes('status') || action.includes('change')) {
      return <FiActivity className="h-4 w-4 text-indigo-400" />;
    }
    if (action.includes('reject')) {
      return <FiAlertCircle className="h-4 w-4 text-red-400" />;
    }
    return <FiCheckSquare className="h-4 w-4 text-slate-400" />;
  };

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-950/40 p-5 backdrop-blur-xl shadow-lg">
      <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-2">
        <FiActivity className="h-4.5 w-4.5 text-indigo-400" /> Recent Activity
      </h3>

      {activities.length === 0 ? (
        <p className="text-sm text-slate-500 py-4 text-center">No recent activity recorded.</p>
      ) : (
        <div className="flow-root">
          <ul className="-mb-8">
            {activities.map((act, actIdx) => (
              <li key={act._id}>
                <div className="relative pb-8">
                  {actIdx !== activities.length - 1 ? (
                    <span className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-slate-800" aria-hidden="true"></span>
                  ) : null}
                  <div className="relative flex space-x-3">
                    <div>
                      <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-900 border border-slate-800">
                        {getActionIcon(act.action)}
                      </span>
                    </div>
                    <div className="flex min-w-0 flex-1 justify-between space-x-4 pt-1.5">
                      <div>
                        <p className="text-xs text-slate-300">
                          {act.description}{' '}
                          <span className="font-semibold text-white">
                            ({act.performedBy?.fullName || 'System'})
                          </span>
                        </p>
                      </div>
                      <div className="whitespace-nowrap text-right text-xxs text-slate-500 flex items-center gap-1">
                        <FiClock className="h-3 w-3" />
                        {new Date(act.createdAt).toLocaleDateString(undefined, {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};
export default RecentActivity;
