import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getProject, acceptProject, changeProjectStatus, submitForReview } from '../../../services/projectService';
import ActivityTimeline from '../../../components/history/ActivityTimeline';
import MessageThread from '../../../components/messaging/MessageThread';
import FileUpload from '../../../components/FileUpload';
import { FiArrowLeft, FiClock, FiFile, FiUploadCloud, FiPlay, FiSend } from 'react-icons/fi';
import toast from 'react-hot-toast';

export const ProjectWork = () => {
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('work');
  const [workFiles, setWorkFiles] = useState([]);
  const [submitting, setSubmitting] = useState(false);

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

  const handleAccept = async () => {
    try {
      const res = await acceptProject(id);
      if (res.success) {
        toast.success('Project accepted!');
        fetchProject();
      }
    } catch (err) {
      toast.error('Failed to accept');
    }
  };

  const handleStatusUpdate = async (status) => {
    try {
      const res = await changeProjectStatus(id, { status });
      if (res.success) {
        toast.success(`Status updated to ${status.replace('_', ' ')}`);
        fetchProject();
      }
    } catch (err) {
      toast.error('Status update failed');
    }
  };

  const handleSubmitForReview = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const formData = new FormData();
      workFiles.forEach((file) => formData.append('workFiles', file));

      const res = await submitForReview(id, formData);
      if (res.success) {
        toast.success('Work submitted for Admin review!');
        setWorkFiles([]);
        fetchProject();
      }
    } catch (err) {
      toast.error('Submission failed');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="flex h-64 items-center justify-center"><div className="h-10 w-10 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent"></div></div>;
  if (!project) return <div className="text-slate-400 text-center py-12"><p>Project not found</p><Link to="/staff/projects" className="text-indigo-400 underline">Back to list</Link></div>;

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Link to="/staff/projects" className="rounded-lg p-2 text-slate-400 hover:bg-slate-900 hover:text-white transition-colors">
            <FiArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">{project.projectName}</h1>
            <p className="text-sm text-slate-400">Client: {project.client?.fullName}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {project.status === 'assigned' && (
            <button onClick={handleAccept} className="flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-xs font-semibold text-white hover:bg-emerald-500">
              <FiPlay /> Accept Project
            </button>
          )}
          {['in_progress', 'revision_required'].includes(project.status) && (
            <button onClick={() => handleStatusUpdate('waiting_for_client')} className="rounded-lg border border-slate-800 bg-slate-900 px-3 py-2 text-xs font-semibold text-slate-300 hover:text-white">
              Wait for Client
            </button>
          )}
          <span className="rounded-full border border-indigo-500/20 bg-indigo-500/10 px-3 py-1 text-xs font-semibold uppercase text-indigo-400">
            {project.status.replace('_', ' ')}
          </span>
        </div>
      </div>

      {project.status === 'revision_required' && (
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-red-300 text-sm">
          <p className="font-bold">Revision Requested!</p>
          <p className="mt-1 text-xs text-slate-300">Please review feedback in timeline/messages and submit updated deliverables.</p>
        </div>
      )}

      {/* Tabs */}
      <div className="flex border-b border-slate-800 gap-2">
        {['work', 'messages', 'timeline'].map((t) => (
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

      {activeTab === 'work' && (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          <div className="md:col-span-2 space-y-6">
            <div className="rounded-xl border border-slate-800 bg-slate-950/40 p-6 space-y-4">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider border-b border-slate-800 pb-2">Instructions & Scope</h3>
              <div><p className="text-xs text-slate-500 uppercase">Description</p><p className="text-white text-sm mt-0.5 whitespace-pre-wrap">{project.description}</p></div>
              {project.deliverables && (
                <div><p className="text-xs text-slate-500 uppercase">Required Deliverables</p><p className="text-white text-sm mt-0.5 whitespace-pre-wrap">{project.deliverables}</p></div>
              )}
              {project.instructions && (
                <div><p className="text-xs text-slate-500 uppercase">Admin Directives</p><p className="text-white text-sm mt-0.5 whitespace-pre-wrap">{project.instructions}</p></div>
              )}
            </div>

            {/* Upload Deliverables Form */}
            {['in_progress', 'revision_required', 'assigned'].includes(project.status) && (
              <form onSubmit={handleSubmitForReview} className="rounded-xl border border-slate-800 bg-slate-950/40 p-6 space-y-4">
                <h3 className="text-xs font-bold text-white uppercase tracking-wider">Submit Deliverables for Review</h3>
                <FileUpload files={workFiles} setFiles={setWorkFiles} />
                <div className="flex justify-end">
                  <button type="submit" disabled={submitting} className="flex items-center gap-2 rounded-lg bg-indigo-600 px-5 py-2.5 text-xs font-semibold text-white hover:bg-indigo-500 disabled:opacity-50">
                    {submitting ? 'Submitting...' : <><FiSend /> Submit for Admin Review</>}
                  </button>
                </div>
              </form>
            )}

            {/* Reference Files */}
            {project.referenceFiles?.length > 0 && (
              <div className="rounded-xl border border-slate-800 bg-slate-950/40 p-6 space-y-3">
                <h3 className="text-xs font-bold text-white uppercase tracking-wider">Reference Attachments</h3>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {project.referenceFiles.map((f) => (
                    <a key={f._id} href={`http://localhost:5000${f.filePath}`} target="_blank" rel="noreferrer" className="flex items-center gap-2 rounded-lg border border-slate-800 bg-slate-900/40 p-3 text-xs text-white hover:bg-slate-900">
                      <FiFile className="text-indigo-400" /> {f.originalName}
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="space-y-6">
            <div className="rounded-xl border border-slate-800 bg-slate-950/40 p-6 space-y-3 text-xs">
              <h3 className="font-bold text-white uppercase tracking-wider">Project Info</h3>
              <div><p className="text-slate-500 uppercase">Priority</p><p className="text-white text-sm font-semibold capitalize">{project.priority}</p></div>
              <div><p className="text-slate-500 uppercase">Deadline</p><p className="text-white text-sm font-semibold">{new Date(project.deadline).toLocaleDateString()}</p></div>
              <div><p className="text-slate-500 uppercase">Status</p><p className="text-white text-sm font-semibold capitalize">{project.status.replace('_', ' ')}</p></div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'messages' && <MessageThread projectId={project._id} />}
      {activeTab === 'timeline' && <ActivityTimeline projectId={project._id} />}
    </div>
  );
};
export default ProjectWork;
