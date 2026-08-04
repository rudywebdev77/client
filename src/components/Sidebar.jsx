import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useCompany } from '../context/CompanyContext';
import {
  FiGrid,
  FiUsers,
  FiFileText,
  FiFolder,
  FiMessageSquare,
  FiLogOut,
  FiPieChart,
  FiPlusCircle,
  FiCheckSquare,
  FiActivity,
  FiSettings
} from 'react-icons/fi';

export const Sidebar = () => {
  const { user, logoutUser } = useAuth();
  const { companyName, companyTagline, getCompanyLogoUrl, openCompanyModal } = useCompany();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logoutUser();
    navigate('/login');
  };

  const handleBrandClick = () => {
    if (user?.role === 'admin') {
      navigate('/admin/settings');
    } else {
      openCompanyModal();
    }
  };

  const getSubtitle = () => {
    if (companyTagline?.trim()) {
      return companyTagline.trim();
    }
    switch (user?.role) {
      case 'admin':
        return 'Administrator';
      case 'staff':
        return 'Staff Portal';
      case 'client':
        return 'Client Portal';
      default:
        return 'Portal';
    }
  };

  const getLinks = () => {
    switch (user?.role) {
      case 'admin':
        return [
          { to: '/admin', label: 'Dashboard', icon: <FiGrid className="h-5 w-5" /> },
          { to: '/admin/users', label: 'Users', icon: <FiUsers className="h-5 w-5" /> },
          { to: '/admin/requests', label: 'Client Requests', icon: <FiFileText className="h-5 w-5" /> },
          { to: '/admin/projects', label: 'Projects', icon: <FiFolder className="h-5 w-5" /> },
          { to: '/admin/files', label: 'File Manager', icon: <FiFolder className="h-5 w-5" /> },
          { to: '/admin/reports', label: 'Reports', icon: <FiPieChart className="h-5 w-5" /> },
          { to: '/admin/activity', label: 'Activity', icon: <FiActivity className="h-5 w-5" /> },
          { to: '/admin/settings', label: 'Settings', icon: <FiSettings className="h-5 w-5" /> },
        ];
      case 'staff':
        return [
          { to: '/staff', label: 'Dashboard', icon: <FiGrid className="h-5 w-5" /> },
          { to: '/staff/projects', label: 'My Projects', icon: <FiFolder className="h-5 w-5" /> },
          { to: '/staff/activity', label: 'Activity', icon: <FiActivity className="h-5 w-5" /> },
          { to: '/staff/settings', label: 'Settings', icon: <FiSettings className="h-5 w-5" /> },
        ];
      case 'client':
        return [
          { to: '/client', label: 'Dashboard', icon: <FiGrid className="h-5 w-5" /> },
          { to: '/client/requests/new', label: 'Submit Request', icon: <FiPlusCircle className="h-5 w-5" /> },
          { to: '/client/requests', label: 'My Requests', icon: <FiFileText className="h-5 w-5" /> },
          { to: '/client/projects', label: 'Projects', icon: <FiFolder className="h-5 w-5" /> },
          { to: '/client/activity', label: 'Activity', icon: <FiActivity className="h-5 w-5" /> },
          { to: '/client/settings', label: 'Settings', icon: <FiSettings className="h-5 w-5" /> },
        ];
      default:
        return [];
    }
  };

  const links = getLinks();
  const logoUrl = getCompanyLogoUrl();

  return (
    <aside className="fixed bottom-0 left-0 z-20 flex h-16 w-full flex-row border-t border-slate-800 bg-slate-950 px-2 py-1 text-slate-400 md:sticky md:top-0 md:h-screen md:w-64 md:flex-col md:border-t-0 md:border-r md:px-4 md:py-6">
      {/* Brand logo (visible on md screens) */}
      <div
        onClick={handleBrandClick}
        className="hidden items-center gap-3 px-3 mb-8 md:flex cursor-pointer group hover:opacity-90 transition"
        title={user?.role === 'admin' ? 'Open Company Settings' : 'View Company Information'}
      >
        {logoUrl ? (
          <img
            src={logoUrl}
            alt={companyName}
            className="h-10 w-10 rounded-xl object-cover border border-slate-700/60 shadow-md group-hover:scale-105 transition"
          />
        ) : (
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-500 text-white shadow-lg shadow-indigo-500/20 shrink-0 group-hover:scale-105 transition">
            <FiCheckSquare className="h-6 w-6" />
          </div>
        )}
        <div className="min-w-0 flex-1">
          <h1 className="text-base font-bold text-white tracking-tight truncate group-hover:text-indigo-300 transition">{companyName || 'Work Portal'}</h1>
          <p className="text-xxs font-semibold uppercase tracking-wider text-slate-400">{getSubtitle()}</p>
        </div>
      </div>

      {/* Nav Links */}
      <nav className="flex w-full flex-row justify-around items-center gap-1 md:flex-1 md:flex-col md:justify-start md:items-stretch md:gap-2">
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            end={link.to === '/admin' || link.to === '/staff' || link.to === '/client'}
            className={({ isActive }) => {
              const isRequestsNew = window.location.pathname === '/client/requests/new';
              const isCurrentRequests = link.to === '/client/requests';
              const active = isActive && !(isCurrentRequests && isRequestsNew);

              return `flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition-all duration-200 ${active
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/10'
                  : 'hover:bg-slate-900/60 hover:text-slate-200'
                }`;
            }}
          >
            {link.icon}
            <span className="hidden md:inline">{link.label}</span>
          </NavLink>
        ))}

        {/* Mobile logout option, otherwise handled at topbar */}
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition-all duration-200 hover:bg-red-500/10 hover:text-red-400 md:hidden"
        >
          <FiLogOut className="h-5 w-5" />
        </button>
      </nav>

      {/* Footer / Logout (desktop) */}
      <div className="hidden border-t border-slate-800/80 pt-4 md:block">
        <div className="flex items-center justify-between px-3">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 overflow-hidden rounded-full bg-slate-800 flex items-center justify-center text-white font-semibold uppercase shrink-0">
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

            <div className="overflow-hidden">
              <p className="truncate text-xs font-semibold text-white">{user?.fullName}</p>
              <p className="truncate text-xxs text-slate-500">{user?.email}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            title="Sign Out"
            className="rounded-lg p-1.5 hover:bg-red-500/10 hover:text-red-400 transition-colors"
          >
            <FiLogOut className="h-5 w-5" />
          </button>
        </div>
      </div>
    </aside>
  );
};
