import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useTheme } from '../../context/ThemeContext';
import { getClientActivities, getActivityStats } from '../../services/activityService';
import {
  FiActivity, FiLogIn, FiLogOut, FiUser, FiShield, FiFolder,
  FiFile, FiBell, FiSettings, FiSearch, FiRefreshCw,
  FiFilter, FiCalendar, FiClock, FiMonitor, FiGlobe,
  FiChevronLeft, FiChevronRight, FiAlertCircle, FiZap,
  FiPackage, FiMail, FiCheckCircle
} from 'react-icons/fi';
import toast from 'react-hot-toast';

// ─────────────────────────────────────────────────────────────────────────────
// Activity type configuration: icon, label, badge color
// ─────────────────────────────────────────────────────────────────────────────
const ACTIVITY_CONFIG = {
  login:             { icon: <FiLogIn />,    label: 'Login',             color: 'emerald' },
  logout:            { icon: <FiLogOut />,   label: 'Logout',            color: 'slate'   },
  profile_updated:   { icon: <FiUser />,     label: 'Profile Updated',   color: 'blue'    },
  password_changed:  { icon: <FiShield />,   label: 'Password Changed',  color: 'purple'  },
  email_changed:     { icon: <FiMail />,     label: 'Email Changed',     color: 'violet'  },
  project_created:   { icon: <FiZap />,      label: 'Project Created',   color: 'indigo'  },
  project_updated:   { icon: <FiFolder />,   label: 'Project Updated',   color: 'sky'     },
  project_deleted:   { icon: <FiFolder />,   label: 'Project Deleted',   color: 'red'     },
  request_created:   { icon: <FiPackage />,  label: 'Request Submitted', color: 'amber'   },
  request_updated:   { icon: <FiPackage />,  label: 'Request Updated',   color: 'yellow'  },
  file_uploaded:     { icon: <FiFile />,     label: 'File Uploaded',     color: 'cyan'    },
  file_deleted:      { icon: <FiFile />,     label: 'File Deleted',      color: 'red'     },
  notification_read: { icon: <FiBell />,     label: 'Notification Read', color: 'orange'  },
  settings_updated:  { icon: <FiSettings />, label: 'Settings Updated',  color: 'teal'    },
  system:            { icon: <FiActivity />, label: 'System',            color: 'slate'   },
};

const colorMap = {
  emerald: { badge: 'dark:bg-emerald-500/15 dark:text-emerald-400 dark:ring-emerald-400/30 bg-emerald-50 text-emerald-700 ring-emerald-200', dot: 'bg-emerald-500', icon: 'dark:text-emerald-400 dark:bg-emerald-500/10 text-emerald-600 bg-emerald-100' },
  slate:   { badge: 'dark:bg-slate-500/15 dark:text-slate-400 dark:ring-slate-400/30 bg-slate-100 text-slate-700 ring-slate-200',       dot: 'bg-slate-500',   icon: 'dark:text-slate-400 dark:bg-slate-500/10 text-slate-600 bg-slate-100'   },
  blue:    { badge: 'dark:bg-blue-500/15 dark:text-blue-400 dark:ring-blue-400/30 bg-blue-50 text-blue-700 ring-blue-200',           dot: 'bg-blue-500',    icon: 'dark:text-blue-400 dark:bg-blue-500/10 text-blue-600 bg-blue-100'     },
  purple:  { badge: 'dark:bg-purple-500/15 dark:text-purple-400 dark:ring-purple-400/30 bg-purple-50 text-purple-700 ring-purple-200',     dot: 'bg-purple-500',  icon: 'dark:text-purple-400 dark:bg-purple-500/10 text-purple-600 bg-purple-100' },
  violet:  { badge: 'dark:bg-violet-500/15 dark:text-violet-400 dark:ring-violet-400/30 bg-violet-50 text-violet-700 ring-violet-200',     dot: 'bg-violet-500',  icon: 'dark:text-violet-400 dark:bg-violet-500/10 text-violet-600 bg-violet-100' },
  indigo:  { badge: 'dark:bg-indigo-500/15 dark:text-indigo-400 dark:ring-indigo-400/30 bg-indigo-50 text-indigo-700 ring-indigo-200',     dot: 'bg-indigo-500',  icon: 'dark:text-indigo-400 dark:bg-indigo-500/10 text-indigo-600 bg-indigo-100' },
  sky:     { badge: 'dark:bg-sky-500/15 dark:text-sky-400 dark:ring-sky-400/30 bg-sky-50 text-sky-700 ring-sky-200',             dot: 'bg-sky-500',     icon: 'dark:text-sky-400 dark:bg-sky-500/10 text-sky-600 bg-sky-100'       },
  red:     { badge: 'dark:bg-red-500/15 dark:text-red-400 dark:ring-red-400/30 bg-red-50 text-red-700 ring-red-200',             dot: 'bg-red-500',     icon: 'dark:text-red-400 dark:bg-red-500/10 text-red-600 bg-red-100'       },
  amber:   { badge: 'dark:bg-amber-500/15 dark:text-amber-400 dark:ring-amber-400/30 bg-amber-50 text-amber-700 ring-amber-200',       dot: 'bg-amber-500',   icon: 'dark:text-amber-400 dark:bg-amber-500/10 text-amber-600 bg-amber-100'   },
  yellow:  { badge: 'dark:bg-yellow-500/15 dark:text-yellow-400 dark:ring-yellow-400/30 bg-yellow-50 text-yellow-700 ring-yellow-200',     dot: 'bg-yellow-500',  icon: 'dark:text-yellow-400 dark:bg-yellow-500/10 text-yellow-600 bg-yellow-100' },
  cyan:    { badge: 'dark:bg-cyan-500/15 dark:text-cyan-400 dark:ring-cyan-400/30 bg-cyan-50 text-cyan-700 ring-cyan-200',           dot: 'bg-cyan-500',    icon: 'dark:text-cyan-400 dark:bg-cyan-500/10 text-cyan-600 bg-cyan-100'     },
  orange:  { badge: 'dark:bg-orange-500/15 dark:text-orange-400 dark:ring-orange-400/30 bg-orange-50 text-orange-700 ring-orange-200',     dot: 'bg-orange-500',  icon: 'dark:text-orange-400 dark:bg-orange-500/10 text-orange-600 bg-orange-100' },
  teal:    { badge: 'dark:bg-teal-500/15 dark:text-teal-400 dark:ring-teal-400/30 bg-teal-50 text-teal-700 ring-teal-200',           dot: 'bg-teal-500',    icon: 'dark:text-teal-400 dark:bg-teal-500/10 text-teal-600 bg-teal-100'     },
};

const getCfg   = (type) => ACTIVITY_CONFIG[type] || ACTIVITY_CONFIG.system;
const getColor = (type) => colorMap[getCfg(type).color] || colorMap.slate;

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────
const formatRelativeTime = (isoString) => {
  if (!isoString) return '';
  const date = new Date(isoString);
  const now = new Date();
  const diffInSeconds = Math.floor((now - date) / 1000);

  if (diffInSeconds < 60) return 'Just now';
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) return `${diffInMinutes} min ago`;
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours} hr${diffInHours > 1 ? 's' : ''} ago`;
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
  const diffInWeeks = Math.floor(diffInDays / 7);
  if (diffInWeeks < 4) return `${diffInWeeks} wk${diffInWeeks > 1 ? 's' : ''} ago`;
  return date.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });
};

const getGroupHeadingLabel = (period) => {
  switch (period) {
    case 'today':     return 'TODAY';
    case 'yesterday': return 'YESTERDAY';
    case 'weekly':    return 'THIS WEEK';
    case 'monthly':   return 'THIS MONTH';
    case 'yearly':    return 'THIS YEAR';
    case 'custom':    return 'CUSTOM RANGE';
    default:          return 'ALL ACTIVITIES';
  }
};

const filterByPeriod = (items, period, startDate, endDate) => {
  if (!period) return items;

  const now = new Date();
  const startToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0).getTime();
  const endToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999).getTime();

  switch (period) {
    case 'today':
      return items.filter(item => {
        const t = new Date(item.createdAt).getTime();
        return t >= startToday && t <= endToday;
      });

    case 'yesterday': {
      const startYesterday = startToday - 86400000;
      const endYesterday = startToday - 1;
      return items.filter(item => {
        const t = new Date(item.createdAt).getTime();
        return t >= startYesterday && t <= endYesterday;
      });
    }

    case 'weekly': {
      const weekAgo = startToday - 6 * 86400000;
      return items.filter(item => {
        const t = new Date(item.createdAt).getTime();
        return t >= weekAgo && t <= endToday;
      });
    }

    case 'monthly': {
      const startMonth = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0).getTime();
      return items.filter(item => {
        const t = new Date(item.createdAt).getTime();
        return t >= startMonth && t <= endToday;
      });
    }

    case 'yearly': {
      const startYear = new Date(now.getFullYear(), 0, 1, 0, 0, 0, 0).getTime();
      return items.filter(item => {
        const t = new Date(item.createdAt).getTime();
        return t >= startYear && t <= endToday;
      });
    }

    case 'custom': {
      if (!startDate || !endDate) return items;
      const startCustom = new Date(startDate).getTime();
      const endCustom = new Date(endDate).setHours(23, 59, 59, 999);
      return items.filter(item => {
        const t = new Date(item.createdAt).getTime();
        return t >= startCustom && t <= endCustom;
      });
    }

    default:
      return items;
  }
};

const getTimelineGroups = (items, period) => {
  if (!items || items.length === 0) return [];

  // When a specific period filter is selected, group under that period header
  if (period) {
    const heading = getGroupHeadingLabel(period);
    return [[heading, items]];
  }

  // When "All Time" is selected, group chronologically by date
  const groups = {
    'TODAY': [],
    'YESTERDAY': [],
    'THIS WEEK': [],
    'OLDER': [],
  };

  const now = new Date();
  const startToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const startYesterday = startToday - 86400000;
  const startWeek = startToday - 6 * 86400000;

  items.forEach((item) => {
    const time = new Date(item.createdAt).getTime();
    if (time >= startToday) {
      groups['TODAY'].push(item);
    } else if (time >= startYesterday) {
      groups['YESTERDAY'].push(item);
    } else if (time >= startWeek) {
      groups['THIS WEEK'].push(item);
    } else {
      groups['OLDER'].push(item);
    }
  });

  return Object.entries(groups).filter(([_, list]) => list.length > 0);
};

// ─────────────────────────────────────────────────────────────────────────────
// Sub-components
// ─────────────────────────────────────────────────────────────────────────────
const SkeletonCard = () => (
  <div className="flex gap-4 animate-pulse">
    <div className="flex flex-col items-center gap-1">
      <div className="h-9 w-9 rounded-xl bg-slate-800" />
      <div className="w-px flex-1 bg-slate-800" />
    </div>
    <div className="flex-1 pb-6 space-y-2">
      <div className="h-3 w-24 rounded bg-slate-800" />
      <div className="h-4 w-48 rounded bg-slate-800" />
      <div className="h-3 w-64 rounded bg-slate-800" />
    </div>
  </div>
);

/** Interactive Top Summary Card Component */
const TopSummaryCard = ({
  label,
  value,
  icon,
  color = 'emerald',
  loading,
  isActive,
  onClick,
}) => {
  const { isDarkMode } = useTheme();

  const darkThemes = {
    emerald: {
      themeClass: '!bg-[#0F3B3A] !border-[#14B8A6]',
      activeThemeClass: '!bg-[#134e4d] !border-[#2DD4BF] ring-2 ring-[#2DD4BF]/60 shadow-[0_0_20px_rgba(45,212,191,0.35)]',
      iconBgClass: 'bg-[#2DD4BF]/12',
      iconColorClass: 'text-[#2DD4BF]',
      titleClass: 'text-[#D1D5DB]',
      valueClass: 'text-white',
    },
    indigo: {
      themeClass: '!bg-[#1E2258] !border-[#4F46E5]',
      activeThemeClass: '!bg-[#262b6f] !border-[#818CF8] ring-2 ring-[#818CF8]/60 shadow-[0_0_20px_rgba(129,140,248,0.35)]',
      iconBgClass: 'bg-[#818CF8]/12',
      iconColorClass: 'text-[#818CF8]',
      titleClass: 'text-[#D1D5DB]',
      valueClass: 'text-white',
    },
    purple: {
      themeClass: '!bg-[#2C1E4A] !border-[#8B5CF6]',
      activeThemeClass: '!bg-[#392760] !border-[#C084FC] ring-2 ring-[#C084FC]/60 shadow-[0_0_20px_rgba(192,132,252,0.35)]',
      iconBgClass: 'bg-[#C084FC]/12',
      iconColorClass: 'text-[#C084FC]',
      titleClass: 'text-[#D1D5DB]',
      valueClass: 'text-white',
    },
    amber: {
      themeClass: '!bg-[#3A2A12] !border-[#D97706]',
      activeThemeClass: '!bg-[#4d3818] !border-[#FACC15] ring-2 ring-[#FACC15]/60 shadow-[0_0_20px_rgba(250,204,21,0.35)]',
      iconBgClass: 'bg-[#FACC15]/12',
      iconColorClass: 'text-[#FACC15]',
      titleClass: 'text-[#D1D5DB]',
      valueClass: 'text-white',
    },
    blue: {
      themeClass: '!bg-[#163A5F] !border-[#2563EB]',
      activeThemeClass: '!bg-[#1d4978] !border-[#60A5FA] ring-2 ring-[#60A5FA]/60 shadow-[0_0_20px_rgba(96,165,250,0.35)]',
      iconBgClass: 'bg-[#60A5FA]/12',
      iconColorClass: 'text-[#60A5FA]',
      titleClass: 'text-[#D1D5DB]',
      valueClass: 'text-white',
    },
  };

  const lightThemes = {
    emerald: {
      themeClass: 'bg-emerald-50/80 border-emerald-200/80',
      activeThemeClass: 'bg-emerald-100 border-emerald-300 ring-2 ring-emerald-500/40 shadow-md shadow-emerald-500/10',
      iconBgClass: 'bg-emerald-100',
      iconColorClass: 'text-emerald-600',
      titleClass: 'text-slate-600',
      valueClass: 'text-slate-900 font-extrabold',
    },
    indigo: {
      themeClass: 'bg-indigo-50/80 border-indigo-200/80',
      activeThemeClass: 'bg-indigo-100 border-indigo-300 ring-2 ring-indigo-500/40 shadow-md shadow-indigo-500/10',
      iconBgClass: 'bg-indigo-100',
      iconColorClass: 'text-indigo-600',
      titleClass: 'text-slate-600',
      valueClass: 'text-slate-900 font-extrabold',
    },
    purple: {
      themeClass: 'bg-purple-50/80 border-purple-200/80',
      activeThemeClass: 'bg-purple-100 border-purple-300 ring-2 ring-purple-500/40 shadow-md shadow-purple-500/10',
      iconBgClass: 'bg-purple-100',
      iconColorClass: 'text-purple-600',
      titleClass: 'text-slate-600',
      valueClass: 'text-slate-900 font-extrabold',
    },
    amber: {
      themeClass: 'bg-amber-50/80 border-amber-200/80',
      activeThemeClass: 'bg-amber-100 border-amber-300 ring-2 ring-amber-500/40 shadow-md shadow-amber-500/10',
      iconBgClass: 'bg-amber-100',
      iconColorClass: 'text-amber-600',
      titleClass: 'text-slate-600',
      valueClass: 'text-slate-900 font-extrabold',
    },
    blue: {
      themeClass: 'bg-blue-50/80 border-blue-200/80',
      activeThemeClass: 'bg-blue-100 border-blue-300 ring-2 ring-blue-500/40 shadow-md shadow-blue-500/10',
      iconBgClass: 'bg-blue-100',
      iconColorClass: 'text-blue-600',
      titleClass: 'text-slate-600',
      valueClass: 'text-slate-900 font-extrabold',
    },
  };

  const themeConfig = (isDarkMode ? darkThemes[color] : lightThemes[color]) || (isDarkMode ? darkThemes.indigo : lightThemes.indigo);

  return (
    <div
      onClick={onClick}
      className={`relative overflow-hidden rounded-xl border px-5 py-3.5 backdrop-blur-xl transition-all duration-300 cursor-pointer select-none ${
        isActive
          ? `scale-[1.02] ${themeConfig.activeThemeClass}`
          : `opacity-90 hover:opacity-100 hover:-translate-y-0.5 ${themeConfig.themeClass}`
      }`}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className={`text-xxs font-semibold uppercase tracking-wider ${isActive ? (isDarkMode ? 'text-white font-bold' : 'text-slate-900 font-bold') : themeConfig.titleClass}`}>
            {label}
          </p>
          {loading ? (
            <div className="mt-2 h-7 w-14 animate-pulse rounded bg-slate-800" />
          ) : (
            <h3 className={`mt-1 text-3xl font-extrabold tracking-tight ${themeConfig.valueClass}`}>{value ?? 0}</h3>
          )}
        </div>
        <div className={`rounded-lg p-2.5 shrink-0 transition-transform duration-300 ${isActive ? 'scale-110' : ''} ${themeConfig.iconBgClass} ${themeConfig.iconColorClass}`}>
          {icon}
        </div>
      </div>
    </div>
  );
};

/** Single Activity Timeline Item */
const ActivityCard = ({ activity, userRole }) => {
  const navigate = useNavigate();
  const cfg   = getCfg(activity.activityType);
  const color = getColor(activity.activityType);

  const exactDateStr = activity.createdAt ? new Date(activity.createdAt).toLocaleString() : '';

  const getNavigationPath = () => {
    const actType = activity.activityType || '';
    const role = userRole || 'client';

    if (actType.includes('project')) {
      return `/${role}/projects`;
    }
    if (actType.includes('request')) {
      return role === 'staff' ? '/staff/projects' : `/${role}/requests`;
    }
    if (actType.includes('file')) {
      return role === 'admin' ? '/admin/files' : `/${role}/projects`;
    }
    if (actType.includes('notification')) {
      return `/${role}/notifications`;
    }
    if (actType.includes('profile') || actType.includes('password') || actType.includes('email')) {
      return `/${role}/profile`;
    }
    return `/${role}`;
  };

  const handleCardClick = () => {
    const path = getNavigationPath();
    if (path) navigate(path);
  };

  return (
    <div
      onClick={handleCardClick}
      title={`Exact time: ${exactDateStr}`}
      className="group relative rounded-xl border border-slate-800/80 bg-slate-900/40 p-4 backdrop-blur-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-slate-700 hover:bg-slate-900/80 hover:shadow-xl cursor-pointer select-none"
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:gap-4">
        {/* Icon */}
        <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-base ${color.icon}`}>
          {cfg.icon}
        </div>

        <div className="flex-1 min-w-0">
          {/* Title & Badge Row */}
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex flex-wrap items-center gap-2">
              <h4 className="text-sm font-bold text-white group-hover:text-indigo-400 transition-colors">{activity.title}</h4>
              <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xxs font-semibold ring-1 ${color.badge}`}>
                {cfg.label}
              </span>
              {activity.status === 'failed' && (
                <span className="inline-flex items-center rounded-full bg-red-500/10 px-2 py-0.5 text-xxs font-semibold text-red-400 ring-1 ring-red-400/30">
                  Failed
                </span>
              )}
            </div>

            {/* Relative Time */}
            <span className="text-xxs font-semibold text-slate-600 dark:text-slate-400 flex items-center gap-1" title={exactDateStr}>
              <FiClock className="h-3 w-3 text-slate-500 dark:text-slate-400" />
              {formatRelativeTime(activity.createdAt)}
            </span>
          </div>

          {/* Description */}
          {activity.description && (
            <p className="mt-1 text-xs text-slate-600 dark:text-slate-400 leading-relaxed font-medium">{activity.description}</p>
          )}

          {/* User & Device Metadata Row */}
          <div className="mt-2.5 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xxs text-slate-600 dark:text-slate-400 border-t border-slate-200 dark:border-slate-800/60 pt-2">
            <span className="flex items-center gap-1 font-semibold text-slate-800 dark:text-slate-300">
              <FiUser className="h-3 w-3 text-indigo-600 dark:text-indigo-400" />
              {userRole === 'client' ? 'You' : (userRole === 'admin' ? 'System User' : 'Staff Member')}
            </span>
            <span className="inline-flex items-center rounded bg-slate-100 dark:bg-slate-800/80 px-2 py-0.5 text-[10px] uppercase font-bold text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-transparent">
              {userRole}
            </span>
            {activity.operatingSystem && (
              <span className="flex items-center gap-1 font-medium text-slate-600 dark:text-slate-400">
                <FiMonitor className="h-3 w-3 text-slate-500 dark:text-slate-400" /> {activity.operatingSystem}
              </span>
            )}
            {activity.browser && (
              <span className="flex items-center gap-1 font-medium text-slate-600 dark:text-slate-400">
                <FiGlobe className="h-3 w-3 text-slate-500 dark:text-slate-400" /> {activity.browser}
              </span>
            )}
            {activity.ipAddress && (
              <span className="flex items-center gap-1 font-mono font-medium text-slate-600 dark:text-slate-400">
                <FiShield className="h-3 w-3 text-slate-500 dark:text-slate-400" /> {activity.ipAddress}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

/** Timeline group block */
const TimelineGroup = ({ label, items, totalFilteredCount, userRole }) => (
  <div className="relative">
    {/* Date Group Label */}
    <div className="mb-4 flex items-center gap-3">
      <span className="rounded-lg bg-indigo-600/15 px-3 py-1 text-xs font-bold text-indigo-400 ring-1 ring-inset ring-indigo-500/20 uppercase tracking-wider">
        {label}
      </span>
      <span className="text-xxs text-slate-400 font-bold uppercase tracking-wide">
        {totalFilteredCount} {totalFilteredCount === 1 ? 'activity' : 'activities'}
      </span>
    </div>

    {/* Vertical line + cards */}
    <div className="relative ml-2 border-l border-slate-200 dark:border-slate-800 pl-6 space-y-3">
      {items.map((act) => (
        <div key={act._id} className="relative">
          {/* Connector dot */}
          <div className={`absolute -left-[27px] top-3.5 h-3 w-3 rounded-full border-2 border-white dark:border-slate-900 ${getColor(act.activityType).dot}`} />
          <ActivityCard activity={act} userRole={userRole} />
        </div>
      ))}
    </div>
  </div>
);

// ─────────────────────────────────────────────────────────────────────────────
// Main Activity Page Component
// ─────────────────────────────────────────────────────────────────────────────
export const Activity = () => {
  const { user } = useAuth();
  const userRole = user?.role || 'client';
  const timelineRef = useRef(null);

  const [stats,          setStats]          = useState(null);
  const [statsLoading,   setStatsLoading]   = useState(true);
  const [rawActivities,  setRawActivities]  = useState([]);
  const [loading,        setLoading]        = useState(true);
  const [error,          setError]          = useState(null);

  // Filters — default period is 'today' per prompt spec
  const [search,       setSearch]       = useState('');
  const [activityType, setActivityType] = useState('');
  const [period,       setPeriod]       = useState('today');
  const [startDate,    setStartDate]    = useState('');
  const [endDate,      setEndDate]      = useState('');

  // Pagination states — default page size is 5 per prompt spec
  const [page,         setPage]         = useState(1);
  const [pageSize,     setPageSize]     = useState(5);

  // Dynamic Section Heading
  const getSectionTitle = () => {
    switch (period) {
      case 'today':
        return "Today's Activities";
      case 'yesterday':
        return "Yesterday's Activities";
      case 'weekly':
        return "This Week's Activities";
      case 'monthly':
        return "This Month's Activities";
      case 'yearly':
        return "This Year's Activities";
      case 'custom':
        return "Custom Date Range Activities";
      default:
        return "All Activities";
    }
  };

  // ── Fetch Stats ──
  useEffect(() => {
    (async () => {
      try {
        setStatsLoading(true);
        const res = await getActivityStats();
        if (res.success) setStats(res.stats);
      } catch {
        /* silent fallback */
      } finally {
        setStatsLoading(false);
      }
    })();
  }, []);

  // ── Fetch All Activities Once or On Query Change ──
  const fetchActivities = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = { limit: 100 };
      if (search && search.trim()) params.search = search.trim();
      if (activityType) params.activityType = activityType;
      if (period)       params.period       = period;
      if (period === 'custom') {
        if (startDate) params.startDate = startDate;
        if (endDate)   params.endDate   = endDate;
      }

      const res = await getClientActivities(params);
      if (res.success) {
        setRawActivities(res.activities);
      }
    } catch (err) {
      setError('Failed to load activities. Please try again.');
      toast.error('Failed to load activities');
    } finally {
      setLoading(false);
    }
  }, [search, activityType, period, startDate, endDate]);

  // Reset page to 1 on filter or search changes
  useEffect(() => {
    setPage(1);
  }, [search, activityType, period, startDate, endDate, pageSize]);

  useEffect(() => {
    fetchActivities();
  }, [fetchActivities]);

  const handleCardSelect = (selectedPeriod) => {
    setPeriod(selectedPeriod);
    setPage(1);

    if (timelineRef.current) {
      const rect = timelineRef.current.getBoundingClientRect();
      if (rect.top < 0 || rect.bottom > window.innerHeight) {
        timelineRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    }
  };

  const handleReset = () => {
    setSearch('');
    setActivityType('');
    setPeriod('');
    setStartDate('');
    setEndDate('');
    setPage(1);
  };

  // Apply real-time period filter on loaded dataset
  const filteredActivities = useMemo(() => {
    return filterByPeriod(rawActivities, period, startDate, endDate);
  }, [rawActivities, period, startDate, endDate]);

  // Calculate client-side pagination on filtered activities
  const totalFiltered = filteredActivities.length;
  const totalPages = Math.max(1, Math.ceil(totalFiltered / pageSize));

  const currentPageActivities = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredActivities.slice(start, start + pageSize);
  }, [filteredActivities, page, pageSize]);

  const timelineGroups = useMemo(() => {
    return getTimelineGroups(currentPageActivities, period);
  }, [currentPageActivities, period]);

  const handlePageChange = (newPage) => {
    setPage(newPage);
    if (timelineRef.current) {
      const rect = timelineRef.current.getBoundingClientRect();
      if (rect.top < 0 || rect.bottom > window.innerHeight) {
        timelineRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">{getSectionTitle()}</h1>
        <p className="mt-0.5 text-sm text-slate-400">Monitor all audit trails, system events, and account activities in real time.</p>
      </div>

      {/* ── 1. Interactive Top Summary Cards (5 Cards) ── */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
        <TopSummaryCard
          label="Today"
          value={stats?.today}
          color="emerald"
          icon={<FiZap className="h-6 w-6" />}
          loading={statsLoading}
          isActive={period === 'today'}
          onClick={() => handleCardSelect('today')}
        />
        <TopSummaryCard
          label="Yesterday"
          value={stats?.yesterday}
          color="indigo"
          icon={<FiCalendar className="h-6 w-6" />}
          loading={statsLoading}
          isActive={period === 'yesterday'}
          onClick={() => handleCardSelect('yesterday')}
        />
        <TopSummaryCard
          label="This Week"
          value={stats?.weekly}
          color="purple"
          icon={<FiActivity className="h-6 w-6" />}
          loading={statsLoading}
          isActive={period === 'weekly'}
          onClick={() => handleCardSelect('weekly')}
        />
        <TopSummaryCard
          label="This Month"
          value={stats?.monthly}
          color="amber"
          icon={<FiFilter className="h-6 w-6" />}
          loading={statsLoading}
          isActive={period === 'monthly'}
          onClick={() => handleCardSelect('monthly')}
        />
        <TopSummaryCard
          label="This Year"
          value={stats?.yearly}
          color="blue"
          icon={<FiGlobe className="h-6 w-6" />}
          loading={statsLoading}
          isActive={period === 'yearly'}
          onClick={() => handleCardSelect('yearly')}
        />
      </div>

      {/* ── 2. Synchronized Filters Bar ── */}
      <div className="rounded-xl border border-slate-800 bg-slate-950/40 p-4 backdrop-blur-xl shadow-xl space-y-3">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {/* Search Input */}
          <div className="relative">
            <FiSearch className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
            <input
              type="text"
              placeholder="Search activity..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-xl border border-slate-800 bg-slate-900/50 py-2 pl-9 pr-4 text-xs text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          {/* Activity Type Dropdown */}
          <select
            value={activityType}
            onChange={(e) => setActivityType(e.target.value)}
            className="rounded-xl border border-slate-800 bg-slate-900/50 px-3 py-2 text-xs text-white focus:border-indigo-500 focus:outline-none"
          >
            <option value="">All Activity Types</option>
            {Object.entries(ACTIVITY_CONFIG).map(([key, val]) => (
              <option key={key} value={key}>{val.label}</option>
            ))}
          </select>

          {/* Synchronized Date Range Dropdown */}
          <select
            value={period}
            onChange={(e) => { setPeriod(e.target.value); if (e.target.value !== 'custom') { setStartDate(''); setEndDate(''); } }}
            className="rounded-xl border border-slate-800 bg-slate-900/50 px-3 py-2 text-xs text-white focus:border-indigo-500 focus:outline-none"
          >
            <option value="">All Time</option>
            <option value="today">Today</option>
            <option value="yesterday">Yesterday</option>
            <option value="weekly">Last 7 Days</option>
            <option value="monthly">This Month</option>
            <option value="yearly">This Year</option>
            <option value="custom">Custom Range</option>
          </select>

          {/* Reset Action Button */}
          <div className="flex gap-2">
            <button
              onClick={handleReset}
              className="flex w-full items-center justify-center gap-1.5 rounded-xl border border-slate-800 bg-slate-900 px-3 py-2 text-xs font-semibold text-slate-400 transition-all hover:text-white hover:bg-slate-800"
            >
              <FiRefreshCw className="h-3.5 w-3.5" /> Reset Filters
            </button>
          </div>
        </div>

        {/* Custom date range selection */}
        {period === 'custom' && (
          <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-slate-800/80">
            <label className="text-xs text-slate-400 font-semibold">From:</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="rounded-xl border border-slate-800 bg-slate-900/50 px-3 py-1.5 text-xs text-white focus:border-indigo-500 focus:outline-none"
            />
            <label className="text-xs text-slate-400 font-semibold">To:</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="rounded-xl border border-slate-800 bg-slate-900/50 px-3 py-1.5 text-xs text-white focus:border-indigo-500 focus:outline-none"
            />
          </div>
        )}
      </div>

      {/* ── 3. Activity Timeline ── */}
      <div ref={timelineRef} className="space-y-6">
        {/* Error State */}
        {error && !loading && (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-red-500/20 bg-red-500/5 py-12 text-center">
            <FiAlertCircle className="h-10 w-10 text-red-400 mb-3" />
            <p className="text-sm font-semibold text-white">{error}</p>
            <button onClick={fetchActivities} className="mt-4 rounded-lg bg-red-600 px-4 py-2 text-xs font-semibold text-white hover:bg-red-500">
              Retry
            </button>
          </div>
        )}

        {/* Loading Skeletons */}
        {loading && (
          <div className="rounded-2xl border border-slate-800 bg-slate-950/40 p-6 space-y-6">
            {[...Array(5)].map((_, i) => <SkeletonCard key={i} />)}
          </div>
        )}

        {/* ── 4. Empty State ── */}
        {!loading && !error && filteredActivities.length === 0 && (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-slate-800 bg-slate-950/40 py-16 text-center backdrop-blur-xl">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-900 border border-slate-800 mb-4">
              <FiActivity className="h-8 w-8 text-slate-500" />
            </div>
            <p className="text-base font-bold text-white">
              {period ? 'No activities found for this period.' : 'No activities found.'}
            </p>
            <p className="mt-1 text-xs text-slate-400">
              {search || activityType || period
                ? 'Try selecting a different time filter or resetting your filters.'
                : 'Activities will appear here as actions occur in the system.'}
            </p>
            {(search || activityType || period) && (
              <button onClick={handleReset} className="mt-4 rounded-xl border border-slate-800 bg-slate-900 px-4 py-2 text-xs font-semibold text-slate-300 hover:text-white transition-colors">
                Reset Filters
              </button>
            )}
          </div>
        )}

        {/* Timeline Groups */}
        {!loading && !error && filteredActivities.length > 0 && (
          <div className="space-y-8">
            {timelineGroups.map(([label, items]) => (
              <TimelineGroup
                key={label}
                label={label}
                items={items}
                totalFilteredCount={totalFiltered}
                userRole={userRole}
              />
            ))}
          </div>
        )}

        {/* ── 5. Pagination Bar (Default Page Size 5, Selectable 5/10/20) ── */}
        {!loading && totalFiltered > 0 && (
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between rounded-xl border border-slate-800 bg-slate-950/40 px-5 py-3 shadow-xl">
            {/* Page Size Selector */}
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <span>Show</span>
              <select
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value));
                  setPage(1);
                }}
                className="rounded-lg border border-slate-800 bg-slate-900 px-2.5 py-1 text-xs text-white focus:border-indigo-500 focus:outline-none"
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={20}>20</option>
              </select>
              <span>per page</span>
              <span className="text-slate-600 font-semibold ml-2">
                (Page {page} of {totalPages} — {totalFiltered} total)
              </span>
            </div>

            {/* Bottom-Right Arrow Buttons */}
            <div className="flex items-center gap-2 self-end sm:self-auto">
              <button
                onClick={() => handlePageChange(Math.max(1, page - 1))}
                disabled={page === 1}
                className="flex items-center gap-1 rounded-lg border border-slate-800 bg-slate-900 px-3 py-1.5 text-xs font-semibold text-slate-300 transition-all hover:border-indigo-500 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <FiChevronLeft className="h-4 w-4" /> Previous
              </button>
              <button
                onClick={() => handlePageChange(Math.min(totalPages, page + 1))}
                disabled={page === totalPages}
                className="flex items-center gap-1 rounded-lg border border-slate-800 bg-slate-900 px-3 py-1.5 text-xs font-semibold text-slate-300 transition-all hover:border-indigo-500 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed"
              >
                Next <FiChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Activity;
