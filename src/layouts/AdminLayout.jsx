import React from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from '../components/Sidebar';
import { Topbar } from '../components/Topbar';

export const AdminLayout = () => {
  return (
    <div className="flex min-h-screen w-full flex-col md:flex-row bg-slate-900 text-slate-100">
      {/* Sidebar - fixed on left for desktop, bottom for mobile */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col overflow-x-hidden pb-16 md:pb-0">
        <Topbar />
        <main className="flex-1 p-4 md:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
