import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';

export const StatsCard = ({
  title,
  value,
  icon,
  color = 'indigo',
  className = '',
  glow = false,
  to = null,
  onClick = null,
}) => {
  const navigate = useNavigate();
  const { isDarkMode } = useTheme();

  const isClickable = Boolean(to || onClick);

  const handleClick = (e) => {
    if (onClick) {
      onClick(e);
    } else if (to) {
      navigate(to);
    }
  };

  const darkThemeMap = {
    indigo: {
      bg: '!bg-[#1E2258]',
      border: '!border-[#4F46E5]',
      hover: 'hover:!border-[#818CF8] hover:shadow-[0_0_20px_rgba(129,140,248,0.25)]',
      iconText: 'text-[#818CF8]',
      iconBg: 'bg-[#818CF8]/12',
      title: 'text-[#D1D5DB]',
      value: 'text-[#FFFFFF]',
    },
    emerald: {
      bg: '!bg-[#0F3B3A]',
      border: '!border-[#14B8A6]',
      hover: 'hover:!border-[#2DD4BF] hover:shadow-[0_0_20px_rgba(45,212,191,0.25)]',
      iconText: 'text-[#2DD4BF]',
      iconBg: 'bg-[#2DD4BF]/12',
      title: 'text-[#D1D5DB]',
      value: 'text-[#FFFFFF]',
    },
    amber: {
      bg: '!bg-[#3A2A12]',
      border: '!border-[#D97706]',
      hover: 'hover:!border-[#FACC15] hover:shadow-[0_0_20px_rgba(250,204,21,0.25)]',
      iconText: 'text-[#FACC15]',
      iconBg: 'bg-[#FACC15]/12',
      title: 'text-[#D1D5DB]',
      value: 'text-[#FFFFFF]',
    },
    blue: {
      bg: '!bg-[#132E4D]',
      border: '!border-[#2563EB]',
      hover: 'hover:!border-[#60A5FA] hover:shadow-[0_0_20px_rgba(96,165,250,0.25)]',
      iconText: 'text-[#60A5FA]',
      iconBg: 'bg-[#60A5FA]/12',
      title: 'text-[#D1D5DB]',
      value: 'text-[#FFFFFF]',
    },
    red: {
      bg: '!bg-[#3A1D2E]',
      border: '!border-[#BE185D]',
      hover: 'hover:!border-[#FB7185] hover:shadow-[0_0_20px_rgba(251,113,133,0.25)]',
      iconText: 'text-[#FB7185]',
      iconBg: 'bg-[#FB7185]/12',
      title: 'text-[#D1D5DB]',
      value: 'text-[#FFFFFF]',
    },
    purple: {
      bg: '!bg-[#2C1E4A]',
      border: '!border-[#8B5CF6]',
      hover: 'hover:!border-[#C084FC] hover:shadow-[0_0_20px_rgba(192,132,252,0.25)]',
      iconText: 'text-[#C084FC]',
      iconBg: 'bg-[#C084FC]/12',
      title: 'text-[#D1D5DB]',
      value: 'text-[#FFFFFF]',
    },
    gold: {
      bg: '!bg-[#3A2A12]',
      border: '!border-[#7C5A13]',
      hover: 'hover:!border-[#EAB308] hover:shadow-[0_0_20px_rgba(250,204,21,0.18)]',
      iconText: 'text-[#FACC15]',
      iconBg: 'bg-[rgba(250,204,21,0.12)]',
      title: 'text-[#D1D5DB]',
      value: 'text-[#FFFFFF]',
    },
    rose: {
      bg: '!bg-[#3A1D2E]',
      border: '!border-[#BE185D]',
      hover: 'hover:!border-[#EC4899] hover:shadow-[0_0_20px_rgba(244,114,182,0.18)]',
      iconText: 'text-[#F472B6]',
      iconBg: 'bg-[rgba(244,114,182,0.12)]',
      title: 'text-[#D1D5DB]',
      value: 'text-[#FFFFFF]',
    },
  };

  const lightThemeMap = {
    indigo: {
      bg: 'bg-indigo-50/80',
      border: 'border-indigo-200/80',
      hover: 'hover:border-indigo-300 hover:shadow-md hover:shadow-indigo-500/10',
      iconText: 'text-indigo-600',
      iconBg: 'bg-indigo-100',
      title: 'text-slate-600',
      value: 'text-slate-900',
    },
    emerald: {
      bg: 'bg-emerald-50/80',
      border: 'border-emerald-200/80',
      hover: 'hover:border-emerald-300 hover:shadow-md hover:shadow-emerald-500/10',
      iconText: 'text-emerald-600',
      iconBg: 'bg-emerald-100',
      title: 'text-slate-600',
      value: 'text-slate-900',
    },
    amber: {
      bg: 'bg-amber-50/80',
      border: 'border-amber-200/80',
      hover: 'hover:border-amber-300 hover:shadow-md hover:shadow-amber-500/10',
      iconText: 'text-amber-600',
      iconBg: 'bg-amber-100',
      title: 'text-slate-600',
      value: 'text-slate-900',
    },
    blue: {
      bg: 'bg-blue-50/80',
      border: 'border-blue-200/80',
      hover: 'hover:border-blue-300 hover:shadow-md hover:shadow-blue-500/10',
      iconText: 'text-blue-600',
      iconBg: 'bg-blue-100',
      title: 'text-slate-600',
      value: 'text-slate-900',
    },
    red: {
      bg: 'bg-red-50/80',
      border: 'border-red-200/80',
      hover: 'hover:border-red-300 hover:shadow-md hover:shadow-red-500/10',
      iconText: 'text-red-600',
      iconBg: 'bg-red-100',
      title: 'text-slate-600',
      value: 'text-slate-900',
    },
    purple: {
      bg: 'bg-purple-50/80',
      border: 'border-purple-200/80',
      hover: 'hover:border-purple-300 hover:shadow-md hover:shadow-purple-500/10',
      iconText: 'text-purple-600',
      iconBg: 'bg-purple-100',
      title: 'text-slate-600',
      value: 'text-slate-900',
    },
    gold: {
      bg: 'bg-amber-50/80',
      border: 'border-amber-200/80',
      hover: 'hover:border-amber-300 hover:shadow-md hover:shadow-amber-500/10',
      iconText: 'text-amber-600',
      iconBg: 'bg-amber-100',
      title: 'text-slate-600',
      value: 'text-slate-900',
    },
    rose: {
      bg: 'bg-rose-50/80',
      border: 'border-rose-200/80',
      hover: 'hover:border-rose-300 hover:shadow-md hover:shadow-rose-500/10',
      iconText: 'text-rose-600',
      iconBg: 'bg-rose-100',
      title: 'text-slate-600',
      value: 'text-slate-900',
    },
  };

  const themeMap = isDarkMode ? darkThemeMap : lightThemeMap;
  const theme = themeMap[color] || themeMap.indigo;

  let glowClass = '';
  if (glow && isDarkMode) {
    if (color === 'gold') glowClass = 'shadow-[0_0_15px_rgba(250,204,21,0.25)] ring-1 ring-[#EAB308]/40';
    else if (color === 'rose' || color === 'red') glowClass = 'shadow-[0_0_15px_rgba(244,114,182,0.25)] ring-1 ring-[#EC4899]/40';
    else glowClass = 'shadow-[0_0_15px_rgba(255,255,255,0.15)]';
  } else if (!isDarkMode) {
    glowClass = 'shadow-sm';
  }

  const iconTextGlow = isDarkMode && glow && (color === 'gold' || color === 'rose')
    ? (color === 'gold' ? 'text-[#FDE047] drop-shadow-[0_0_6px_rgba(250,204,21,0.5)]' : 'text-[#FBCFE8] drop-shadow-[0_0_6px_rgba(244,114,182,0.5)]')
    : theme.iconText;

  const valueGlow = isDarkMode
    ? (glow && (color === 'gold' || color === 'rose')
        ? 'text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.6)]'
        : 'text-[#FFFFFF]')
    : 'text-slate-900 font-extrabold';

  return (
    <div
      onClick={isClickable ? handleClick : undefined}
      className={`relative overflow-hidden rounded-xl border px-5.5 py-3.5 backdrop-blur-xl transition-all duration-300 ${
        isClickable ? 'cursor-pointer hover:-translate-y-0.5 active:scale-[0.99] select-none' : ''
      } ${theme.bg} ${theme.border} ${theme.hover} ${glowClass} ${className}`}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className={`text-xxs font-semibold uppercase tracking-wider ${theme.title}`}>
            {title}
          </p>
          <h3 className={`mt-1 text-3xl font-extrabold tracking-tight ${valueGlow}`}>
            {value}
          </h3>
        </div>
        <div className={`rounded-lg p-2.5 shrink-0 ${theme.iconBg} ${iconTextGlow}`}>
          {icon}
        </div>
      </div>
    </div>
  );
};

export default StatsCard;
