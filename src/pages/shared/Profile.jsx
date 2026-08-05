import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { FiUser, FiLock, FiSave, FiMail, FiX, FiCheck, FiShield } from 'react-icons/fi';

export const Profile = () => {
  const { user, setUser } = useAuth();

  const [fullName, setFullName] = useState(user?.fullName || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [email, setEmail] = useState(user?.email || '');
  const [currentPassword, setCurrentPassword] = useState('');

  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [loadingProfile, setLoadingProfile] = useState(false);
  const [loadingPassword, setLoadingPassword] = useState(false);
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [resendingVerification, setResendingVerification] = useState(false);
  const [cancelingVerification, setCancelingVerification] = useState(false);

  useEffect(() => {
    if (user) {
      setFullName(user.fullName || '');
      setPhone(user.phone || '');
      setEmail(user.email || '');
    }
  }, [user]);

  const handleProfileSubmit = async (e) => {
    if (e) e.preventDefault();

    if (!fullName.trim()) {
      return toast.error('Full Name is required');
    }

    const normalizedEmail = email.toLowerCase().trim();
    if (!normalizedEmail) {
      return toast.error('Email address is required');
    }

    const emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    if (!emailRegex.test(normalizedEmail)) {
      return toast.error('Please enter a valid email address');
    }

    await executeProfileUpdate();
  };


  const executeProfileUpdate = async () => {
    setLoadingProfile(true);
    try {
      const normalizedEmail = email.toLowerCase().trim();
      const isEmailChanging = normalizedEmail !== (user?.email || '').toLowerCase().trim();

      const payload = {
        fullName,
        phone,
        email: normalizedEmail,
        currentPassword: isEmailChanging ? currentPassword : undefined,
      };

      console.log('[DEBUG Frontend Profile.jsx] Email value before sending request:', email);
      console.log('[DEBUG Frontend Profile.jsx] Full payload sent to /api/profile:', payload);

      const res = await api.put('/profile', payload);

      console.log('[DEBUG Frontend Profile.jsx] Response from server:', res.data);

      if (res.data.success && res.data.user) {
        setUser(res.data.user);
        setEmail(res.data.user.email || normalizedEmail);
        setFullName(res.data.user.fullName || fullName);
        setPhone(res.data.user.phone || phone);
        toast.success(res.data.message || 'Profile updated successfully!');
        setCurrentPassword('');
        setConfirmModalOpen(false);
      } else {
        toast.error(res.data.message || 'Update failed');
      }
    } catch (err) {
      console.error('[DEBUG Frontend Profile.jsx] Error updating profile:', err);
      toast.error(err.response?.data?.message || 'Update failed');
    } finally {
      setLoadingProfile(false);
    }
  };


  const handleResendVerification = async () => {
    try {
      setResendingVerification(true);
      const res = await api.post('/auth/resend-verification');
      if (res.data.success) {
        toast.success(res.data.message || 'Verification email resent successfully!');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to resend verification email');
    } finally {
      setResendingVerification(false);
    }
  };

  const handleCancelVerification = async () => {
    try {
      setCancelingVerification(true);
      const res = await api.post('/auth/cancel-verification');
      if (res.data.success) {
        toast.success(res.data.message || 'Pending email change cancelled');
        if (res.data.user) {
          setUser(res.data.user);
          setEmail(res.data.user.email);
        }
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to cancel email verification');
    } finally {
      setCancelingVerification(false);
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

      {/* Pending Email Verification Banner */}
      {user?.pendingEmail && (
        <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 backdrop-blur-xl">
          <div className="flex items-start gap-3">
            <FiMail className="h-5 w-5 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-xs font-bold text-amber-300 uppercase tracking-wider">Email Verification Pending</h4>
              <p className="text-xs text-slate-300 mt-1">
                Verification link sent to <strong className="text-white underline">{user.pendingEmail}</strong>. Active login email remains <strong className="text-white">{user.email}</strong> until verified.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={handleResendVerification}
              disabled={resendingVerification}
              className="rounded-lg bg-amber-500/20 border border-amber-500/40 px-3 py-1.5 text-xs font-bold text-amber-300 hover:bg-amber-500/30 transition disabled:opacity-50"
            >
              {resendingVerification ? 'Sending...' : 'Resend Email'}
            </button>
            <button
              type="button"
              onClick={handleCancelVerification}
              disabled={cancelingVerification}
              className="rounded-lg bg-slate-900 border border-slate-700 px-3 py-1.5 text-xs font-semibold text-slate-400 hover:text-white transition disabled:opacity-50"
            >
              {cancelingVerification ? 'Canceling...' : 'Cancel'}
            </button>
          </div>
        </div>
      )}

      {/* Profile Info Form */}
      <form onSubmit={handleProfileSubmit} className="rounded-xl border border-slate-800 bg-slate-950/40 p-6 space-y-4 backdrop-blur-xl shadow-xl">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
          <FiUser className="text-indigo-400" /> Personal Information
        </h3>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">Full Name *</label>
            <input
              type="text" required
              className="mt-1 block w-full rounded-lg border border-slate-800 bg-slate-900/50 px-3 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
            />
          </div>

          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center justify-between">
              <span>Email Address *</span>
              {user?.pendingEmail && (
                <span className="text-xxs font-bold text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded">
                  Pending Verification
                </span>
              )}
            </label>
            <input
              type="email" required
              className="mt-1 block w-full rounded-lg border border-slate-800 bg-slate-900/50 px-3 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
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

          {/* Current Password Field when Email changes */}
          {email.toLowerCase().trim() !== (user?.email || '').toLowerCase().trim() && (
            <div className="sm:col-span-2 p-3.5 rounded-lg bg-slate-900/80 border border-indigo-500/30 space-y-2">
              <label className="text-xs font-bold text-indigo-300 uppercase tracking-wider flex items-center gap-1.5">
                <FiLock className="text-indigo-400" /> Current Password Required to Change Email
              </label>
              <input
                type="password"
                required
                placeholder="Enter current password..."
                className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
              />
            </div>
          )}
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

      {/* Confirmation Modal */}
      {confirmModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-fade-in">
          <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-950 p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <FiMail className="h-5 w-5 text-indigo-400" />
                <h3 className="text-sm font-bold text-white">Confirm Email Address Change</h3>
              </div>
              <button
                type="button"
                onClick={() => setConfirmModalOpen(false)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-800 hover:text-white"
              >
                <FiX className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs text-slate-300 leading-relaxed">
              <p>Are you sure you want to change your email address?</p>
              <div className="rounded-xl bg-slate-900/80 p-3.5 border border-slate-800 space-y-1.5">
                <p className="text-slate-400 flex justify-between">
                  <span>Current Email:</span>
                  <span className="text-white font-medium">{user?.email}</span>
                </p>
                <p className="text-indigo-400 flex justify-between">
                  <span>New Email:</span>
                  <span className="text-white font-bold">{email.toLowerCase().trim()}</span>
                </p>
              </div>
              <p className="text-slate-400 text-xxs leading-normal">
                A verification link will be sent to the new email address. Your active login email will remain unchanged until verification is complete.
              </p>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setConfirmModalOpen(false)}
                disabled={loadingProfile}
                className="rounded-xl border border-slate-800 bg-slate-900 px-4 py-2 text-xs font-semibold text-slate-300 hover:bg-slate-800"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={executeProfileUpdate}
                disabled={loadingProfile}
                className="flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2 text-xs font-bold text-white hover:bg-indigo-500 disabled:opacity-50 transition shadow-md shadow-indigo-600/20"
              >
                {loadingProfile ? (
                  <>
                    <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    <span>Updating...</span>
                  </>
                ) : (
                  <>
                    <FiCheck className="h-4 w-4" />
                    <span>Confirm & Send Verification</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;

