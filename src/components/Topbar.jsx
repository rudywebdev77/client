import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { FiBell, FiUser, FiLogOut, FiMoon, FiSun } from 'react-icons/fi';
import toast from 'react-hot-toast';

export const Topbar = () => {
  const { user, logoutUser } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(true); // Default dark
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logoutUser();
    toast.success('Logged out successfully');
    navigate('/login');
  };

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    document.documentElement.classList.toggle('dark');
    toast.success(`${!darkMode ? 'Dark' : 'Light'} mode activated!`, { id: 'theme-toast' });
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
          onClick={toggleDarkMode}
          className="rounded-lg p-2 text-slate-400 hover:bg-slate-900 hover:text-white transition-colors"
          title="Toggle Theme"
        >
          {darkMode ? <FiSun className="h-5 w-5" /> : <FiMoon className="h-5 w-5" />}
        </button>

        {/* Notifications Bell */}
        <div className="relative">
          <button
            onClick={() => setNotifOpen(!notifOpen)}
            className="relative rounded-lg p-2 text-slate-400 hover:bg-slate-900 hover:text-white transition-colors"
          >
            <FiBell className="h-5 w-5" />
            <span className="absolute top-1.5 right-1.5 h-2.5 w-2.5 rounded-full bg-indigo-500 ring-2 ring-slate-950"></span>
          </button>

          {/* Simple Notifications dropdown placeholder */}
          {notifOpen && (
            <div className="absolute right-0 mt-2 w-80 rounded-xl border border-slate-800 bg-slate-950 p-4 shadow-xl ring-1 ring-black/5">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <span className="text-xs font-bold text-white">Notifications</span>
                <Link to="/notifications" className="text-xxs text-indigo-400 hover:underline" onClick={() => setNotifOpen(false)}>
                  View All
                </Link>
              </div>
              <div className="mt-3 space-y-3">
                <div className="rounded-lg bg-slate-900/60 p-2 text-xs text-slate-300">
                  <p className="font-semibold text-white">Welcome to Work Portal</p>
                  <p className="mt-1 text-slate-400 text-xxs">Setup completed. You can start managing projects now.</p>
                </div>
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
              {user?.fullName?.charAt(0) || 'U'}
            </div>
          </button>

          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-48 rounded-xl border border-slate-800 bg-slate-950 py-1 shadow-xl ring-1 ring-black/5">
              <Link
                to="/profile"
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
