import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import * as userService from '../../../services/userService';
import toast from 'react-hot-toast';
import { FiArrowLeft, FiEdit, FiClock, FiMail, FiPhone, FiLock } from 'react-icons/fi';

export const UserDetail = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const { id } = useParams();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await userService.getUser(id);
        if (res.success) {
          setUser(res.user);
        }
      } catch (err) {
        toast.error('Failed to load user profile');
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, [id]);

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="text-center py-12 text-slate-400">
        <p className="text-lg">User not found</p>
        <Link to="/admin/users" className="text-indigo-400 hover:underline">Back to users list</Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link to="/admin/users" className="rounded-lg p-2 text-slate-400 hover:bg-slate-900 hover:text-white transition-colors">
            <FiArrowLeft className="h-5 w-5" />
          </Link>
          <h1 className="text-2xl font-bold text-white tracking-tight">User Details</h1>
        </div>
        <Link
          to={`/admin/users/edit/${user._id}`}
          className="flex items-center gap-2 rounded-lg border border-slate-800 bg-slate-900/60 hover:bg-slate-850 px-3 py-2 text-sm font-semibold text-white transition-colors"
        >
          <FiEdit className="h-4.5 w-4.5" /> Edit Profile
        </Link>
      </div>

      <div className="rounded-xl border border-slate-800 bg-slate-950/40 p-6 backdrop-blur-xl shadow-xl space-y-6">
        <div className="flex flex-col items-center gap-4 sm:flex-row">
          <div className="h-20 w-20 overflow-hidden rounded-full bg-slate-850 flex items-center justify-center text-white text-3xl font-bold uppercase ring-2 ring-slate-800">
            {user.profileImage ? (
              <img src={`http://localhost:5000${user.profileImage}`} alt={user.fullName} className="h-full w-full object-cover" />
            ) : (
              user.fullName.charAt(0)
            )}
          </div>
          <div className="text-center sm:text-left">
            <h2 className="text-xl font-bold text-white">{user.fullName}</h2>
            <div className="mt-1 flex flex-wrap items-center justify-center sm:justify-start gap-2">
              <span className="rounded-full bg-indigo-500/10 px-2 py-0.5 text-xxs font-semibold uppercase tracking-wider text-indigo-400">
                {user.role}
              </span>
              <span
                className={`rounded-full px-2 py-0.5 text-xxs font-semibold uppercase tracking-wider ${
                  user.status === 'active' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'
                }`}
              >
                {user.status}
              </span>
            </div>
          </div>
        </div>

        <div className="border-t border-slate-800/80 pt-6 space-y-4 text-sm text-slate-300">
          <div className="flex items-center gap-3">
            <FiMail className="h-5 w-5 text-slate-500" />
            <div>
              <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Email Address</p>
              <p className="text-white mt-0.5">{user.email}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <FiPhone className="h-5 w-5 text-slate-500" />
            <div>
              <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Phone Number</p>
              <p className="text-white mt-0.5">{user.phone || 'Not provided'}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <FiClock className="h-5 w-5 text-slate-500" />
            <div>
              <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Account Created</p>
              <p className="text-white mt-0.5">{new Date(user.createdAt).toLocaleString()}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
