import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { createProject } from '../../../services/projectService';
import { getUsers } from '../../../services/userService';
import { getRequest } from '../../../services/requestService';
import FileUpload from '../../../components/FileUpload';
import toast from 'react-hot-toast';
import { FiArrowLeft, FiFolderPlus, FiSearch, FiX, FiPlus } from 'react-icons/fi';

export const CreateProject = () => {
  const [searchParams] = useSearchParams();
  const requestId = searchParams.get('requestId');
  const clientIdParam = searchParams.get('clientId');

  const [projectName, setProjectName] = useState('');
  const [description, setDescription] = useState('');
  const [clientId, setClientId] = useState(clientIdParam || '');
  const [assignedStaff, setAssignedStaff] = useState([]);
  const [staffSearch, setStaffSearch] = useState('');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [deadline, setDeadline] = useState('');
  const [priority, setPriority] = useState('medium');
  const [budget, setBudget] = useState('');
  const [deliverables, setDeliverables] = useState('');
  const [instructions, setInstructions] = useState('');
  const [status, setStatus] = useState('not_started');
  const [files, setFiles] = useState([]);

  const [clients, setClients] = useState([]);
  const [staffList, setStaffList] = useState([]);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const cRes = await getUsers({ role: 'client', limit: 100 });
        if (cRes.success) setClients(cRes.users);

        const sRes = await getUsers({ role: 'staff', limit: 100 });
        if (sRes.success) setStaffList(sRes.users);
      } catch (err) {
        toast.error('Failed to load user lists');
      }
    };
    fetchUsers();
  }, []);

  useEffect(() => {
    if (requestId) {
      const fetchReq = async () => {
        try {
          const res = await getRequest(requestId);
          if (res.success && res.request) {
            const req = res.request;
            setProjectName(req.title);
            setDescription(req.description);
            if (req.client?._id) setClientId(req.client._id);
            if (req.deadline) setDeadline(new Date(req.deadline).toISOString().split('T')[0]);
            if (req.priority) setPriority(req.priority);
            if (req.budget) setBudget(req.budget);
            if (req.instructions) setInstructions(req.instructions);
          }
        } catch (err) {
          console.error(err);
        }
      };
      fetchReq();
    }
  }, [requestId]);

  const handleStaffToggle = (id) => {
    setAssignedStaff(prev =>
      prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!projectName || !description || !clientId || !deadline) {
      toast.error('Please fill in all required fields');
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('projectName', projectName);
      formData.append('description', description);
      formData.append('clientId', clientId);
      if (requestId) formData.append('requestId', requestId);
      formData.append('staffIds', JSON.stringify(assignedStaff));
      formData.append('startDate', startDate);
      formData.append('deadline', deadline);
      formData.append('priority', priority);
      formData.append('budget', budget);
      formData.append('deliverables', deliverables);
      formData.append('instructions', instructions);
      formData.append('status', assignedStaff.length > 0 && status === 'not_started' ? 'assigned' : status);

      files.forEach((file) => formData.append('referenceFiles', file));

      const res = await createProject(formData);
      if (res.success) {
        toast.success('Project created successfully!');
        navigate('/admin/projects');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create project');
    } finally {
      setLoading(false);
    }
  };

  const filteredStaff = staffList.filter((st) => {
    if (!staffSearch) return true;
    const q = staffSearch.toLowerCase();
    return (
      st.fullName?.toLowerCase().includes(q) ||
      st.email?.toLowerCase().includes(q) ||
      st.department?.toLowerCase().includes(q) ||
      st.title?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-3">
        <Link to="/admin/projects" className="rounded-lg p-2 text-slate-400 hover:bg-slate-900 hover:text-white transition-colors">
          <FiArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Create New Project</h1>
          <p className="text-sm text-slate-400">Initialize a project and assign staff members.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 rounded-2xl border border-slate-800 bg-slate-950/60 p-6 sm:p-8 backdrop-blur-xl shadow-2xl">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-slate-300">Project Name *</label>
            <input
              type="text" required
              className="mt-2 block w-full rounded-xl border border-slate-800 bg-slate-900/60 px-4 py-3 text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none text-sm transition"
              placeholder="e.g. Website Overhaul Phase 1"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
            />
          </div>

          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-slate-300">Related Client *</label>
            <select
              required
              value={clientId}
              onChange={(e) => setClientId(e.target.value)}
              className="mt-2 block w-full rounded-xl border border-slate-800 bg-slate-900/60 px-4 py-3 text-white focus:border-indigo-500 focus:outline-none text-sm transition"
            >
              <option value="">Select a Client...</option>
              {clients.map((c) => (
                <option key={c._id} value={c._id}>{c.fullName} ({c.email})</option>
              ))}
            </select>
          </div>

          <div className="md:col-span-2">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-300">Project Description *</label>
            <textarea
              required rows={4}
              className="mt-2 block w-full rounded-xl border border-slate-800 bg-slate-900/60 px-4 py-3 text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none text-sm transition"
              placeholder="Describe the full scope and technical requirements..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          {/* ── Enterprise Staff Assignment Section (Matching Design Specification) ── */}
          <div className="md:col-span-2 space-y-4 pt-2 border-t border-slate-800/80">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-300">Assign Staff Members</label>
              <span className="text-xs font-semibold text-slate-400 font-mono">
                {assignedStaff.length} Staff Assigned
              </span>
            </div>

            {/* Search Input Box */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Search and Add</label>
              <div className="relative">
                <FiSearch className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-500" />
                <input
                  type="text"
                  value={staffSearch}
                  onChange={(e) => setStaffSearch(e.target.value)}
                  placeholder="e.g., Jane Doe, staff3@portal.com"
                  className="w-full rounded-xl border border-slate-800 bg-slate-900/60 py-3 pl-10 pr-4 text-xs text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition"
                />
              </div>
            </div>

            {/* Staff Table / List */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Project Staff Assignment List</label>
              <div className="rounded-xl border border-slate-800/80 bg-slate-900/40 overflow-hidden shadow-inner max-h-72 overflow-y-auto thin-scrollbar">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-800/80 bg-slate-900/80 text-[10px] uppercase font-bold tracking-wider text-slate-400 select-none">
                      <th className="py-3 px-4">Profile</th>
                      <th className="py-3 px-4">Email</th>
                      <th className="py-3 px-4">Department</th>
                      <th className="py-3 px-4">Role</th>
                      <th className="py-3 px-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/40 font-medium">
                    {filteredStaff.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="py-6 text-center text-xs text-slate-500">
                          No staff members found matching search query.
                        </td>
                      </tr>
                    ) : (
                      filteredStaff.map((st) => {
                        const isAssigned = assignedStaff.includes(st._id);
                        const avatarUrl = st.profileImage
                          ? st.profileImage.startsWith('http')
                            ? st.profileImage
                            : `${import.meta.env.VITE_SERVER_URL || 'http://localhost:5000'}/uploads/${st.profileImage}`
                          : null;
                        return (
                          <tr key={st._id} className="hover:bg-slate-900/60 transition-colors">
                            <td className="py-3 px-4">
                              <div className="flex items-center gap-3">
                                {avatarUrl ? (
                                  <img src={avatarUrl} alt={st.fullName} className="h-8 w-8 rounded-full object-cover border border-slate-700 shadow-sm" />
                                ) : (
                                  <div className="h-8 w-8 rounded-full bg-indigo-600/30 border border-indigo-500/30 text-indigo-300 flex items-center justify-center font-bold text-xxs shadow-sm">
                                    {st.fullName?.charAt(0) || 'S'}
                                  </div>
                                )}
                                <span className="font-semibold text-slate-200">{st.fullName}</span>
                              </div>
                            </td>
                            <td className="py-3 px-4 text-slate-400 font-mono text-xxs">{st.email}</td>
                            <td className="py-3 px-4 text-slate-300">{st.department || 'Development'}</td>
                            <td className="py-3 px-4 text-slate-300">{st.title || st.role || 'Staff'}</td>
                            <td className="py-3 px-4 text-right">
                              {isAssigned ? (
                                <button
                                  type="button"
                                  onClick={() => handleStaffToggle(st._id)}
                                  className="inline-flex items-center gap-1 text-xxs font-bold text-red-400 hover:text-red-300 transition tracking-wider"
                                >
                                  <span>REMOVE</span>
                                  <span className="text-xs font-normal">✕</span>
                                </button>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => handleStaffToggle(st._id)}
                                  className="inline-flex items-center gap-1 text-xxs font-bold text-indigo-400 hover:text-indigo-300 transition tracking-wider"
                                >
                                  <span>ADD</span>
                                  <span className="text-xs font-normal">+</span>
                                </button>
                              )}
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">Start Date</label>
            <input
              type="date"
              className="mt-1 block w-full rounded-lg border border-slate-800 bg-slate-900/50 px-3 py-2.5 text-white focus:border-indigo-500 focus:outline-none text-sm"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>

          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">Expected Completion Date *</label>
            <input
              type="date" required
              className="mt-1 block w-full rounded-lg border border-slate-800 bg-slate-900/50 px-3 py-2.5 text-white focus:border-indigo-500 focus:outline-none text-sm"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
            />
          </div>

          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">Priority</label>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
              className="mt-1 block w-full rounded-lg border border-slate-800 bg-slate-900/50 px-3 py-2.5 text-white focus:border-indigo-500 focus:outline-none text-sm"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>

          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">Budget ($)</label>
            <input
              type="text"
              className="mt-1 block w-full rounded-lg border border-slate-800 bg-slate-900/50 px-3 py-2.5 text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none text-sm"
              placeholder="e.g. 10000"
              value={budget}
              onChange={(e) => setBudget(e.target.value)}
            />
          </div>

          <div className="md:col-span-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">Required Deliverables</label>
            <textarea
              rows={2}
              className="mt-1 block w-full rounded-lg border border-slate-800 bg-slate-900/50 px-3 py-2.5 text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none text-sm"
              placeholder="List specific final outputs, files, or milestones required..."
              value={deliverables}
              onChange={(e) => setDeliverables(e.target.value)}
            />
          </div>

          <div className="md:col-span-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">Project Instructions</label>
            <textarea
              rows={2}
              className="mt-1 block w-full rounded-lg border border-slate-800 bg-slate-900/50 px-3 py-2.5 text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none text-sm"
              placeholder="Internal guidance or staff directives..."
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
            />
          </div>
        </div>

        {/* Reference Files */}
        <div className="border-t border-slate-800/80 pt-6">
          <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-4">Reference Files</h3>
          <FileUpload files={files} setFiles={setFiles} />
        </div>

        <div className="flex items-center justify-end gap-3 border-t border-slate-800/80 pt-6">
          <Link to="/admin/projects" className="rounded-lg border border-slate-800 bg-slate-900/60 px-4 py-2.5 text-sm font-semibold text-slate-300 hover:bg-slate-850">
            Cancel
          </Link>
          <button type="submit" disabled={loading} className="flex items-center gap-2 rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-indigo-500 disabled:opacity-50">
            {loading ? 'Creating...' : <><FiFolderPlus /> Create Project</>}
          </button>
        </div>
      </form>
    </div>
  );
};
export default CreateProject;
