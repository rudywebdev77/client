import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getProjects } from '../../../services/projectService';
import { FiFolder, FiClock, FiEye } from 'react-icons/fi';
import toast from 'react-hot-toast';

const STATUS_BADGES = {
  not_started: 'bg-slate-500/10 text-slate-400 border-slate-500/20',
  assigned: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  in_progress: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
  waiting_for_client: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  under_review: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
  revision_required: 'bg-red-500/10 text-red-400 border-red-500/20',
  completed: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
};

export const MyProjects = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const res = await getProjects();
        if (res.success) setProjects(res.projects);
      } catch (err) {
        toast.error('Failed to load projects');
      } finally {
        setLoading(false);
      }
    };
    fetchProjects();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">My Active & Completed Projects</h1>
        <p className="text-sm text-slate-400">Track progress, chat with team, and review deliverables.</p>
      </div>

      {loading ? (
        <div className="flex h-64 items-center justify-center"><div className="h-10 w-10 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent"></div></div>
      ) : projects.length === 0 ? (
        <div className="flex h-64 flex-col items-center justify-center text-slate-500"><p className="text-lg">No active projects yet.</p></div>
      ) : (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
          {projects.map((proj) => (
            <div key={proj._id} className="flex flex-col justify-between rounded-xl border border-slate-800 bg-slate-950/40 p-5 backdrop-blur-xl shadow-lg">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className={`rounded-full border px-2.5 py-0.5 text-xxs font-semibold uppercase ${STATUS_BADGES[proj.status] || 'bg-slate-800 text-slate-400'}`}>
                    {proj.status.replace('_', ' ')}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-white leading-tight">{proj.projectName}</h3>
                <p className="text-xs text-slate-400 line-clamp-2">{proj.description}</p>
                <div className="text-xs text-slate-500 pt-2 border-t border-slate-800/80">
                  <p className="flex items-center gap-1"><FiClock /> Expected: {new Date(proj.deadline).toLocaleDateString()}</p>
                </div>
              </div>

              <div className="mt-5 pt-3 border-t border-slate-800/80">
                <Link to={`/client/projects/${proj._id}`} className="flex items-center justify-center gap-2 w-full rounded-lg bg-indigo-600 py-2 text-xs font-semibold text-white hover:bg-indigo-500 transition-colors">
                  <FiEye /> View Project Workspace
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
