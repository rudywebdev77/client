import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useWebSocket } from '../context/WebSocketContext';
import { useTheme } from '../context/ThemeContext';
import { FiBell, FiUser, FiLogOut, FiMoon, FiSun, FiCheck, FiCheckCircle } from 'react-icons/fi';
import toast from 'react-hot-toast';

export const Topbar = () => {
  const { user, logoutUser } = useAuth();
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useWebSocket();
  const { isDarkMode, toggleTheme } = useTheme();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logoutUser();
    toast.success('Logged out successfully');
    navigate('/login');
  };

  const handleToggleTheme = () => {
    toggleTheme();
    toast.success(`${isDarkMode ? 'Light' : 'Dark'} mode activated!`, { id: 'theme-toast' });
  };

  const handleNotifClick = async (notif) => {
    if (!notif.isRead) {
      await markAsRead(notif._id);
    }
    if (notif.link) {
      navigate(notif.link);
      setNotifOpen(false);
    }
  };

  const handleMarkSingleRead = async (id, e) => {
    e.stopPropagation();
    await markAsRead(id);
  };

  const handleMarkAllRead = async () => {
    await markAllAsRead();
    toast.success('All notifications marked as read', { id: 'mark-all-read' });
  };

  return (
    <header className="sticky top-0 z-10 flex h-16 w-full items-center justify-between border-b border-slate-800 bg-slate-950 px-4 md:px-6">
      <div>
        <h2 className="text-sm font-semibold text-slate-400 md:text-base">
          Welcome back, <span className="text-white font-bold">{user?.fullName}</span>
        </h2>
      </div>

      <div className="flex items-center gap-4">
        {/* Dark Mode Toggle */}
        <button
          onClick={handleToggleTheme}
          className="rounded-lg p-2 text-slate-400 hover:bg-slate-900 hover:text-white transition-colors"
          title="Toggle Theme"
        >
          {isDarkMode ? <FiSun className="h-5 w-5" /> : <FiMoon className="h-5 w-5" />}
        </button>

        {/* Notifications Bell */}
        <div className="relative">
          <button
            onClick={() => setNotifOpen(!notifOpen)}
            className="relative group rounded-lg p-2 text-slate-400 hover:bg-slate-900 hover:text-white transition-colors"
            title="Notifications"
          >
            <FiBell className="h-5 w-5" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 inline-flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-[#7C3AED] px-1 text-[11px] font-semibold text-white border-2 border-white dark:border-slate-950 shadow-[0_4px_10px_rgba(124,58,237,0.20)] transition-all duration-[180ms] ease-out group-hover:scale-[1.08] select-none">
                {unreadCount > 99 ? '99+' : unreadCount}
              </span>
            )}
          </button>

          {/* Notifications Dropdown */}
          {notifOpen && (
            <div className="absolute right-0 mt-2 w-80 rounded-xl border border-slate-800 bg-slate-950 p-4 shadow-xl ring-1 ring-black/5 max-h-96 overflow-y-auto thin-scrollbar">
              {/* Header */}
              <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-3">
                <span className="text-xs font-bold text-white">
                  Notifications {unreadCount > 0 && <span className="text-indigo-400">({unreadCount})</span>}
                </span>
                <div className="flex items-center gap-3">
                  {unreadCount > 0 && (
                    <button
                      onClick={handleMarkAllRead}
                      title="Mark all as read"
                      className="flex items-center gap-1 text-xxs text-slate-400 hover:text-white transition-colors"
                    >
                      <FiCheckCircle className="h-3.5 w-3.5" /> All read
                    </button>
                  )}
                  <Link
                    to="/notifications"
                    className="text-xxs text-indigo-400 hover:underline"
                    onClick={() => setNotifOpen(false)}
                  >
                    View All
                  </Link>
                </div>
              </div>

              {/* Notification list */}
              <div className="space-y-2">
                {notifications.length === 0 ? (
                  <div className="text-center text-xs text-slate-500 py-6">
                    <FiBell className="h-8 w-8 mx-auto text-slate-700 mb-2" />
                    No notifications yet
                  </div>
                ) : (
                  notifications.slice(0, 5).map((notif) => (
                    <div
                      key={notif._id}
                      onClick={() => handleNotifClick(notif)}
                      className={`cursor-pointer rounded-lg p-2.5 text-xs transition-colors ${
                        notif.isRead
                          ? 'bg-slate-900/40 text-slate-400'
                          : 'bg-indigo-500/10 text-slate-200 border-l-2 border-indigo-500'
                      }`}
                    >
                      <div className="flex justify-between items-start gap-1">
                        <span className="font-semibold text-white truncate max-w-[190px]">
                          {notif.title}
                        </span>
                        {!notif.isRead && (
                          <button
                            onClick={(e) => handleMarkSingleRead(notif._id, e)}
                            className="text-slate-400 hover:text-white shrink-0"
                            title="Mark as read"
                          >
                            <FiCheck className="h-3.5 w-3.5" />
                          </button>
                        )}
                      </div>
                      <p className="mt-1 text-slate-400 text-xxs leading-relaxed">{notif.message}</p>
                      {notif.link && (
                        <span className="mt-1.5 block text-xxs font-semibold text-indigo-400">
                          View details →
                        </span>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Dropdown */}
        <div className="relative">
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-2 focus:outline-none"
          >
            <div className="h-9 w-9 overflow-hidden rounded-full bg-slate-800 ring-2 ring-slate-800 flex items-center justify-center text-white font-semibold uppercase">
              {user?.profileImage ? (
                <img
                  src={user.profileImage.startsWith('http') ? user.profileImage : `${import.meta.env.VITE_SERVER_URL || 'http://localhost:5000'}/uploads/${user.profileImage}`}
                  alt={user.fullName}
                  className="h-full w-full object-cover"
                />
              ) : (
                user?.fullName?.charAt(0) || 'U'
              )}
            </div>
          </button>

          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-48 rounded-xl border border-slate-800 bg-slate-950 py-1 shadow-xl ring-1 ring-black/5">
              <Link
                to={user?.role === 'admin' ? '/admin/settings' : user?.role === 'client' ? '/client/settings' : user?.role === 'staff' ? '/staff/settings' : '/profile'}
                className="flex items-center gap-2 px-4 py-2 text-sm text-slate-300 hover:bg-slate-900 hover:text-white"
                onClick={() => setDropdownOpen(false)}
              >
                <FiUser className="h-4 w-4" /> Profile Settings
              </Link>
              <button
                onClick={handleLogout}
                className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm text-red-400 hover:bg-red-500/10"
              >
                <FiLogOut className="h-4 w-4" /> Sign Out
              </button>
            </div>
          )}
        </div>

      </div>
    </header>
  );
};
