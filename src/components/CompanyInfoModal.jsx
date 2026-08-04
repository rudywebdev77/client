import React from 'react';
import { useCompany } from '../context/CompanyContext';
import {
  FiX,
  FiGlobe,
  FiMail,
  FiSmartphone,
  FiMapPin,
  FiCalendar,
  FiCheckSquare,
  FiExternalLink,
  FiInfo,
} from 'react-icons/fi';

export const CompanyInfoModal = () => {
  const {
    companyName,
    companyLogo,
    supportEmail,
    supportPhone,
    website,
    companyAddress,
    companyDescription,
    companyCreatedAt,
    getCompanyLogoUrl,
    isCompanyModalOpen,
    closeCompanyModal,
  } = useCompany();

  if (!isCompanyModalOpen) return null;

  const logoUrl = getCompanyLogoUrl();
  const formattedDate = companyCreatedAt
    ? new Date(companyCreatedAt).toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      })
    : 'Established Company';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-lg rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 p-6 md:p-8 shadow-2xl transition-all">
        {/* Header Bar */}
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800/80 pb-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-indigo-500/10 p-2.5 text-indigo-600 dark:text-indigo-400">
              <FiInfo className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">Company Overview</h2>
              <p className="text-xxs text-slate-500 dark:text-slate-400 font-medium">Organization details & support contacts</p>
            </div>
          </div>

          <button
            onClick={closeCompanyModal}
            className="rounded-full p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-700 dark:hover:text-white transition"
            title="Close"
          >
            <FiX className="h-5 w-5" />
          </button>
        </div>

        {/* Company Identity Banner */}
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 p-4 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800/80 mb-6">
          <div className="shrink-0">
            {logoUrl ? (
              <img
                src={logoUrl}
                alt={companyName}
                className="h-16 w-16 rounded-2xl object-cover border border-slate-200 dark:border-slate-700 shadow-md"
              />
            ) : (
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-tr from-indigo-500 to-purple-500 text-white shadow-md">
                <FiCheckSquare className="h-8 w-8" />
              </div>
            )}
          </div>

          <div className="space-y-1 text-center sm:text-left min-w-0 flex-1">
            <h3 className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight truncate">{companyName || 'Work Portal'}</h3>
            <p className="text-xxs font-semibold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
              Verified Organization
            </p>
            {companyDescription && (
              <p className="text-xs text-slate-600 dark:text-slate-300 pt-1 leading-relaxed">{companyDescription}</p>
            )}
          </div>
        </div>

        {/* Details Grid */}
        <div className="space-y-3.5 mb-6 text-xs">
          {/* Support Email */}
          <div className="flex items-center justify-between p-3 rounded-xl border border-slate-200 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900/40">
            <span className="font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-2">
              <FiMail className="h-4 w-4 text-indigo-500" /> Support Email
            </span>
            {supportEmail ? (
              <a
                href={`mailto:${supportEmail}`}
                className="font-bold text-indigo-600 dark:text-indigo-400 hover:underline truncate max-w-[220px]"
              >
                {supportEmail}
              </a>
            ) : (
              <span className="text-slate-400 dark:text-slate-500 font-medium">Not specified</span>
            )}
          </div>

          {/* Support Phone */}
          <div className="flex items-center justify-between p-3 rounded-xl border border-slate-200 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900/40">
            <span className="font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-2">
              <FiSmartphone className="h-4 w-4 text-emerald-500" /> Support Phone
            </span>
            {supportPhone ? (
              <a
                href={`tel:${supportPhone}`}
                className="font-bold text-slate-900 dark:text-slate-200 hover:underline"
              >
                {supportPhone}
              </a>
            ) : (
              <span className="text-slate-400 dark:text-slate-500 font-medium">Not specified</span>
            )}
          </div>

          {/* Website */}
          <div className="flex items-center justify-between p-3 rounded-xl border border-slate-200 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900/40">
            <span className="font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-2">
              <FiGlobe className="h-4 w-4 text-sky-500" /> Website
            </span>
            {website ? (
              <a
                href={website.startsWith('http') ? website : `https://${website}`}
                target="_blank"
                rel="noopener noreferrer"
                className="font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 truncate max-w-[220px]"
              >
                {website} <FiExternalLink className="h-3 w-3 shrink-0" />
              </a>
            ) : (
              <span className="text-slate-400 dark:text-slate-500 font-medium">Not specified</span>
            )}
          </div>

          {/* Company Address */}
          {companyAddress && (
            <div className="flex flex-col p-3 rounded-xl border border-slate-200 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900/40 space-y-1">
              <span className="font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-2">
                <FiMapPin className="h-4 w-4 text-amber-500" /> Office Address
              </span>
              <p className="font-medium text-slate-800 dark:text-slate-200 pl-6 leading-relaxed">
                {companyAddress}
              </p>
            </div>
          )}

          {/* Established Date */}
          <div className="flex items-center justify-between p-3 rounded-xl border border-slate-200 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900/40">
            <span className="font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-2">
              <FiCalendar className="h-4 w-4 text-purple-500" /> Company Established
            </span>
            <span className="font-bold text-slate-800 dark:text-slate-200">{formattedDate}</span>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800/80">
          {website && (
            <a
              href={website.startsWith('http') ? website : `https://${website}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-bold text-white shadow-md shadow-indigo-600/20 hover:bg-indigo-500 transition"
            >
              <span>Visit Website</span>
              <FiExternalLink className="h-3.5 w-3.5" />
            </a>
          )}
          <button
            onClick={closeCompanyModal}
            className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900 px-5 py-2.5 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
