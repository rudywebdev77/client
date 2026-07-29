import React, { useState, useEffect } from 'react';
import { getProjectHistory } from '../../services/historyService';
import { FiClock, FiActivity, FiUser, FiFile, FiCheckSquare, FiRefreshCw, FiMessageSquare } from 'react-icons/fi';

export const ActivityTimeline = ({ projectId }) => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');

  useEffect(() => {
    const fetchHistory = async () => {
      if (!projectId) return;
      try {
        const res = await getProjectHistory(projectId);
        if (res.success) {
          setHistory(res.history);
        }
      } catch (err) {
        console.error('Failed to load history', err);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, [projectId]);

  const filterHistory = () => {
    if (activeTab === 'status') return history.filter(h => h.action.includes('status'));
    if (activeTab === 'assignment') return history.filter(h => h.action.includes('staff') || h.action.includes('assign'));
    if (activeTab === 'revision') return history.filter(h => h.action.includes('revision'));
    if (activeTab === 'message') return history.filter(h => h.action.includes('message'));
    return history;
  };

  const filtered = filterHistory();

  if (loading) {
    return <div className="py-6 text-center text-slate-500">Loading activity timeline...</div>;
  }

  return (
    <div className="space-y-4 rounded-xl border border-slate-800 bg-slate-950/40 p-5 backdrop-blur-xl">
      <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
        <FiActivity className="text-indigo-400" /> Project Activity Timeline
      </h3>

      {/* Tabs */}
      <div className="flex flex-wrap gap-1.5 border-b border-slate-800 pb-3">
        {[
          { id: 'all', label: 'Overview / All Logs' },
          { id: 'status', label: 'Status History' },
          { id: 'assignment', label: 'Assignment History' },
          { id: 'revision', label: 'Revision History' },
          { id: 'message', label: 'Messages' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
              activeTab === tab.id
                ? 'bg-indigo-600 text-white'
                : 'bg-slate-900/60 text-slate-400 hover:bg-slate-850 hover:text-slate-200'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Timeline items */}
      {filtered.length === 0 ? (
        <p className="py-6 text-center text-xs text-slate-500">No activity recorded for this category.</p>
      ) : (
        <div className="relative pl-6 border-l border-slate-800 space-y-6 my-4">
          {filtered.map((item) => (
            <div key={item._id} className="relative">
              <div className="absolute -left-[31px] top-0 h-4 w-4 rounded-full border-2 border-indigo-500 bg-slate-950 flex items-center justify-center">
                <div className="h-1.5 w-1.5 rounded-full bg-indigo-400"></div>
              </div>
              <div>
                <div className="flex items-center justify-between">
                  <p className="text-xs font-semibold text-white">
                    {item.description}
                  </p>
                  <span className="text-xxs text-slate-500 flex items-center gap-1">
                    <FiClock className="h-3 w-3" />
                    {new Date(item.createdAt).toLocaleString()}
                  </span>
                </div>
                <div className="mt-1 flex items-center gap-2 text-xxs text-slate-400">
                  <span className="flex items-center gap-1">
                    <FiUser className="h-3 w-3 text-slate-500" />
                    {item.performedBy?.fullName || 'System'} ({item.role})
                  </span>
                  {item.oldValue && item.newValue && (
                    <span className="rounded bg-slate-900 px-1.5 py-0.5 text-slate-300 font-mono">
                      {item.oldValue} → {item.newValue}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
export default ActivityTimeline;
