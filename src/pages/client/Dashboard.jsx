import React, { useState, useEffect } from 'react';
import { getClientDashboard } from '../../services/dashboardService';
import StatsCard from '../../components/dashboard/StatsCard';
import RecentActivity from '../../components/dashboard/RecentActivity';
import { FiPlusCircle, FiFileText, FiFolder, FiCheckCircle } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';

export const ClientDashboard = () => {
  const [stats, setStats] = useState(null);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const res = await getClientDashboard();
        if (res.success) {
          setStats(res.stats);
          setActivities(res.recentActivity);
        }
      } catch (err) {
        toast.error('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Client Portal</h1>
          <p className="text-sm text-slate-400">Submit requests and monitor project progression in real-time.</p>
        </div>
        <Link
          to="/client/requests/new"
          className="flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition-all hover:bg-indigo-500 shadow-md shadow-indigo-600/10"
        >
          <FiPlusCircle className="h-5 w-5" /> Submit New Request
        </Link>
      </div>

      {stats && (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <StatsCard
            title="Submitted Requests"
            value={stats.submittedRequests}
            icon={<FiFileText className="h-6 w-6 text-indigo-400" />}
            color="indigo"
          />
          <StatsCard
            title="Active Projects"
            value={stats.activeProjects}
            icon={<FiFolder className="h-6 w-6 text-blue-400" />}
            color="blue"
          />
          <StatsCard
            title="Completed Projects"
            value={stats.completedProjects}
            icon={<FiCheckCircle className="h-6 w-6 text-emerald-400" />}
            color="emerald"
          />
          <StatsCard
            title="Shared Files"
            value={stats.totalFiles}
            icon={<FiFileText className="h-6 w-6 text-purple-400" />}
            color="purple"
          />
        </div>
      )}

      <div className="grid grid-cols-1 gap-6">
        <RecentActivity activities={activities} />
      </div>
    </div>
  );
};
export default ClientDashboard;
