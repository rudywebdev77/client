import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getRequests } from '../../../services/requestService';
import { FiPlus, FiSearch, FiFileText, FiEye, FiClock } from 'react-icons/fi';
import toast from 'react-hot-toast';

export const MyRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const data = await getRequests({ status, search, page, limit: 10 });
      if (data.success) {
        setRequests(data.requests);
        setTotalPages(data.pagination.pages);
      }
    } catch (err) {
      toast.error('Failed to load requests');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, [page, status]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchRequests();
  };

  const getStatusBadgeClass = (statusStr) => {
    switch (statusStr) {
      case 'new':
        return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
      case 'under_review':
        return 'bg-purple-500/10 text-purple-400 border-purple-500/20';
      case 'approved':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      case 'rejected':
        return 'bg-red-500/10 text-red-400 border-red-500/20';
      case 'converted':
        return 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20';
      default:
        return 'bg-slate-500/10 text-slate-400 border-slate-500/20';
    }
  };

  const getPriorityBadgeClass = (prio) => {
    switch (prio) {
      case 'high':
        return 'bg-red-500/10 text-red-400 border-red-500/25';
      case 'medium':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/25';
      default:
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/25';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">My Work Requests</h1>
          <p className="text-sm text-slate-400">Track and review requests submitted to admins.</p>
        </div>
        <Link
          to="/client/requests/new"
          className="flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition-all hover:bg-indigo-500 shadow-md shadow-indigo-600/10"
        >
          <FiPlus className="h-5 w-5" /> Submit Request
        </Link>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-4 rounded-xl border border-slate-800 bg-slate-950/40 p-4 backdrop-blur-xl md:flex-row md:items-center md:justify-between">
        <form onSubmit={handleSearchSubmit} className="relative flex-1 max-w-md">
          <input
            type="text"
            placeholder="Search request number, title..."
            className="w-full rounded-lg border border-slate-800 bg-slate-900/50 py-2 pl-10 pr-4 text-sm text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <button type="submit" className="absolute top-2.5 left-3 text-slate-500 hover:text-slate-300">
            <FiSearch className="h-4.5 w-4.5" />
          </button>
        </form>

        <select
          value={status}
          onChange={(e) => {
            setStatus(e.target.value);
            setPage(1);
          }}
          className="rounded-lg border border-slate-800 bg-slate-900/50 px-3 py-2 text-sm text-white focus:border-indigo-500 focus:outline-none"
        >
          <option value="">All Statuses</option>
          <option value="new">New</option>
          <option value="under_review">Under Review</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
          <option value="converted">Converted to Project</option>
          <option value="closed">Closed</option>
        </select>
      </div>

      {/* List / Table */}
      <div className="overflow-hidden rounded-xl border border-slate-800 bg-slate-950/40 shadow-xl">
        {loading ? (
          <div className="flex h-64 items-center justify-center">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent"></div>
          </div>
        ) : requests.length === 0 ? (
          <div className="flex h-64 flex-col items-center justify-center text-slate-500">
            <FiFileText className="h-12 w-12 text-slate-650 mb-3" />
            <p className="text-lg">No requests found</p>
            <p className="text-sm">You haven't submitted any requests matching these criteria.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-sm text-slate-300">
              <thead className="bg-slate-900/80 text-xs font-semibold uppercase tracking-wider text-slate-400">
                <tr>
                  <th className="px-6 py-4">Request No</th>
                  <th className="px-6 py-4">Title</th>
                  <th className="px-6 py-4">Priority</th>
                  <th className="px-6 py-4">Deadline</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {requests.map((req) => (
                  <tr key={req._id} className="hover:bg-slate-900/20 transition-colors">
                    <td className="px-6 py-4 font-semibold text-white">{req.requestNo}</td>
                    <td className="px-6 py-4">
                      <div>
                        <div className="font-semibold text-white">{req.title}</div>
                        <div className="text-xs text-slate-400">{req.service}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xxs font-semibold uppercase tracking-wider border ${getPriorityBadgeClass(req.priority)}`}>
                        {req.priority}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-400 flex items-center gap-1.5 pt-6">
                      <FiClock className="h-4 w-4 text-slate-550" />
                      {new Date(req.deadline).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xxs font-semibold uppercase tracking-wider border ${getStatusBadgeClass(req.status)}`}>
                        {req.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <Link
                        to={`/client/requests/${req._id}`}
                        title="View Details"
                        className="inline-flex rounded-lg p-1.5 hover:bg-indigo-500/10 hover:text-indigo-400 transition-colors"
                      >
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
        {totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-slate-800/80 px-6 py-4">
            <button
              onClick={() => setPage((p) => Math.max(p - 1, 1))}
              disabled={page === 1}
              className="rounded-lg border border-slate-800 bg-slate-900 px-3 py-1.5 text-xs font-semibold text-slate-300 transition-colors hover:bg-slate-850 disabled:opacity-50"
            >
              Previous
            </button>
            <span className="text-xs text-slate-400">
              Page <span className="font-semibold text-white">{page}</span> of {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
              disabled={page === totalPages}
              className="rounded-lg border border-slate-800 bg-slate-900 px-3 py-1.5 text-xs font-semibold text-slate-300 transition-colors hover:bg-slate-850 disabled:opacity-50"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
export default MyRequests;
