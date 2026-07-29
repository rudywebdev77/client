import React, { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { FiUser, FiLock, FiSave } from 'react-icons/fi';

export const Profile = () => {
  const { user, setUser } = useAuth();

  const [fullName, setFullName] = useState(user?.fullName || '');
  const [phone, setPhone] = useState(user?.phone || '');

  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [loadingProfile, setLoadingProfile] = useState(false);
  const [loadingPassword, setLoadingPassword] = useState(false);

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setLoadingProfile(true);
    try {
      const res = await api.put('/profile', { fullName, phone });
      if (res.data.success) {
        setUser(res.data.user);
        toast.success('Profile updated successfully!');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed');
    } finally {
      setLoadingProfile(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      return toast.error('New passwords do not match');
    }
    if (newPassword.length < 6) {
      return toast.error('Password must be at least 6 characters');
    }

    setLoadingPassword(true);
    try {
      const res = await api.put('/profile/password', { oldPassword, newPassword });
      if (res.data.success) {
        toast.success('Password updated successfully!');
        setOldPassword('');
        setNewPassword('');
        setConfirmPassword('');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Password update failed');
    } finally {
      setLoadingPassword(false);
    }
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Account Settings</h1>
        <p className="text-sm text-slate-400">Manage your profile details and security credentials.</p>
      </div>

      {/* Profile Info Form */}
      <form onSubmit={handleProfileSubmit} className="rounded-xl border border-slate-800 bg-slate-950/40 p-6 space-y-4 backdrop-blur-xl shadow-xl">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
          <FiUser className="text-indigo-400" /> Personal Information
        </h3>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">Full Name</label>
            <input
              type="text" required
              className="mt-1 block w-full rounded-lg border border-slate-800 bg-slate-900/50 px-3 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
            />
          </div>

          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">Email Address (Read-only)</label>
            <input
              type="email" disabled
              className="mt-1 block w-full rounded-lg border border-slate-800 bg-slate-900/20 px-3 py-2.5 text-sm text-slate-500 cursor-not-allowed"
              value={user?.email || ''}
            />
          </div>

          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">Phone Number</label>
            <input
              type="tel"
              className="mt-1 block w-full rounded-lg border border-slate-800 bg-slate-900/50 px-3 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>

          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">Role</label>
            <input
              type="text" disabled
              className="mt-1 block w-full rounded-lg border border-slate-800 bg-slate-900/20 px-3 py-2.5 text-sm text-slate-400 capitalize cursor-not-allowed font-semibold"
              value={user?.role || ''}
            />
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button type="submit" disabled={loadingProfile} className="flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-xs font-semibold text-white hover:bg-indigo-500 disabled:opacity-50">
            {loadingProfile ? 'Saving...' : <><FiSave /> Save Profile</>}
          </button>
        </div>
      </form>

      {/* Password Form */}
      <form onSubmit={handlePasswordSubmit} className="rounded-xl border border-slate-800 bg-slate-950/40 p-6 space-y-4 backdrop-blur-xl shadow-xl">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
          <FiLock className="text-purple-400" /> Security & Password
        </h3>

        <div className="space-y-4 max-w-md">
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">Current Password</label>
            <input
              type="password" required
              className="mt-1 block w-full rounded-lg border border-slate-800 bg-slate-900/50 px-3 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500"
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
            />
          </div>

          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">New Password</label>
            <input
              type="password" required minLength={6}
              className="mt-1 block w-full rounded-lg border border-slate-800 bg-slate-900/50 px-3 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
          </div>

          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">Confirm New Password</label>
            <input
              type="password" required minLength={6}
              className="mt-1 block w-full rounded-lg border border-slate-800 bg-slate-900/50 px-3 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button type="submit" disabled={loadingPassword} className="flex items-center gap-2 rounded-lg bg-purple-600 px-4 py-2 text-xs font-semibold text-white hover:bg-purple-500 disabled:opacity-50">
            {loadingPassword ? 'Updating...' : <><FiLock /> Update Password</>}
          </button>
        </div>
      </form>
    </div>
  );
};
export default Profile;
