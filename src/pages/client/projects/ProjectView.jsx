import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getProject, approveWork, requestRevision } from '../../../services/projectService';
import ActivityTimeline from '../../../components/history/ActivityTimeline';
import MessageThread from '../../../components/messaging/MessageThread';
import { FiArrowLeft, FiClock, FiFile, FiCheckCircle, FiRefreshCw, FiDownload } from 'react-icons/fi';
import toast from 'react-hot-toast';

export const ProjectView = () => {
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [submitting, setSubmitting] = useState(false);
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

  const handleApprove = async () => {
    setSubmitting(true);
    try {
      const res = await approveWork(id);
      if (res.success) {
        toast.success('Project work approved! Project is marked as Completed.');
        fetchProject();
      }
    } catch (err) {
      toast.error('Approval failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleRevisionSubmit = async () => {
    if (!revisionRemarks.trim()) return toast.error('Please enter revision remarks');
    setSubmitting(true);
    try {
      const res = await requestRevision(id, revisionRemarks);
      if (res.success) {
        toast.success('Revision request sent to the team!');
        setShowRevisionModal(false);
        fetchProject();
      }
    } catch (err) {
      toast.error('Failed to request revision');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="flex h-64 items-center justify-center"><div className="h-10 w-10 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent"></div></div>;
  if (!project) return <div className="text-slate-400 text-center py-12"><p>Project not found</p><Link to="/client/projects" className="text-indigo-400 underline">Back to list</Link></div>;

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Link to="/client/projects" className="rounded-lg p-2 text-slate-400 hover:bg-slate-900 hover:text-white transition-colors">
            <FiArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">{project.projectName}</h1>
            <p className="text-sm text-slate-400">Status: <span className="capitalize text-white font-semibold">{project.status.replace('_', ' ')}</span></p>
          </div>
        </div>
      </div>

      {/* Review Banner for Client */}
      {project.status === 'under_review' && (
        <div className="flex items-center justify-between rounded-xl border border-indigo-500/30 bg-indigo-500/10 p-4">
          <div>
            <p className="text-sm font-bold text-white">Final Work Ready for Your Review!</p>
            <p className="text-xs text-slate-300">Please review the deliverables and download files below. You can approve or request revisions.</p>
          </div>
          <div className="flex gap-2">
            <button onClick={handleApprove} disabled={submitting} className="flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3.5 py-2 text-xs font-semibold text-white hover:bg-emerald-500">
              <FiCheckCircle /> Approve Deliverables
            </button>
            <button onClick={() => setShowRevisionModal(true)} className="flex items-center gap-1.5 rounded-lg bg-red-600 px-3.5 py-2 text-xs font-semibold text-white hover:bg-red-500">
              <FiRefreshCw /> Request Revision
            </button>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex border-b border-slate-800 gap-2">
        {['overview', 'messages', 'timeline'].map((t) => (
          <button
            key={t}
            onClick={() => setActiveTab(t)}
            className={`px-4 py-2.5 text-xs font-semibold uppercase tracking-wider border-b-2 ${
              activeTab === t ? 'border-indigo-500 text-white' : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          <div className="md:col-span-2 space-y-6">
            <div className="rounded-xl border border-slate-800 bg-slate-950/40 p-6 space-y-4">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider border-b border-slate-800 pb-2">Project Overview</h3>
              <div><p className="text-xs text-slate-500 uppercase">Description</p><p className="text-white text-sm mt-0.5 whitespace-pre-wrap">{project.description}</p></div>
              {project.deliverables && (
                <div><p className="text-xs text-slate-500 uppercase">Required Deliverables</p><p className="text-white text-sm mt-0.5 whitespace-pre-wrap">{project.deliverables}</p></div>
              )}
            </div>

            {/* Reference Files */}
            {project.referenceFiles?.length > 0 && (
              <div className="rounded-xl border border-slate-800 bg-slate-950/40 p-6 space-y-3">
                <h3 className="text-xs font-bold text-white uppercase tracking-wider">Project Deliverables & Files</h3>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {project.referenceFiles.map((f) => (
                    <a key={f._id} href={`http://localhost:5000${f.filePath}`} target="_blank" rel="noreferrer" className="flex items-center justify-between rounded-lg border border-slate-800 bg-slate-900/40 p-3 text-xs text-white hover:bg-slate-900">
                      <div className="flex items-center gap-2 overflow-hidden">
                        <FiFile className="text-indigo-400 shrink-0" />
                        <span className="truncate font-semibold">{f.originalName}</span>
                      </div>
                      <FiDownload className="text-slate-500 shrink-0" />
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="space-y-6">
            <div className="rounded-xl border border-slate-800 bg-slate-950/40 p-6 space-y-3 text-xs">
              <h3 className="font-bold text-white uppercase tracking-wider">Project Timeline</h3>
              <div><p className="text-slate-500 uppercase">Expected Completion</p><p className="text-white text-sm font-semibold">{new Date(project.deadline).toLocaleDateString()}</p></div>
              <div><p className="text-slate-500 uppercase">Status</p><p className="text-white text-sm font-semibold capitalize">{project.status.replace('_', ' ')}</p></div>
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
            <h3 className="text-lg font-bold text-white">Request Changes / Revision</h3>
            <textarea
              rows={4}
              className="w-full rounded-lg border border-slate-800 bg-slate-900/50 p-3 text-sm text-white placeholder-slate-500 focus:outline-none"
              placeholder="Describe the changes or adjustments needed..."
              value={revisionRemarks}
              onChange={(e) => setRevisionRemarks(e.target.value)}
            />
            <div className="flex gap-3">
              <button onClick={() => setShowRevisionModal(false)} className="flex-1 rounded-lg border border-slate-800 bg-slate-900 py-2 text-sm text-slate-300">Cancel</button>
              <button onClick={handleRevisionSubmit} disabled={submitting} className="flex-1 rounded-lg bg-red-600 py-2 text-sm text-white hover:bg-red-500 disabled:opacity-50">Submit Request</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default ProjectView;
