import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getRequest } from '../../../services/requestService';
import { FiArrowLeft, FiClock, FiFile, FiAlertTriangle, FiCheckCircle } from 'react-icons/fi';
import toast from 'react-hot-toast';

export const RequestDetail = () => {
  const [request, setRequest] = useState(null);
  const [loading, setLoading] = useState(true);
  const { id } = useParams();

  useEffect(() => {
    const fetchRequest = async () => {
      try {
        const res = await getRequest(id);
        if (res.success) {
          setRequest(res.request);
        }
      } catch (err) {
        toast.error('Failed to load request details');
      } finally {
        setLoading(false);
      }
    };
    fetchRequest();
  }, [id]);

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent"></div>
      </div>
    );
  }

  if (!request) {
    return (
      <div className="text-center py-12 text-slate-400">
        <p className="text-lg">Request not found</p>
        <Link to="/client/requests" className="text-indigo-400 hover:underline">Back to request list</Link>
      </div>
    );
  }

  const getStatusAlert = (status) => {
    switch (status) {
      case 'rejected':
        return (
          <div className="rounded-lg border border-red-500/20 bg-red-500/5 p-4 text-sm text-red-400">
            <h4 className="font-bold flex items-center gap-1.5"><FiAlertTriangle /> Request Rejected</h4>
            <p className="mt-1 font-medium text-slate-300">Reason: {request.rejectReason || 'No feedback provided by admin.'}</p>
          </div>
        );
      case 'approved':
        return (
          <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/5 p-4 text-sm text-emerald-400">
            <h4 className="font-bold flex items-center gap-1.5"><FiCheckCircle /> Request Approved</h4>
            <p className="mt-1 text-slate-300">Admin approved your request. A project workspace is being created.</p>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-3">
        <Link to="/client/requests" className="rounded-lg p-2 text-slate-400 hover:bg-slate-900 hover:text-white transition-colors">
          <FiArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">{request.requestNo}</h1>
          <p className="text-sm text-slate-400">{request.title}</p>
        </div>
      </div>

      {getStatusAlert(request.status)}

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {/* Main Details */}
        <div className="md:col-span-2 space-y-6">
          <div className="rounded-xl border border-slate-800 bg-slate-950/40 p-6 backdrop-blur-xl shadow-xl space-y-4">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">Request Scope</h3>
            <div>
              <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Service Type</p>
              <p className="text-white text-sm mt-0.5">{request.service}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Description</p>
              <p className="text-white text-sm mt-0.5 whitespace-pre-wrap">{request.description}</p>
            </div>
            {request.instructions && (
              <div>
                <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Instructions</p>
                <p className="text-white text-sm mt-0.5 whitespace-pre-wrap">{request.instructions}</p>
              </div>
            )}
          </div>

          {/* Files List */}
          {request.files && request.files.length > 0 && (
            <div className="rounded-xl border border-slate-800 bg-slate-950/40 p-6 backdrop-blur-xl shadow-xl space-y-4">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">Submitted Files</h3>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {request.files.map((file) => (
                  <a
                    key={file._id}
                    href={file.filePath?.startsWith('http') ? file.filePath : `${import.meta.env.VITE_SERVER_URL || 'http://localhost:5000'}${file.filePath}`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center justify-between rounded-lg border border-slate-800 bg-slate-900/40 p-3 hover:bg-slate-900/80 transition-colors"
                  >
                    <div className="flex items-center gap-2 overflow-hidden">
                      <FiFile className="h-5 w-5 text-indigo-400 shrink-0" />
                      <div className="overflow-hidden">
                        <p className="truncate text-xs font-semibold text-white">{file.originalName}</p>
                        <p className="text-xxs text-slate-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                      </div>
                    </div>
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Side Panel Metrics */}
        <div className="space-y-6">
          <div className="rounded-xl border border-slate-800 bg-slate-950/40 p-6 backdrop-blur-xl shadow-xl space-y-4">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">Metadata</h3>
            <div>
              <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Status</p>
              <span className="inline-flex mt-1 items-center rounded-full bg-slate-900 border border-slate-800 px-2.5 py-0.5 text-xs font-semibold text-white capitalize">
                {request.status.replace('_', ' ')}
              </span>
            </div>
            <div>
              <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Priority</p>
              <span className="inline-flex mt-1 items-center rounded-full bg-slate-900 border border-slate-800 px-2.5 py-0.5 text-xs font-semibold text-white capitalize">
                {request.priority}
              </span>
            </div>
            <div>
              <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Required Deadline</p>
              <p className="text-white text-sm mt-0.5 flex items-center gap-1.5">
                <FiClock className="text-slate-550" />
                {new Date(request.deadline).toLocaleDateString()}
              </p>
            </div>
            <div>
              <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Budget Limit</p>
              <p className="text-white text-sm mt-0.5">{request.budget ? `$${request.budget}` : 'None specified'}</p>
            </div>
          </div>

          <div className="rounded-xl border border-slate-800 bg-slate-950/40 p-6 backdrop-blur-xl shadow-xl space-y-4">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">Contact Info</h3>
            <div>
              <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Name</p>
              <p className="text-white text-sm mt-0.5">{request.contactInfo?.name || 'N/A'}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Email</p>
              <p className="text-white text-sm mt-0.5">{request.contactInfo?.email || 'N/A'}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Phone</p>
              <p className="text-white text-sm mt-0.5">{request.contactInfo?.phone || 'N/A'}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default RequestDetail;
