import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { createProject } from '../../../services/projectService';
import { getUsers } from '../../../services/userService';
import { getRequest } from '../../../services/requestService';
import FileUpload from '../../../components/FileUpload';
import toast from 'react-hot-toast';
import { FiArrowLeft, FiFolderPlus } from 'react-icons/fi';

export const CreateProject = () => {
  const [searchParams] = useSearchParams();
  const requestId = searchParams.get('requestId');
  const clientIdParam = searchParams.get('clientId');

  const [projectName, setProjectName] = useState('');
  const [description, setDescription] = useState('');
  const [clientId, setClientId] = useState(clientIdParam || '');
  const [assignedStaff, setAssignedStaff] = useState([]);
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

      <form onSubmit={handleSubmit} className="space-y-6 rounded-xl border border-slate-800 bg-slate-950/40 p-6 backdrop-blur-xl shadow-xl">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">Project Name *</label>
            <input
              type="text" required
              className="mt-1 block w-full rounded-lg border border-slate-800 bg-slate-900/50 px-3 py-2.5 text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none text-sm"
              placeholder="e.g. Website Overhaul Phase 1"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
            />
          </div>

          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">Related Client *</label>
            <select
              required
              value={clientId}
              onChange={(e) => setClientId(e.target.value)}
              className="mt-1 block w-full rounded-lg border border-slate-800 bg-slate-900/50 px-3 py-2.5 text-white focus:border-indigo-500 focus:outline-none text-sm"
            >
              <option value="">Select a Client...</option>
              {clients.map((c) => (
                <option key={c._id} value={c._id}>{c.fullName} ({c.email})</option>
              ))}
            </select>
          </div>

          <div className="md:col-span-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">Project Description *</label>
            <textarea
              required rows={4}
              className="mt-1 block w-full rounded-lg border border-slate-800 bg-slate-900/50 px-3 py-2.5 text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none text-sm"
              placeholder="Describe the full scope and technical requirements..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          {/* Staff Assignment */}
          <div className="md:col-span-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">Assign Staff Members</label>
            <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2">
              {staffList.map((st) => {
                const isSelected = assignedStaff.includes(st._id);
                return (
                  <div
                    key={st._id}
                    onClick={() => handleStaffToggle(st._id)}
                    className={`cursor-pointer flex items-center justify-between rounded-lg border p-3 transition-colors ${
                      isSelected
                        ? 'border-indigo-500 bg-indigo-500/10 text-white'
                        : 'border-slate-800 bg-slate-900/40 text-slate-400 hover:bg-slate-900'
                    }`}
                  >
                    <div>
                      <p className="text-xs font-semibold">{st.fullName}</p>
                      <p className="text-xxs opacity-70">{st.email}</p>
                    </div>
                    <span className={`text-xxs font-bold uppercase rounded px-2 py-0.5 ${isSelected ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-400'}`}>
                      {isSelected ? 'Assigned' : 'Assign'}
                    </span>
                  </div>
                );
              })}
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
