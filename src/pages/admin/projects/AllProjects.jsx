import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { getProjects } from '../../../services/projectService';
import { FiPlus, FiSearch, FiFolder, FiEye, FiClock, FiUsers } from 'react-icons/fi';
import toast from 'react-hot-toast';
import TablePagination from '../../../components/shared/TablePagination';

const STATUS_BADGES = {
  not_started: 'bg-slate-500/10 text-slate-400 border-slate-500/20',
  assigned: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  in_progress: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
  waiting_for_client: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  under_review: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
  revision_required: 'bg-red-500/10 text-red-400 border-red-500/20',
  completed: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  cancelled: 'bg-slate-500/10 text-slate-500 border-slate-500/20',
};

export const AllProjects = () => {
  const [searchParams] = useSearchParams();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState(searchParams.get('status') || '');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  const fetchProjects = async () => {
    setLoading(true);
    try {
      const data = await getProjects({ status, search, page, limit: pageSize });
      if (data.success) {
        setProjects(data.projects);
        setTotalPages(data.pagination.pages);
        setTotal(data.pagination.total);
      }
    } catch (err) {
      toast.error('Failed to load projects');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setPage(1);
  }, [search, status]);

  useEffect(() => {
    fetchProjects();
  }, [page, status, pageSize, search]);

  const handleSearchSubmit = (e) => { e.preventDefault(); setPage(1); fetchProjects(); };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Project Management</h1>
          <p className="text-sm text-slate-400">Track and assign all ongoing client projects.</p>
        </div>
        <Link
          to="/admin/projects/new"
          className="flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition-all hover:bg-indigo-500 shadow-md shadow-indigo-600/10"
        >
          <FiPlus className="h-5 w-5" /> Create Project
        </Link>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-4 rounded-xl border border-slate-800 bg-slate-950/40 p-4 backdrop-blur-xl md:flex-row md:items-center">
        <form onSubmit={handleSearchSubmit} className="relative flex-1 max-w-md">
          <input
            type="text"
            placeholder="Search project name..."
            className="w-full rounded-lg border border-slate-800 bg-slate-900/50 py-2 pl-10 pr-4 text-sm text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <button type="submit" className="absolute top-2.5 left-3 text-slate-500"><FiSearch /></button>
        </form>

        <select
          value={status}
          onChange={(e) => { setStatus(e.target.value); setPage(1); }}
          className="rounded-lg border border-slate-800 bg-slate-900/50 px-3 py-2 text-sm text-white focus:border-indigo-500 focus:outline-none"
        >
          <option value="">All Statuses</option>
          <option value="not_started">Not Started</option>
          <option value="assigned">Assigned</option>
          <option value="in_progress">In Progress</option>
          <option value="under_review">Under Review</option>
          <option value="revision_required">Revision Required</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-xl border border-slate-800 bg-slate-950/40 shadow-xl">
        {loading ? (
          <div className="flex h-64 items-center justify-center">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent"></div>
          </div>
        ) : projects.length === 0 ? (
          <div className="flex h-64 flex-col items-center justify-center text-slate-500">
            <p className="text-lg">No projects found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-sm text-slate-300">
              <thead className="bg-slate-900/80 text-xs font-semibold uppercase tracking-wider text-slate-400">
                <tr>
                  <th className="px-6 py-4">Project Name</th>
                  <th className="px-6 py-4">Client</th>
                  <th className="px-6 py-4">Assigned Staff</th>
                  <th className="px-6 py-4">Deadline</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {projects.map((proj) => (
                  <tr key={proj._id} className="hover:bg-slate-900/20 transition-colors">
                    <td className="px-6 py-4 font-semibold text-white">{proj.projectName}</td>
                    <td className="px-6 py-4 text-slate-300">{proj.client?.fullName}</td>
                    <td className="px-6 py-4 text-xs text-slate-400">
                      {proj.assignedStaff?.length > 0
                        ? proj.assignedStaff.map(s => s.fullName).join(', ')
                        : 'Unassigned'}
                    </td>
                    <td className="px-6 py-4 text-slate-400">
                      <span className="flex items-center gap-1"><FiClock className="h-3.5 w-3.5" />{new Date(proj.deadline).toLocaleDateString()}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`rounded-full border px-2.5 py-0.5 text-xxs font-semibold uppercase ${STATUS_BADGES[proj.status]}`}>
                        {proj.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <Link to={`/admin/projects/${proj._id}`} className="inline-flex rounded-lg p-1.5 hover:bg-indigo-500/10 hover:text-indigo-400 transition-colors">
                        <FiEye className="h-4.5 w-4.5" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {!loading && (
          <TablePagination
            page={page}
            totalPages={totalPages}
            total={total}
            pageSize={pageSize}
            onPageChange={setPage}
            onPageSizeChange={(size) => { setPageSize(size); setPage(1); }}
          />
        )}
      </div>
    </div>
  );
};
export default AllProjects;
