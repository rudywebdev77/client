import React, { useState, useEffect } from 'react';
import { getAdminDashboard } from '../../services/dashboardService';
import StatsCard from '../../components/dashboard/StatsCard';
import RecentActivity from '../../components/dashboard/RecentActivity';
import DeadlineList from '../../components/dashboard/DeadlineList';
import { FiUsers, FiUserCheck, FiFileText, FiFolder, FiAlertCircle, FiActivity } from 'react-icons/fi';
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
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
          <StatsCard
            title="Total Clients"
            value={stats.totalClients ?? 0}
            icon={<FiUsers className="h-6 w-6" />}
            color="indigo"
            to="/admin/users?role=client"
          />
          <StatsCard
            title="Total Staff"
            value={stats.totalStaff ?? 0}
            icon={<FiUserCheck className="h-6 w-6" />}
            color="emerald"
            to="/admin/users?role=staff"
          />
          <StatsCard
            title="New Requests"
            value={stats.newRequests ?? 0}
            icon={<FiFileText className="h-6 w-6" />}
            color="amber"
            to="/admin/requests?status=new"
          />
          <StatsCard
            title="Active Projects"
            value={stats.activeProjects ?? 0}
            icon={<FiFolder className="h-6 w-6" />}
            color="blue"
            to="/admin/projects?status=active"
          />
          <StatsCard
            title="Pending Reviews"
            value={stats.pendingReviews ?? 0}
            icon={<FiAlertCircle className="h-6 w-6" />}
            color="red"
            to="/admin/projects?status=under_review"
          />
          <StatsCard
            title="Total Activities"
            value={stats.totalActivities ?? (activities ? activities.length : 0)}
            icon={<FiActivity className="h-6 w-6" />}
            color="purple"
            to="/admin/activity"
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
