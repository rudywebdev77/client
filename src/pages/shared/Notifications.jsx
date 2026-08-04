import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useWebSocket } from '../../context/WebSocketContext';
import { FiBell, FiCheck, FiCheckCircle, FiClock, FiSearch } from 'react-icons/fi';
import toast from 'react-hot-toast';

export const Notifications = () => {
  const { notifications, markAsRead, markAllAsRead } = useWebSocket();
  const [search, setSearch] = useState('');

  const handleMarkRead = async (id) => {
    try {
      await markAsRead(id);
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await markAllAsRead();
      toast.success('All marked as read');
    } catch (err) {
      toast.error('Failed to mark all as read');
    }
  };

  const filteredNotifications = notifications.filter((notif) => {
    if (!search.trim()) return true;
    const cleanSearch = search.trim().toLowerCase();
    return (
      notif.title?.toLowerCase().includes(cleanSearch) ||
      notif.message?.toLowerCase().includes(cleanSearch)
    );
  });

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Notifications</h1>
          <p className="text-sm text-slate-400">Updates regarding your requests, projects, and messages.</p>
        </div>
        <button
          onClick={handleMarkAllRead}
          className="flex items-center gap-1.5 rounded-lg border border-slate-800 bg-slate-900 px-3 py-2 text-xs font-semibold text-slate-300 hover:text-white transition-colors"
        >
          <FiCheckCircle /> Mark All Read
        </button>
      </div>

      {/* Search Input */}
      <div className="relative max-w-md">
        <input
          type="text"
          placeholder="Search notifications..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-xl border border-slate-800 bg-slate-950/40 py-2.5 pl-10 pr-4 text-sm text-white placeholder-slate-500 backdrop-blur-xl focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
        />
        <FiSearch className="absolute left-3.5 top-3 h-4.5 w-4.5 text-slate-500" />
      </div>

      <div className="rounded-xl border border-slate-800 bg-slate-950/40 p-6 backdrop-blur-xl shadow-xl space-y-3">
        {filteredNotifications.length === 0 ? (
          <div className="py-12 text-center text-slate-500">
            <FiBell className="h-10 w-10 mx-auto text-slate-700 mb-2" />
            <p className="text-sm">No notifications found.</p>
          </div>
        ) : (
          filteredNotifications.map((notif) => (
            <div
              key={notif._id}
              className={`flex items-start justify-between rounded-lg border p-4 transition-colors ${
                notif.isRead
                  ? 'border-slate-800/60 bg-slate-900/20 text-slate-400'
                  : 'border-indigo-500/30 bg-indigo-500/5 text-slate-200'
              }`}
            >
              <div className="space-y-1 pr-4">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-white">{notif.title}</span>
                  {!notif.isRead && (
                    <span className="h-2 w-2 rounded-full bg-indigo-500"></span>
                  )}
                </div>
                <p className="text-xs text-slate-300">{notif.message}</p>
                <div className="flex items-center gap-3 pt-1">
                  <span className="text-xxs text-slate-500 flex items-center gap-1">
                    <FiClock /> {new Date(notif.createdAt).toLocaleString()}
                  </span>
                  {notif.link && (
                    <Link to={notif.link} className="text-xxs font-semibold text-indigo-400 hover:underline">
                      View details →
                    </Link>
                  )}
                </div>
              </div>

              {!notif.isRead && (
                <button
                  onClick={() => handleMarkRead(notif._id)}
                  title="Mark as Read"
                  className="rounded p-1 text-slate-400 hover:text-white hover:bg-slate-800"
                >
                  <FiCheck className="h-4 w-4" />
                </button>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};
export default Notifications;
