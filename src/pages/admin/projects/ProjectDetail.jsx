import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getProject, changeProjectStatus, approveWork, requestRevision } from '../../../services/projectService';
import ActivityTimeline from '../../../components/history/ActivityTimeline';
import MessageThread from '../../../components/messaging/MessageThread';
import { FiArrowLeft, FiClock, FiFile, FiCheckCircle, FiRefreshCw, FiEdit, FiUser } from 'react-icons/fi';
import toast from 'react-hot-toast';

const STATUS_OPTIONS = [
  { value: 'not_started', label: 'Not Started' },
  { value: 'assigned', label: 'Assigned' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'waiting_for_client', label: 'Waiting for Client' },
  { value: 'under_review', label: 'Under Review' },
  { value: 'revision_required', label: 'Revision Required' },
  { value: 'completed', label: 'Completed' },
  { value: 'cancelled', label: 'Cancelled' },
];

export const ProjectDetail = () => {
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [revisionRemarks, setRevisionRemarks] = useState('');
  const [showRevisionModal, setShowRevisionModal] = useState(false);

  const { id } = useParams();

  const fetchProject = async () => {
    try {
      const res = await getProject(id);
      if (res.success) setProject(res.project);
    } catch (err) {
      toast.error('Failed to load project details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchProject(); }, [id]);

  const handleStatusChange = async (newStatus) => {
    setUpdatingStatus(true);
    try {
      const res = await changeProjectStatus(id, { status: newStatus });
      if (res.success) {
        toast.success(`Status updated to ${newStatus.replace('_', ' ')}`);
        setProject(res.project);
      }
    } catch (err) {
      toast.error('Failed to update status');
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleApprove = async () => {
    setUpdatingStatus(true);
    try {
      const res = await approveWork(id);
      if (res.success) {
        toast.success('Project work approved and completed!');
        fetchProject();
      }
    } catch (err) {
      toast.error('Approval failed');
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleRevisionSubmit = async () => {
    if (!revisionRemarks.trim()) return toast.error('Please enter revision remarks');
    setUpdatingStatus(true);
    try {
      const res = await requestRevision(id, revisionRemarks);
      if (res.success) {
        toast.success('Revision requested successfully!');
        setShowRevisionModal(false);
        fetchProject();
      }
    } catch (err) {
      toast.error('Failed to request revision');
    } finally {
      setUpdatingStatus(false);
    }
  };

  if (loading) return <div className="flex h-64 items-center justify-center"><div className="h-10 w-10 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent"></div></div>;
  if (!project) return <div className="text-center py-12 text-slate-400"><p>Project not found</p><Link to="/admin/projects" className="text-indigo-400 underline">Back to projects</Link></div>;

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Link to="/admin/projects" className="rounded-lg p-2 text-slate-400 hover:bg-slate-900 hover:text-white transition-colors">
            <FiArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">{project.projectName}</h1>
            <p className="text-sm text-slate-400">Client: {project.client?.fullName} ({project.client?.email})</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Link to={`/admin/projects/edit/${project._id}`} className="flex items-center gap-1.5 rounded-lg border border-slate-800 bg-slate-900 px-3 py-2 text-xs font-semibold text-white hover:bg-slate-850">
            <FiEdit /> Edit
          </Link>
          <select
            value={project.status}
            onChange={(e) => handleStatusChange(e.target.value)}
            disabled={updatingStatus}
            className="rounded-lg border border-slate-800 bg-slate-900 px-3 py-2 text-xs font-semibold text-white focus:outline-none"
          >
            {STATUS_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Review Actions Banner if Under Review */}
      {project.status === 'under_review' && (
        <div className="flex items-center justify-between rounded-xl border border-indigo-500/30 bg-indigo-500/10 p-4">
          <div>
            <p className="text-sm font-bold text-white">Work Submitted for Review</p>
            <p className="text-xs text-slate-300">Staff has uploaded completed deliverables. Review and approve or request revision.</p>
          </div>
          <div className="flex gap-2">
            <button onClick={handleApprove} disabled={updatingStatus} className="flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3.5 py-2 text-xs font-semibold text-white hover:bg-emerald-500">
              <FiCheckCircle /> Approve Work
            </button>
            <button onClick={() => setShowRevisionModal(true)} className="flex items-center gap-1.5 rounded-lg bg-red-600 px-3.5 py-2 text-xs font-semibold text-white hover:bg-red-500">
              <FiRefreshCw /> Request Revision
            </button>
          </div>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="flex border-b border-slate-800 gap-2">
        {['overview', 'messages', 'timeline'].map((t) => (
          <button
            key={t}
            onClick={() => setActiveTab(t)}
            className={`px-4 py-2.5 text-xs font-semibold uppercase tracking-wider transition-colors border-b-2 ${
              activeTab === t
                ? 'border-indigo-500 text-white'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          <div className="md:col-span-2 space-y-6">
            <div className="rounded-xl border border-slate-800 bg-slate-950/40 p-6 space-y-4">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider border-b border-slate-800 pb-2">Scope & Deliverables</h3>
              <div><p className="text-xs text-slate-500 uppercase">Description</p><p className="text-white text-sm mt-0.5 whitespace-pre-wrap">{project.description}</p></div>
              {project.deliverables && (
                <div><p className="text-xs text-slate-500 uppercase">Deliverables Required</p><p className="text-white text-sm mt-0.5 whitespace-pre-wrap">{project.deliverables}</p></div>
              )}
              {project.instructions && (
                <div><p className="text-xs text-slate-500 uppercase">Staff Instructions</p><p className="text-white text-sm mt-0.5 whitespace-pre-wrap">{project.instructions}</p></div>
              )}
            </div>

            {/* Reference & Output Files */}
            {project.referenceFiles?.length > 0 && (
              <div className="rounded-xl border border-slate-800 bg-slate-950/40 p-6 space-y-3">
                <h3 className="text-xs font-bold text-white uppercase tracking-wider">Project Files</h3>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {project.referenceFiles.map((file) => (
                    <a key={file._id} href={`http://localhost:5000${file.filePath}`} target="_blank" rel="noreferrer" className="flex items-center gap-2 rounded-lg border border-slate-800 bg-slate-900/40 p-3 hover:bg-slate-900/80 transition-colors">
                      <FiFile className="h-5 w-5 text-indigo-400 shrink-0" />
                      <div className="overflow-hidden">
                        <p className="truncate text-xs font-semibold text-white">{file.originalName}</p>
                        <p className="text-xxs text-slate-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                      </div>
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="space-y-6">
            <div className="rounded-xl border border-slate-800 bg-slate-950/40 p-6 space-y-4">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">Assigned Staff</h3>
              {project.assignedStaff?.length === 0 ? (
                <p className="text-xs text-slate-500">No staff members assigned yet.</p>
              ) : (
                <div className="space-y-2">
                  {project.assignedStaff.map((st) => (
                    <div key={st._id} className="flex items-center gap-3 rounded-lg border border-slate-800 bg-slate-900/40 p-2.5">
                      <div className="h-8 w-8 rounded-full bg-indigo-600 flex items-center justify-center text-white text-xs font-bold uppercase">
                        {st.fullName.charAt(0)}
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-white">{st.fullName}</p>
                        <p className="text-xxs text-slate-500">{st.email}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="rounded-xl border border-slate-800 bg-slate-950/40 p-6 space-y-4">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">Key Details</h3>
              <div><p className="text-xs text-slate-500 uppercase">Priority</p><p className="text-white text-sm capitalize">{project.priority}</p></div>
              <div><p className="text-xs text-slate-500 uppercase">Start Date</p><p className="text-white text-sm">{new Date(project.startDate).toLocaleDateString()}</p></div>
              <div><p className="text-xs text-slate-500 uppercase">Deadline</p><p className="text-white text-sm flex items-center gap-1"><FiClock className="text-slate-500" />{new Date(project.deadline).toLocaleDateString()}</p></div>
              <div><p className="text-xs text-slate-500 uppercase">Budget</p><p className="text-white text-sm">{project.budget ? `$${project.budget}` : 'Not set'}</p></div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'messages' && <MessageThread projectId={project._id} />}
      {activeTab === 'timeline' && <ActivityTimeline projectId={project._id} />}

      {/* Revision Modal */}
      {showRevisionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-950 p-6 shadow-2xl space-y-4">
            <h3 className="text-lg font-bold text-white">Request Revision</h3>
            <textarea
              rows={4}
              className="w-full rounded-lg border border-slate-800 bg-slate-900/50 p-3 text-sm text-white placeholder-slate-500 focus:outline-none"
              placeholder="State what needs to be changed or fixed..."
              value={revisionRemarks}
              onChange={(e) => setRevisionRemarks(e.target.value)}
            />
            <div className="flex gap-3">
              <button onClick={() => setShowRevisionModal(false)} className="flex-1 rounded-lg border border-slate-800 bg-slate-900 py-2 text-sm text-slate-300">Cancel</button>
              <button onClick={handleRevisionSubmit} disabled={updatingStatus} className="flex-1 rounded-lg bg-red-600 py-2 text-sm text-white hover:bg-red-500 disabled:opacity-50">Confirm</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default ProjectDetail;
