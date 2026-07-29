import React, { useState, useEffect } from 'react';
import { getStaffDashboard } from '../../services/dashboardService';
import StatsCard from '../../components/dashboard/StatsCard';
import RecentActivity from '../../components/dashboard/RecentActivity';
import DeadlineList from '../../components/dashboard/DeadlineList';
import { FiFolder, FiPlusCircle, FiCheckSquare, FiAlertCircle } from 'react-icons/fi';
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
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <StatsCard
            title="Assigned Projects"
            value={stats.assignedProjects}
            icon={<FiFolder className="h-6 w-6 text-indigo-400" />}
            color="indigo"
          />
          <StatsCard
            title="New Assignments"
            value={stats.newAssignments}
            icon={<FiPlusCircle className="h-6 w-6 text-amber-400" />}
            color="amber"
          />
          <StatsCard
            title="Pending Tasks"
            value={stats.pendingTasks}
            icon={<FiCheckSquare className="h-6 w-6 text-blue-400" />}
            color="blue"
          />
          <StatsCard
            title="Waiting Review"
            value={stats.waitingForReview}
            icon={<FiAlertCircle className="h-6 w-6 text-purple-400" />}
            color="purple"
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
