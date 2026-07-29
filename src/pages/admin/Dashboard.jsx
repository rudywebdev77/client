import React, { useState, useEffect } from 'react';
import { getAdminDashboard } from '../../services/dashboardService';
import StatsCard from '../../components/dashboard/StatsCard';
import RecentActivity from '../../components/dashboard/RecentActivity';
import DeadlineList from '../../components/dashboard/DeadlineList';
import { FiUsers, FiFileText, FiFolder, FiAlertCircle, FiPieChart } from 'react-icons/fi';
import toast from 'react-hot-toast';

export const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [deadlines, setDeadlines] = useState([]);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const res = await getAdminDashboard();
        if (res.success) {
          setStats(res.stats);
          setDeadlines(res.upcomingDeadlines);
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
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Admin Space</h1>
        <p className="text-sm text-slate-400">Overview of users, requests, projects, and activities.</p>
      </div>

      {stats && (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <StatsCard
            title="Total Users"
            value={stats.totalUsers}
            icon={<FiUsers className="h-6 w-6 text-indigo-400" />}
            color="indigo"
          />
          <StatsCard
            title="New Requests"
            value={stats.newRequests}
            icon={<FiFileText className="h-6 w-6 text-amber-400" />}
            color="amber"
          />
          <StatsCard
            title="Active Projects"
            value={stats.activeProjects}
            icon={<FiFolder className="h-6 w-6 text-blue-400" />}
            color="blue"
          />
          <StatsCard
            title="Pending Reviews"
            value={stats.pendingReviews}
            icon={<FiAlertCircle className="h-6 w-6 text-red-400" />}
            color="red"
          />
        </div>
      )}

      {/* Details Row */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <RecentActivity activities={activities} />
        </div>
        <div>
          <DeadlineList deadlines={deadlines} />
        </div>
      </div>
    </div>
  );
};
export default AdminDashboard;
