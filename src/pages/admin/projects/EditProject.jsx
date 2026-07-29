import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { getProject, updateProject, assignStaff } from '../../../services/projectService';
import { getUsers } from '../../../services/userService';
import toast from 'react-hot-toast';
import { FiArrowLeft } from 'react-icons/fi';

export const EditProject = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [projectName, setProjectName] = useState('');
  const [description, setDescription] = useState('');
  const [assignedStaff, setAssignedStaff] = useState([]);
  const [deadline, setDeadline] = useState('');
  const [priority, setPriority] = useState('medium');
  const [budget, setBudget] = useState('');
  const [deliverables, setDeliverables] = useState('');
  const [instructions, setInstructions] = useState('');
  const [status, setStatus] = useState('not_started');

  const [staffList, setStaffList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const sRes = await getUsers({ role: 'staff', limit: 100 });
        if (sRes.success) setStaffList(sRes.users);

        const pRes = await getProject(id);
        if (pRes.success) {
          const p = pRes.project;
          setProjectName(p.projectName);
          setDescription(p.description);
          setAssignedStaff(p.assignedStaff.map(s => s._id));
          if (p.deadline) setDeadline(new Date(p.deadline).toISOString().split('T')[0]);
          setPriority(p.priority || 'medium');
          setBudget(p.budget || '');
          setDeliverables(p.deliverables || '');
          setInstructions(p.instructions || '');
          setStatus(p.status || 'not_started');
        }
      } catch (err) {
        toast.error('Failed to load project details');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const handleStaffToggle = (staffId) => {
    setAssignedStaff(prev =>
      prev.includes(staffId) ? prev.filter(s => s !== staffId) : [...prev, staffId]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await updateProject(id, {
        projectName, description, deadline, priority, budget, deliverables, instructions, status
      });
      await assignStaff(id, assignedStaff);
      toast.success('Project updated successfully');
      navigate(`/admin/projects/${id}`);
    } catch (err) {
      toast.error('Failed to update project');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="flex h-64 items-center justify-center"><div className="h-10 w-10 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent"></div></div>;

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-3">
        <Link to={`/admin/projects/${id}`} className="rounded-lg p-2 text-slate-400 hover:bg-slate-900 hover:text-white transition-colors">
          <FiArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Edit Project</h1>
          <p className="text-sm text-slate-400">Update parameters, deadlines, and staff assignments.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 rounded-xl border border-slate-800 bg-slate-950/40 p-6 backdrop-blur-xl shadow-xl">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">Project Name</label>
            <input type="text" required className="mt-1 block w-full rounded-lg border border-slate-800 bg-slate-900/50 px-3 py-2.5 text-white text-sm" value={projectName} onChange={(e) => setProjectName(e.target.value)} />
          </div>

          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">Status</label>
            <select value={status} onChange={(e) => setStatus(e.target.value)} className="mt-1 block w-full rounded-lg border border-slate-800 bg-slate-900/50 px-3 py-2.5 text-white text-sm">
              <option value="not_started">Not Started</option>
              <option value="assigned">Assigned</option>
              <option value="in_progress">In Progress</option>
              <option value="waiting_for_client">Waiting for Client</option>
              <option value="under_review">Under Review</option>
              <option value="revision_required">Revision Required</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          <div className="md:col-span-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">Description</label>
            <textarea rows={4} required className="mt-1 block w-full rounded-lg border border-slate-800 bg-slate-900/50 px-3 py-2.5 text-white text-sm" value={description} onChange={(e) => setDescription(e.target.value)} />
          </div>

          <div className="md:col-span-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">Assigned Staff Members</label>
            <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2">
              {staffList.map((st) => {
                const isSelected = assignedStaff.includes(st._id);
                return (
                  <div key={st._id} onClick={() => handleStaffToggle(st._id)} className={`cursor-pointer flex items-center justify-between rounded-lg border p-3 ${isSelected ? 'border-indigo-500 bg-indigo-500/10 text-white' : 'border-slate-800 bg-slate-900/40 text-slate-400'}`}>
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
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">Deadline</label>
            <input type="date" required className="mt-1 block w-full rounded-lg border border-slate-800 bg-slate-900/50 px-3 py-2.5 text-white text-sm" value={deadline} onChange={(e) => setDeadline(e.target.value)} />
          </div>

          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">Priority</label>
            <select value={priority} onChange={(e) => setPriority(e.target.value)} className="mt-1 block w-full rounded-lg border border-slate-800 bg-slate-900/50 px-3 py-2.5 text-white text-sm">
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>

          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">Budget ($)</label>
            <input type="text" className="mt-1 block w-full rounded-lg border border-slate-800 bg-slate-900/50 px-3 py-2.5 text-white text-sm" value={budget} onChange={(e) => setBudget(e.target.value)} />
          </div>

          <div className="md:col-span-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">Deliverables</label>
            <textarea rows={2} className="mt-1 block w-full rounded-lg border border-slate-800 bg-slate-900/50 px-3 py-2.5 text-white text-sm" value={deliverables} onChange={(e) => setDeliverables(e.target.value)} />
          </div>

          <div className="md:col-span-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">Instructions</label>
            <textarea rows={2} className="mt-1 block w-full rounded-lg border border-slate-800 bg-slate-900/50 px-3 py-2.5 text-white text-sm" value={instructions} onChange={(e) => setInstructions(e.target.value)} />
          </div>
        </div>

        <div className="flex justify-end gap-3 border-t border-slate-800/80 pt-6">
          <Link to={`/admin/projects/${id}`} className="rounded-lg border border-slate-800 px-4 py-2.5 text-sm text-slate-300">Cancel</Link>
          <button type="submit" disabled={submitting} className="rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-indigo-500 disabled:opacity-50">
            {submitting ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
};
export default EditProject;
