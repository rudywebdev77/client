import React, { useState, useEffect } from 'react';
import { getProjectReports, getUserReports } from '../../services/reportService';
import StatsCard from '../../components/dashboard/StatsCard';
import TablePagination from '../../components/shared/TablePagination';
import { FiPieChart, FiCheckCircle, FiFolder, FiUsers, FiClock, FiSearch } from 'react-icons/fi';
import toast from 'react-hot-toast';

export const Reports = () => {
  const [projectData, setProjectData] = useState(null);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const pRes = await getProjectReports();
        if (pRes.success) setProjectData(pRes);

        const uRes = await getUserReports();
        if (uRes.success) setUserData(uRes);
      } catch (err) {
        toast.error('Failed to load reports');
      } finally {
        setLoading(false);
      }
    };
    fetchReports();
  }, []);

  // Reset page to 1 on search change
  useEffect(() => {
    setPage(1);
  }, [search]);

  if (loading) return <div className="flex h-64 items-center justify-center"><div className="h-10 w-10 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent"></div></div>;
 
  // Client-side filtering & pagination on projects report list
  const allProjects = projectData?.projects || [];
  const filteredProjects = allProjects.filter((p) => {
    if (!search.trim()) return true;
    const cleanSearch = search.trim().toLowerCase();
    const matchName = p.projectName?.toLowerCase().includes(cleanSearch);
    const matchClient = p.client?.fullName?.toLowerCase().includes(cleanSearch);
    const matchStaff = p.assignedStaff?.some(s => s.fullName?.toLowerCase().includes(cleanSearch));
    const matchStatus = p.status?.toLowerCase().includes(cleanSearch);
    return matchName || matchClient || matchStaff || matchStatus;
  });

  const total = filteredProjects.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const paginatedProjects = filteredProjects.slice((page - 1) * pageSize, page * pageSize);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Analytics & Reports</h1>
        <p className="text-sm text-slate-400">Complete breakdown of system performance, project statuses, and user distribution.</p>
      </div>

      {projectData?.summary && (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <StatsCard title="Total Projects" value={projectData.summary.totalProjects} icon={<FiFolder className="h-6 w-6 text-indigo-400" />} color="indigo" />
          <StatsCard title="Completed Projects" value={projectData.summary.completed} icon={<FiCheckCircle className="h-6 w-6 text-emerald-400" />} color="emerald" />
          <StatsCard title="In Progress" value={projectData.summary.inProgress} icon={<FiClock className="h-6 w-6 text-purple-400" />} color="purple" />
          <StatsCard title="Under Review" value={projectData.summary.underReview} icon={<FiPieChart className="h-6 w-6 text-amber-400" />} color="amber" />
        </div>
      )}

      {/* Projects breakdown table */}
      <div className="overflow-hidden rounded-xl border border-slate-800 bg-slate-950/40 shadow-xl">
        <div className="flex flex-col gap-3 px-6 pt-5 pb-3 sm:flex-row sm:items-center sm:justify-between">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">All Projects Overview Report</h3>
          <div className="relative max-w-xs w-full">
            <input
              type="text"
              placeholder="Search reports..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-lg border border-slate-800 bg-slate-900/50 py-1.5 pl-9 pr-3 text-xs text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
            <FiSearch className="absolute left-3 top-2 h-3.5 w-3.5 text-slate-500" />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left text-sm text-slate-300">
            <thead className="bg-slate-900/80 text-xs font-semibold uppercase text-slate-400">
              <tr>
                <th className="px-4 py-3">Project</th>
                <th className="px-4 py-3">Client</th>
                <th className="px-4 py-3">Staff</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Deadline</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {paginatedProjects.map((p) => (
                <tr key={p._id} className="hover:bg-slate-900/20">
                  <td className="px-4 py-3 font-semibold text-white">{p.projectName}</td>
                  <td className="px-4 py-3 text-slate-300">{p.client?.fullName}</td>
                  <td className="px-4 py-3 text-slate-400">{p.assignedStaff?.map(s => s.fullName).join(', ') || 'Unassigned'}</td>
                  <td className="px-4 py-3 capitalize text-xs font-semibold">{p.status.replace('_', ' ')}</td>
                  <td className="px-4 py-3 text-slate-400">{new Date(p.deadline).toLocaleDateString()}</td>
                </tr>
              ))}
              {paginatedProjects.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-slate-500 text-sm">No projects to display.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <TablePagination
          page={page}
          totalPages={totalPages}
          total={total}
          pageSize={pageSize}
          onPageChange={setPage}
          onPageSizeChange={(size) => { setPageSize(size); setPage(1); }}
        />
      </div>
    </div>
  );
};
export default Reports;
