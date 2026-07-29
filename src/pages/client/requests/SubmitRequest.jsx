import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { createRequest } from '../../../services/requestService';
import FileUpload from '../../../components/FileUpload';
import toast from 'react-hot-toast';
import { FiArrowLeft, FiSend } from 'react-icons/fi';

export const SubmitRequest = () => {
  const [title, setTitle] = useState('');
  const [service, setService] = useState('');
  const [description, setDescription] = useState('');
  const [deadline, setDeadline] = useState('');
  const [priority, setPriority] = useState('low');
  const [budget, setBudget] = useState('');
  const [instructions, setInstructions] = useState('');
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title || !service || !description || !deadline) {
      toast.error('Please fill in all required fields');
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('title', title);
      formData.append('service', service);
      formData.append('description', description);
      formData.append('deadline', deadline);
      formData.append('priority', priority);
      formData.append('budget', budget);
      formData.append('instructions', instructions);
      formData.append('contactName', contactName);
      formData.append('contactEmail', contactEmail);
      formData.append('contactPhone', contactPhone);

      files.forEach((file) => {
        formData.append('files', file);
      });

      const res = await createRequest(formData);
      if (res.success) {
        toast.success(`Request ${res.request.requestNo} submitted successfully!`);
        navigate('/client/requests');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Submission failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-3">
        <Link to="/client" className="rounded-lg p-2 text-slate-400 hover:bg-slate-900 hover:text-white transition-colors">
          <FiArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Submit Work Request</h1>
          <p className="text-sm text-slate-400">Request a new project workspace. Admins will review and assign staff.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 rounded-xl border border-slate-800 bg-slate-950/40 p-6 backdrop-blur-xl shadow-xl">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {/* General Fields */}
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">Request Title *</label>
            <input
              type="text"
              required
              className="mt-1 block w-full rounded-lg border border-slate-800 bg-slate-900/50 px-3 py-2.5 text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 text-sm"
              placeholder="e.g., Redesign E-Commerce Platform"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">Service / Project Type *</label>
            <input
              type="text"
              required
              className="mt-1 block w-full rounded-lg border border-slate-800 bg-slate-900/50 px-3 py-2.5 text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 text-sm"
              placeholder="e.g., Web Development, UI/UX Design"
              value={service}
              onChange={(e) => setService(e.target.value)}
            />
          </div>

          <div className="md:col-span-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">Detailed Description *</label>
            <textarea
              required
              rows={4}
              className="mt-1 block w-full rounded-lg border border-slate-800 bg-slate-900/50 px-3 py-2.5 text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 text-sm"
              placeholder="Explain the scope and deliverables you need..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">Required Deadline *</label>
            <input
              type="date"
              required
              className="mt-1 block w-full rounded-lg border border-slate-800 bg-slate-900/50 px-3 py-2.5 text-white focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 text-sm"
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
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">Budget ($ / optional)</label>
            <input
              type="text"
              className="mt-1 block w-full rounded-lg border border-slate-800 bg-slate-900/50 px-3 py-2.5 text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 text-sm"
              placeholder="e.g., 5000"
              value={budget}
              onChange={(e) => setBudget(e.target.value)}
            />
          </div>

          <div className="md:col-span-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">Additional Instructions</label>
            <textarea
              rows={2}
              className="mt-1 block w-full rounded-lg border border-slate-800 bg-slate-900/50 px-3 py-2.5 text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 text-sm"
              placeholder="Any specific technical instructions, tools, or references..."
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
            />
          </div>
        </div>

        {/* Contact Information */}
        <div className="border-t border-slate-800/80 pt-6">
          <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-4">Contact Information</h3>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">Name</label>
              <input
                type="text"
                className="mt-1 block w-full rounded-lg border border-slate-800 bg-slate-900/50 px-3 py-2.5 text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 text-sm"
                placeholder="Alternative contact name"
                value={contactName}
                onChange={(e) => setContactName(e.target.value)}
              />
            </div>
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">Email</label>
              <input
                type="email"
                className="mt-1 block w-full rounded-lg border border-slate-800 bg-slate-900/50 px-3 py-2.5 text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 text-sm"
                placeholder="Alternative email"
                value={contactEmail}
                onChange={(e) => setContactEmail(e.target.value)}
              />
            </div>
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">Phone</label>
              <input
                type="tel"
                className="mt-1 block w-full rounded-lg border border-slate-800 bg-slate-900/50 px-3 py-2.5 text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 text-sm"
                placeholder="Alternative phone"
                value={contactPhone}
                onChange={(e) => setContactPhone(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* File Upload */}
        <div className="border-t border-slate-800/80 pt-6">
          <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-4">Reference Attachments</h3>
          <FileUpload files={files} setFiles={setFiles} />
        </div>

        {/* Submit Actions */}
        <div className="flex items-center justify-end gap-3 border-t border-slate-800/80 pt-6">
          <Link
            to="/client"
            className="rounded-lg border border-slate-800 bg-slate-900/60 px-4 py-2.5 text-sm font-semibold text-slate-300 transition-colors hover:bg-slate-850"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={loading}
            className="flex items-center gap-2 rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-indigo-500 disabled:opacity-50"
          >
            {loading ? (
              'Submitting...'
            ) : (
              <>
                <FiSend className="h-4 w-4" /> Submit Request
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
export default SubmitRequest;
