import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { FiClock, FiActivity, FiUser, FiCheckSquare, FiPlus, FiAlertCircle, FiFilter } from 'react-icons/fi';

export const RecentActivity = ({ activities = [] }) => {
  const { user } = useAuth();
  const [filter, setFilter] = useState('all');

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

  // Filter activities locally based on selection
  const filteredActivities = activities.filter((act) => {
    if (filter === 'all') return true;
    const actionLower = act.action?.toLowerCase() || '';
    const moduleLower = act.module?.toLowerCase() || '';

    if (filter === 'project') {
      return actionLower.includes('project') || moduleLower.includes('project');
    }
    if (filter === 'request') {
      return actionLower.includes('request') || moduleLower.includes('request');
    }
    if (filter === 'message') {
      return actionLower.includes('message') || moduleLower.includes('message');
    }
    if (filter === 'auth') {
      return actionLower.includes('login') || actionLower.includes('logout') || moduleLower.includes('auth') || moduleLower.includes('session');
    }
    return true;
  });

  // Limit display to the latest 5 activities
  const displayedActivities = filteredActivities.slice(0, 5);

  return (
    <div className="flex flex-col h-[440px] rounded-xl border border-slate-800 bg-slate-950/40 p-5 backdrop-blur-xl shadow-lg relative">
      {/* Card Header (shrink-0) */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-4 border-b border-slate-800/60 pb-3 shrink-0">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
          <FiActivity className="h-4.5 w-4.5 text-indigo-400" /> Recent Activity
        </h3>

        {/* Dropdown Filter */}
        <div className="flex items-center gap-1.5 self-end sm:self-auto">
          <FiFilter className="h-3.5 w-3.5 text-slate-400" />
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="rounded-lg border border-slate-800 bg-slate-900 px-2 py-1 text-xs font-semibold text-slate-300 focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer"
          >
            <option value="all">All Activities</option>
            <option value="project">Projects</option>
            <option value="request">Requests</option>
            <option value="message">Messages</option>
            <option value="auth">Auth & Session</option>
          </select>
        </div>
      </div>

      {/* Card Scrollable Content (flex-1) */}
      <div className="flex-1 overflow-y-auto thin-scrollbar pr-1">
        {displayedActivities.length === 0 ? (
          <p className="text-sm text-slate-500 py-12 text-center">No matching activity recorded.</p>
        ) : (
          <div className="flow-root">
            <ul className="-mb-8">
              {displayedActivities.map((act, actIdx) => (
                <li key={act._id}>
                  <div className="relative pb-8">
                    {actIdx !== displayedActivities.length - 1 ? (
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
                          <p className="text-xs text-slate-300 break-words pr-2">
                            {act.description}{' '}
                            <span className="font-semibold text-white">
                              ({act.performedBy?.fullName || 'System'})
                            </span>
                          </p>
                        </div>
                        <div className="whitespace-nowrap text-right text-xxs text-slate-500 flex items-center gap-1 shrink-0">
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

      {/* Card Footer (shrink-0) */}
      <div className="mt-4 pt-3 border-t border-slate-800/60 shrink-0 text-center">
        <Link
          to={user ? `/${user.role}/activity` : '/'}
          className="inline-flex items-center gap-1.5 rounded-lg border border-slate-800 bg-slate-900 px-4 py-2 text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-850 transition duration-150 shadow-md shadow-black/10"
        >
          View All Activities &rarr;
        </Link>
      </div>
    </div>
  );
};
export default RecentActivity;
