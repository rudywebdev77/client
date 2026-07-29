import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import * as userService from '../../../services/userService';
import toast from 'react-hot-toast';
import { FiArrowLeft, FiCamera } from 'react-icons/fi';

export const CreateUser = () => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('client');
  const [status, setStatus] = useState('active');
  const [profileImage, setProfileImage] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfileImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!fullName || !email || !password) {
      toast.error('Please fill in all required fields');
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('fullName', fullName);
      formData.append('email', email);
      formData.append('phone', phone);
      formData.append('password', password);
      formData.append('role', role);
      formData.append('status', status);
      if (profileImage) {
        formData.append('profileImage', profileImage);
      }

      const res = await userService.createUser(formData);
      if (res.success) {
        toast.success('User created successfully!');
        navigate('/admin/users');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create user');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div className="flex items-center gap-3">
        <Link to="/admin/users" className="rounded-lg p-2 text-slate-400 hover:bg-slate-900 hover:text-white transition-colors">
          <FiArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight font-sans">Create New User</h1>
          <p className="text-sm text-slate-400">Add a new admin, staff member, or client account.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 rounded-xl border border-slate-800 bg-slate-950/40 p-6 backdrop-blur-xl shadow-xl">
        {/* Avatar Upload */}
        <div className="flex flex-col items-center gap-4 sm:flex-row">
          <div className="relative h-20 w-20 overflow-hidden rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center">
            {imagePreview ? (
              <img src={imagePreview} alt="Preview" className="h-full w-full object-cover" />
            ) : (
              <FiCamera className="h-6 w-6 text-slate-500" />
            )}
          </div>
          <div>
            <label className="cursor-pointer rounded-lg bg-slate-900 border border-slate-800 hover:bg-slate-850 text-xs px-3 py-2 text-slate-300 transition-colors font-semibold">
              Choose Avatar
              <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
            </label>
            <p className="mt-1.5 text-xxs text-slate-500">Supports JPG, PNG. Max 5MB.</p>
          </div>
        </div>

        {/* Info Grid */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">Full Name *</label>
            <input
              type="text"
              required
              className="mt-1 block w-full rounded-lg border border-slate-800 bg-slate-900/50 px-3 py-2.5 text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 text-sm"
              placeholder="John Doe"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
            />
          </div>

          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">Email Address *</label>
            <input
              type="email"
              required
              className="mt-1 block w-full rounded-lg border border-slate-800 bg-slate-900/50 px-3 py-2.5 text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 text-sm"
              placeholder="john@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">Phone Number</label>
            <input
              type="tel"
              className="mt-1 block w-full rounded-lg border border-slate-800 bg-slate-900/50 px-3 py-2.5 text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 text-sm"
              placeholder="123-456-7890"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>

          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">Password *</label>
            <input
              type="password"
              required
              minLength={6}
              className="mt-1 block w-full rounded-lg border border-slate-800 bg-slate-900/50 px-3 py-2.5 text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 text-sm"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">Role</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="mt-1 block w-full rounded-lg border border-slate-800 bg-slate-900/50 px-3 py-2.5 text-white focus:border-indigo-500 focus:outline-none text-sm"
            >
              <option value="client">Client</option>
              <option value="staff">Staff</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">Account Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="mt-1 block w-full rounded-lg border border-slate-800 bg-slate-900/50 px-3 py-2.5 text-white focus:border-indigo-500 focus:outline-none text-sm"
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="deactivated">Deactivated</option>
            </select>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 border-t border-slate-800/80 pt-4">
          <Link
            to="/admin/users"
            className="rounded-lg border border-slate-800 bg-slate-900/60 px-4 py-2.5 text-sm font-semibold text-slate-300 transition-colors hover:bg-slate-850"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={loading}
            className="rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-indigo-500 disabled:opacity-50"
          >
            {loading ? 'Creating...' : 'Create User'}
          </button>
        </div>
      </form>
    </div>
  );
};
