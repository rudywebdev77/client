import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { getProjects, acceptProject } from '../../../services/projectService';
import { FiClock, FiFolder, FiCheckCircle, FiPlay, FiSearch } from 'react-icons/fi';
import toast from 'react-hot-toast';

const STATUS_BADGES = {
  assigned: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  in_progress: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
  under_review: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
  revision_required: 'bg-red-500/10 text-red-400 border-red-500/20',
  completed: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
};

export const MyProjects = () => {
  const [searchParams] = useSearchParams();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState(searchParams.get('status') || 'all');

  const fetchProjects = async () => {
    setLoading(true);
    try {
      const res = await getProjects();
      if (res.success) setProjects(res.projects);
    } catch (err) {
      toast.error('Failed to load assigned projects');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchProjects(); }, []);

  const filteredProjects = projects.filter((proj) => {
    const cleanSearch = search.trim().toLowerCase();
    const matchesSearch = !cleanSearch ||
      proj.projectName?.toLowerCase().includes(cleanSearch) ||
      proj.description?.toLowerCase().includes(cleanSearch) ||
      proj.client?.fullName?.toLowerCase().includes(cleanSearch);

    let matchesStatus = true;
    if (statusFilter !== 'all') {
      if (statusFilter === 'pending') {
        matchesStatus = ['assigned', 'not_started', 'in_progress', 'revision_required'].includes(proj.status);
      } else {
        matchesStatus = proj.status === statusFilter;
      }
    }

    return matchesSearch && matchesStatus;
  });

  const handleAccept = async (id, e) => {
    e.preventDefault();
    try {
      const res = await acceptProject(id);
      if (res.success) {
        toast.success('Project accepted!');
        fetchProjects();
      }
    } catch (err) {
      toast.error('Failed to accept project');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">My Assigned Projects</h1>
          <p className="text-sm text-slate-400">View and update your active work assignments.</p>
        </div>

        {/* Search & Filter Bar */}
        <div className="flex items-center gap-3">
          <div className="relative">
            <input
              type="text"
              placeholder="Search projects..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full sm:w-64 rounded-xl border border-slate-800 bg-slate-950/40 py-2 pl-9 pr-4 text-xs text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
            <FiSearch className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-500" />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-xl border border-slate-800 bg-slate-950/40 px-3 py-2 text-xs text-white focus:border-indigo-500 focus:outline-none"
          >
            <option value="all">All Statuses</option>
            <option value="assigned">Assigned</option>
            <option value="in_progress">In Progress</option>
            <option value="pending">Pending Tasks</option>
            <option value="under_review">Under Review</option>
            <option value="completed">Completed</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="flex h-64 items-center justify-center"><div className="h-10 w-10 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent"></div></div>
      ) : filteredProjects.length === 0 ? (
        <div className="flex h-64 flex-col items-center justify-center text-slate-500"><p className="text-lg">No projects found matching your filter.</p></div>
      ) : (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
          {filteredProjects.map((proj) => (
            <div key={proj._id} className="flex flex-col justify-between rounded-xl border border-slate-800 bg-slate-950/40 p-5 backdrop-blur-xl shadow-lg hover:border-slate-700 transition-colors">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className={`rounded-full border px-2.5 py-0.5 text-xxs font-semibold uppercase ${STATUS_BADGES[proj.status] || 'bg-slate-800 text-slate-400'}`}>
                    {proj.status.replace('_', ' ')}
                  </span>
                  <span className="text-xxs font-semibold uppercase text-slate-400">Prio: {proj.priority}</span>
                </div>
                <h3 className="text-lg font-bold text-white leading-tight">{proj.projectName}</h3>
                <p className="text-xs text-slate-400 line-clamp-2">{proj.description}</p>
                <div className="text-xs text-slate-500 pt-2 border-t border-slate-800/80">
                  <p>Client: <span className="text-slate-300 font-medium">{proj.client?.fullName}</span></p>
                  <p className="flex items-center gap-1 mt-1"><FiClock /> Deadline: {new Date(proj.deadline).toLocaleDateString()}</p>
                </div>
              </div>

              <div className="mt-5 flex gap-2 pt-3 border-t border-slate-800/80">
                {proj.status === 'assigned' && (
                  <button onClick={(e) => handleAccept(proj._id, e)} className="flex-1 flex items-center justify-center gap-1.5 rounded-lg bg-emerald-600 py-2 text-xs font-semibold text-white hover:bg-emerald-500">
                    <FiPlay /> Accept
                  </button>
                )}
                <Link to={`/staff/projects/${proj._id}`} className="flex-1 text-center rounded-lg bg-indigo-600 py-2 text-xs font-semibold text-white hover:bg-indigo-500 transition-colors">
                  Open Project
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
export default MyProjects;
