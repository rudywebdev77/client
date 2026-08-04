import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getRequest, reviewRequest } from '../../../services/requestService';
import { FiArrowLeft, FiCheckCircle, FiXCircle, FiFile, FiDownload, FiFolderPlus } from 'react-icons/fi';
import toast from 'react-hot-toast';

const STATUS_BADGE = {
  new: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  under_review: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
  approved: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  rejected: 'bg-red-500/10 text-red-400 border-red-500/20',
  converted: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
  closed: 'bg-slate-500/10 text-slate-400 border-slate-500/20',
};

export const ReviewRequest = () => {
  const [request, setRequest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [internalNotes, setInternalNotes] = useState('');
  const [rejectReason, setRejectReason] = useState('');
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const { id } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchRequest = async () => {
      try {
        const res = await getRequest(id);
        if (res.success) {
          setRequest(res.request);
          setInternalNotes(res.request.internalNotes || '');
        }
      } catch (err) {
        toast.error('Failed to load request');
      } finally {
        setLoading(false);
      }
    };
    fetchRequest();
  }, [id]);

  const handleReview = async (status, extra = {}) => {
    setSubmitting(true);
    try {
      const res = await reviewRequest(id, { status, internalNotes, ...extra });
      if (res.success) {
        toast.success(`Request ${status.replace('_', ' ')} successfully`);
        setRequest(res.request);
        setShowRejectModal(false);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Action failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleApprove = () => handleReview('approved');
  const handleUnderReview = () => handleReview('under_review');
  const handleReject = () => {
    if (!rejectReason.trim()) { toast.error('Please provide a rejection reason'); return; }
    handleReview('rejected', { rejectReason });
  };

  if (loading) return <div className="flex h-64 items-center justify-center"><div className="h-10 w-10 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent"></div></div>;
  if (!request) return <div className="text-slate-400 text-center py-12"><p>Request not found.</p><Link to="/admin/requests" className="text-indigo-400 hover:underline">Back</Link></div>;

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link to="/admin/requests" className="rounded-lg p-2 text-slate-400 hover:bg-slate-900 hover:text-white transition-colors"><FiArrowLeft className="h-5 w-5" /></Link>
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">{request.requestNo}</h1>
            <p className="text-sm text-slate-400">{request.title}</p>
          </div>
        </div>
        <span className={`rounded-full border px-3 py-1 text-xs font-semibold uppercase ${STATUS_BADGE[request.status]}`}>
          {request.status.replace('_', ' ')}
        </span>
      </div>

      {/* Action Bar */}
      <div className="flex flex-wrap gap-3 rounded-xl border border-slate-800 bg-slate-950/40 p-4">
        {request.status === 'new' && (
          <button onClick={handleUnderReview} disabled={submitting} className="flex items-center gap-2 rounded-lg bg-purple-600 px-4 py-2 text-sm font-semibold text-white hover:bg-purple-500 disabled:opacity-50 transition-colors">
            Mark Under Review
          </button>
        )}
        {['new', 'under_review'].includes(request.status) && (
          <>
            <button onClick={handleApprove} disabled={submitting} className="flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-500 disabled:opacity-50 transition-colors">
              <FiCheckCircle /> Approve Request
            </button>
            <button onClick={() => setShowRejectModal(true)} className="flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-500 transition-colors">
              <FiXCircle /> Reject Request
            </button>
          </>
        )}
        {request.status === 'approved' && (
          <Link to={`/admin/projects/new?requestId=${request._id}&clientId=${request.client?._id}`} className="flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500 transition-colors">
            <FiFolderPlus /> Create Project
          </Link>
        )}
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {/* Main details */}
        <div className="md:col-span-2 space-y-6">
          <div className="rounded-xl border border-slate-800 bg-slate-950/40 p-6 space-y-4">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider border-b border-slate-800 pb-2">Request Details</h3>
            <div><p className="text-xs text-slate-500 uppercase tracking-wider">Service Type</p><p className="text-white mt-0.5">{request.service}</p></div>
            <div><p className="text-xs text-slate-500 uppercase tracking-wider">Description</p><p className="text-white mt-0.5 text-sm whitespace-pre-wrap">{request.description}</p></div>
            {request.instructions && (
              <div><p className="text-xs text-slate-500 uppercase tracking-wider">Instructions</p><p className="text-white mt-0.5 text-sm whitespace-pre-wrap">{request.instructions}</p></div>
            )}
            {request.rejectReason && (
              <div className="rounded-lg bg-red-500/5 border border-red-500/20 p-3">
                <p className="text-xs text-red-400 font-semibold">Rejection Reason:</p>
                <p className="text-white mt-1 text-sm">{request.rejectReason}</p>
              </div>
            )}
          </div>

          {/* Files */}
          {request.files?.length > 0 && (
            <div className="rounded-xl border border-slate-800 bg-slate-950/40 p-6 space-y-3">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">Attached Files ({request.files.length})</h3>
              {request.files.map((file) => (
                <a key={file._id} href={file.filePath?.startsWith('http') ? file.filePath : `${import.meta.env.VITE_SERVER_URL || 'http://localhost:5000'}${file.filePath}`} target="_blank" rel="noreferrer"
                  className="flex items-center justify-between rounded-lg border border-slate-800 bg-slate-900/40 p-3 hover:bg-slate-900/70 transition-colors">
                  <div className="flex items-center gap-2 overflow-hidden">
                    <FiFile className="h-5 w-5 text-indigo-400 shrink-0" />
                    <div className="overflow-hidden">
                      <p className="truncate text-xs font-semibold text-white">{file.originalName}</p>
                      <p className="text-xxs text-slate-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                    </div>
                  </div>
                  <FiDownload className="h-4 w-4 text-slate-500 shrink-0" />
                </a>
              ))}
            </div>
          )}

          {/* Internal Notes */}
          <div className="rounded-xl border border-slate-800 bg-slate-950/40 p-6 space-y-3">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">Internal Notes (Admin Only)</h3>
            <textarea
              rows={3}
              className="w-full rounded-lg border border-slate-800 bg-slate-900/50 px-3 py-2.5 text-sm text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none"
              placeholder="Add private notes about this request..."
              value={internalNotes}
              onChange={(e) => setInternalNotes(e.target.value)}
            />
            <button
              onClick={() => handleReview(request.status, {})}
              disabled={submitting}
              className="rounded-lg bg-slate-800 hover:bg-slate-700 px-3 py-1.5 text-xs font-semibold text-white transition-colors disabled:opacity-50"
            >
              {submitting ? 'Saving...' : 'Save Notes'}
            </button>
          </div>
        </div>

        {/* Side panel */}
        <div className="space-y-4">
          <div className="rounded-xl border border-slate-800 bg-slate-950/40 p-5 space-y-4">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">Client Info</h3>
            <div><p className="text-xs text-slate-500 uppercase tracking-wider">Name</p><p className="text-white mt-0.5 text-sm">{request.client?.fullName}</p></div>
            <div><p className="text-xs text-slate-500 uppercase tracking-wider">Email</p><p className="text-white mt-0.5 text-sm">{request.client?.email}</p></div>
          </div>
          <div className="rounded-xl border border-slate-800 bg-slate-950/40 p-5 space-y-4">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">Metadata</h3>
            <div><p className="text-xs text-slate-500 uppercase tracking-wider">Priority</p><p className="text-white mt-0.5 text-sm capitalize">{request.priority}</p></div>
            <div><p className="text-xs text-slate-500 uppercase tracking-wider">Deadline</p><p className="text-white mt-0.5 text-sm">{new Date(request.deadline).toLocaleDateString()}</p></div>
            <div><p className="text-xs text-slate-500 uppercase tracking-wider">Budget</p><p className="text-white mt-0.5 text-sm">{request.budget ? `$${request.budget}` : 'Not specified'}</p></div>
            <div><p className="text-xs text-slate-500 uppercase tracking-wider">Submitted</p><p className="text-white mt-0.5 text-sm">{new Date(request.createdAt).toLocaleDateString()}</p></div>
          </div>
        </div>
      </div>

      {/* Reject Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-950 p-6 shadow-2xl">
            <h3 className="text-lg font-bold text-white mb-4">Reject Request</h3>
            <p className="text-sm text-slate-400 mb-3">Provide a reason for rejection. The client will see this message.</p>
            <textarea
              rows={4}
              className="w-full rounded-lg border border-slate-800 bg-slate-900/50 px-3 py-2.5 text-sm text-white placeholder-slate-500 focus:border-red-500 focus:outline-none"
              placeholder="Reason for rejection..."
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              autoFocus
            />
            <div className="flex gap-3 mt-4">
              <button onClick={() => setShowRejectModal(false)} className="flex-1 rounded-lg border border-slate-800 bg-slate-900 py-2 text-sm font-semibold text-slate-300 hover:bg-slate-850 transition-colors">Cancel</button>
              <button onClick={handleReject} disabled={submitting} className="flex-1 rounded-lg bg-red-600 py-2 text-sm font-semibold text-white hover:bg-red-500 disabled:opacity-50 transition-colors">
                {submitting ? 'Rejecting...' : 'Confirm Reject'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default ReviewRequest;
