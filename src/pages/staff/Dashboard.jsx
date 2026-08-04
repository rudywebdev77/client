import React, { useState, useEffect } from 'react';
import { getStaffDashboard } from '../../services/dashboardService';
import StatsCard from '../../components/dashboard/StatsCard';
import RecentActivity from '../../components/dashboard/RecentActivity';
import DeadlineList from '../../components/dashboard/DeadlineList';
import { FiFolder, FiPlusCircle, FiCheckSquare, FiAlertCircle, FiCheckCircle } from 'react-icons/fi';
import toast from 'react-hot-toast';

export const StaffDashboard = () => {
  const [stats, setStats] = useState(null);
  const [deadlines, setDeadlines] = useState([]);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const res = await getStaffDashboard();
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
        <h1 className="text-2xl font-bold text-white tracking-tight">Staff Space</h1>
        <p className="text-sm text-slate-400">Manage your active assignments and review feedback.</p>
      </div>

      {stats && (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
          <StatsCard
            title="Assigned Projects"
            value={stats.assignedProjects ?? 0}
            icon={<FiFolder className="h-6 w-6 text-indigo-400" />}
            color="indigo"
            to="/staff/projects"
          />
          <StatsCard
            title="New Assignments"
            value={stats.newAssignments ?? 0}
            icon={<FiPlusCircle className="h-6 w-6 text-amber-400" />}
            color="amber"
            to="/staff/projects?status=assigned"
          />
          <StatsCard
            title="Pending Tasks"
            value={stats.pendingTasks ?? 0}
            icon={<FiCheckSquare className="h-6 w-6 text-blue-400" />}
            color="blue"
            to="/staff/projects?status=pending"
          />
          <StatsCard
            title="Waiting Review"
            value={stats.waitingForReview ?? 0}
            icon={<FiAlertCircle className="h-6 w-6" />}
            color="rose"
            glow={(stats.waitingForReview ?? 0) > 0}
            className="lg:col-span-2"
            to="/staff/projects?status=under_review"
          />
          <StatsCard
            title="Completed Tasks"
            value={stats.completedTasks ?? 0}
            icon={<FiCheckCircle className="h-6 w-6 text-emerald-400" />}
            color="emerald"
            className="lg:col-span-1"
            to="/staff/projects?status=completed"
          />
        </div>
      )}

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
export default StaffDashboard;
