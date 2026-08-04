import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import * as staffService from '../../services/staffSettingsService';
import toast from 'react-hot-toast';
import {
  FiUser,
  FiLock,
  FiSliders,
  FiBell,
  FiShield,
  FiCamera,
  FiX,
  FiEye,
  FiEyeOff,
  FiSave,
  FiCalendar,
  FiMail,
  FiSmartphone,
  FiInfo,
  FiCheckCircle,
  FiCheck,
  FiBriefcase,
  FiCheckSquare,
  FiMessageSquare,
} from 'react-icons/fi';

export const Settings = () => {
  const { user, setUser } = useAuth();
  const [activeTab, setActiveTab] = useState('all');

  // Loading States
  const [fetching, setFetching] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [savingNotifications, setSavingNotifications] = useState(false);

  // Form States
  // 1. Profile Info
  const [profileForm, setProfileForm] = useState({
    fullName: '',
    phone: '',
    email: '',
    staffId: '',
    profileImage: '',
  });
  const [originalProfile, setOriginalProfile] = useState({});

  // 2. Change Password
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });
  const [passwordErrors, setPasswordErrors] = useState({});

  // 3. Notifications
  const [notificationsForm, setNotificationsForm] = useState({
    email: true,
    browser: true,
    projects: true,
    tasks: true,
    messages: true,
  });

  // 4. Account Summary Metadata
  const [accountMetadata, setAccountMetadata] = useState({
    createdAt: '',
    status: 'Active',
    staffId: '',
  });

  // Image upload preview state
  const [imagePreview, setImagePreview] = useState(null);

  // Fetch staff profile on mount
  useEffect(() => {
    const fetchStaffData = async () => {
      try {
        setFetching(true);
        const data = await staffService.getStaffProfile();
        if (data.success && data.user) {
          const u = data.user;
          const staffId = u.staffId || (u._id ? `STF-${u._id.toString().slice(-6).toUpperCase()}` : 'STF-000000');

          const initialProfile = {
            fullName: u.fullName || '',
            phone: u.phone || '',
            email: u.email || '',
            staffId: staffId,
            profileImage: u.profileImage || '',
          };
          setProfileForm(initialProfile);
          setOriginalProfile(initialProfile);

          if (u.notifications) {
            setNotificationsForm({
              email: u.notifications.email ?? true,
              browser: u.notifications.browser ?? true,
              projects: u.notifications.projects ?? true,
              tasks: u.notifications.tasks ?? true,
              messages: u.notifications.messages ?? true,
            });
          }

          setAccountMetadata({
            createdAt: u.createdAt
              ? new Date(u.createdAt).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })
              : 'N/A',
            status: u.status
              ? u.status.charAt(0).toUpperCase() + u.status.slice(1)
              : 'Active',
            staffId: staffId,
          });

          // Sync auth user context
          setUser(u);
        }
      } catch (err) {
        console.error('Error loading staff profile:', err);
        toast.error('Failed to load settings');
      } finally {
        setFetching(false);
      }
    };

    fetchStaffData();
  }, [setUser]);

  // Profile Information Handlers
  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfileForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleCancelProfile = () => {
    setProfileForm(originalProfile);
    setImagePreview(null);
    toast.dismiss();
    toast('Profile changes discarded', { icon: 'ℹ️' });
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    if (!profileForm.fullName.trim()) {
      toast.error('Full Name is required');
      return;
    }

    try {
      setSavingProfile(true);
      const data = await staffService.updateStaffProfile({
        fullName: profileForm.fullName,
        phone: profileForm.phone,
      });

      if (data.success) {
        toast.success(data.message || 'Profile updated successfully!');
        setOriginalProfile({
          ...profileForm,
          fullName: data.user.fullName,
          phone: data.user.phone,
        });
        setUser(data.user);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setSavingProfile(false);
    }
  };

  // Image Upload Handler
  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file (JPG, PNG, WebP)');
      return;
    }

    // Preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result);
    };
    reader.readAsDataURL(file);

    // Upload
    const formData = new FormData();
    formData.append('profileImage', file);

    try {
      setUploadingImage(true);
      const data = await staffService.uploadStaffProfileImage(formData);
      if (data.success) {
        toast.success('Profile picture updated!');
        setProfileForm((prev) => ({ ...prev, profileImage: data.profileImage }));
        setOriginalProfile((prev) => ({ ...prev, profileImage: data.profileImage }));
        setImagePreview(null);
        if (data.user) {
          setUser(data.user);
        }
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to upload profile picture');
      setImagePreview(null);
    } finally {
      setUploadingImage(false);
    }
  };

  // Change Password Handlers
  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordForm((prev) => ({ ...prev, [name]: value }));
    if (passwordErrors[name]) {
      setPasswordErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const togglePasswordVisibility = (field) => {
    setShowPasswords((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    const errors = {};

    if (!passwordForm.currentPassword) {
      errors.currentPassword = 'Current password is required';
    }
    if (!passwordForm.newPassword) {
      errors.newPassword = 'New password is required';
    } else if (passwordForm.newPassword.length < 8) {
      errors.newPassword = 'New password must be at least 8 characters long';
    }
    if (!passwordForm.confirmPassword) {
      errors.confirmPassword = 'Please confirm your new password';
    } else if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }

    if (Object.keys(errors).length > 0) {
      setPasswordErrors(errors);
      return;
    }

    try {
      setSavingPassword(true);
      const data = await staffService.changeStaffPassword({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
        confirmPassword: passwordForm.confirmPassword,
      });

      if (data.success) {
        toast.success(data.message || 'Password updated successfully!');
        setPasswordForm({
          currentPassword: '',
          newPassword: '',
          confirmPassword: '',
        });
        setPasswordErrors({});
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update password');
    } finally {
      setSavingPassword(false);
    }
  };

  // Notification Handlers
  const handleNotificationToggle = (key) => {
    setNotificationsForm((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSaveNotifications = async (e) => {
    e.preventDefault();
    try {
      setSavingNotifications(true);
      const data = await staffService.updateStaffNotifications(notificationsForm);
      if (data.success) {
        toast.success('Notification settings saved successfully!');
        if (data.user) setUser(data.user);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save notification settings');
    } finally {
      setSavingNotifications(false);
    }
  };

  if (fetching) {
    return (
      <div className="flex h-[70vh] w-full items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent"></div>
          <p className="text-sm font-medium text-slate-400">Loading settings...</p>
        </div>
      </div>
    );
  }

  const getProfileImageUrl = () => {
    if (imagePreview) return imagePreview;
    const img = profileForm.profileImage || user?.profileImage;
    if (img) {
      if (img.startsWith('http')) return img;
      return `${import.meta.env.VITE_SERVER_URL || 'http://localhost:5000'}/uploads/${img}`;
    }
    return null;
  };

  return (
    <div className="mx-auto max-w-6xl space-y-8 pb-12">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-slate-900 border border-slate-800 p-6 md:p-8 shadow-xl">
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-indigo-500/20 p-2.5 text-indigo-400 border border-indigo-500/30 shadow-inner">
                <FiSliders className="h-6 w-6" />
              </div>
              <h1 className="text-2xl font-bold tracking-tight text-white md:text-3xl">Staff Settings</h1>
            </div>
            <p className="mt-2 text-sm text-slate-400 max-w-xl">
              Manage your staff profile details, security credentials, and work notification settings.
            </p>
          </div>
        </div>

        {/* Tab Filters */}
        <div className="mt-6 flex flex-wrap items-center gap-2 border-t border-slate-800/80 pt-4">
          {[
            { id: 'all', label: 'All Settings', icon: <FiSliders className="h-4 w-4" /> },
            { id: 'summary', label: 'Account Summary', icon: <FiInfo className="h-4 w-4" /> },
            { id: 'profile', label: 'Profile Information', icon: <FiUser className="h-4 w-4" /> },
            { id: 'security', label: 'Change Password', icon: <FiLock className="h-4 w-4" /> },
            { id: 'notifications', label: 'Notification Settings', icon: <FiBell className="h-4 w-4" /> },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-medium transition-all duration-200 ${
                activeTab === tab.id
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                  : 'bg-slate-900/60 text-slate-400 hover:bg-slate-800 hover:text-slate-200'
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Grid Layout for Cards */}
      <div className="grid grid-cols-1 gap-8">
        {/* SECTION 1: ACCOUNT SUMMARY (READ ONLY) */}
        {(activeTab === 'all' || activeTab === 'summary') && (
          <section className="relative overflow-hidden rounded-2xl border border-slate-800 bg-slate-950 p-6 md:p-8 shadow-xl transition-all">
            <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-indigo-500/10 blur-3xl"></div>

            <div className="flex items-center justify-between border-b border-slate-800/80 pb-4 mb-6">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-indigo-500/10 p-2 text-indigo-400">
                  <FiInfo className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white">1. Account Summary (Read Only)</h2>
                  <p className="text-xs text-slate-400">Overview of your staff account details.</p>
                </div>
              </div>

              <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-900 px-3 py-1 text-xxs font-semibold uppercase tracking-wider text-slate-400 border border-slate-800">
                <FiInfo className="h-3 w-3 text-indigo-400" /> Read Only
              </span>
            </div>

            {/* Main Overview Layout */}
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 pb-6 border-b border-slate-800/60">
              <div className="flex items-center gap-5">
                <div className="relative shrink-0">
                  <div className="h-20 w-20 overflow-hidden rounded-full ring-4 ring-indigo-500/20 bg-slate-800 flex items-center justify-center text-white text-2xl font-bold uppercase shadow-md">
                    {getProfileImageUrl() ? (
                      <img
                        src={getProfileImageUrl()}
                        alt="Staff Avatar"
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <span>{profileForm.fullName?.charAt(0) || 'S'}</span>
                    )}
                  </div>
                  <span className="absolute bottom-0 right-0 h-4 w-4 rounded-full bg-emerald-500 ring-2 ring-slate-950" title="Active Staff"></span>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-xl font-bold text-white tracking-tight">{profileForm.fullName || 'Staff Member'}</h3>
                    <span className="rounded-md bg-indigo-500/10 px-2 py-0.5 text-xs font-semibold text-indigo-400 border border-indigo-500/20">
                      Staff Member
                    </span>
                  </div>
                  <p className="text-xs font-medium text-slate-400 flex items-center gap-1.5">
                    <FiMail className="h-3.5 w-3.5 text-slate-500" /> {profileForm.email || user?.email}
                  </p>
                </div>
              </div>

              {/* Status Badge */}
              <div className="flex items-center gap-3 bg-slate-900/60 border border-slate-800/80 px-4 py-3 rounded-xl">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400">
                  <FiCheckCircle className="h-6 w-6" />
                </div>
                <div>
                  <span className="text-xxs font-semibold uppercase tracking-wider text-slate-500">Account Status</span>
                  <p className="text-sm font-bold text-emerald-400 flex items-center gap-1.5">
                    {accountMetadata.status}
                  </p>
                </div>
              </div>
            </div>

            {/* Details Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6">
              <div className="rounded-xl border border-slate-800/80 bg-slate-900/40 p-4 space-y-1">
                <span className="text-xxs font-semibold uppercase tracking-wider text-slate-500 flex items-center gap-1">
                  <FiBriefcase className="h-3 w-3 text-indigo-400" /> Staff ID
                </span>
                <p className="text-xs font-semibold text-indigo-400 font-mono truncate">
                  {accountMetadata.staffId}
                </p>
              </div>

              <div className="rounded-xl border border-slate-800/80 bg-slate-900/40 p-4 space-y-1">
                <span className="text-xxs font-semibold uppercase tracking-wider text-slate-500 flex items-center gap-1">
                  <FiMail className="h-3 w-3 text-slate-400" /> Email Address
                </span>
                <p className="text-xs font-semibold text-slate-200 truncate">
                  {profileForm.email || user?.email}
                </p>
              </div>

              <div className="rounded-xl border border-slate-800/80 bg-slate-900/40 p-4 space-y-1">
                <span className="text-xxs font-semibold uppercase tracking-wider text-slate-500 flex items-center gap-1">
                  <FiCalendar className="h-3 w-3 text-slate-400" /> Member Since
                </span>
                <p className="text-xs font-semibold text-slate-200 truncate">
                  {accountMetadata.createdAt}
                </p>
              </div>
            </div>
          </section>
        )}

        {/* SECTION 2: PROFILE INFORMATION */}
        {(activeTab === 'all' || activeTab === 'profile') && (
          <section className="rounded-2xl border border-slate-800 bg-slate-950 p-6 md:p-8 shadow-xl transition-all">
            <div className="flex items-center gap-3 border-b border-slate-800/80 pb-4 mb-6">
              <div className="rounded-lg bg-indigo-500/10 p-2 text-indigo-400">
                <FiUser className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white">2. Profile Information</h2>
                <p className="text-xs text-slate-400">Update your avatar, name, and phone number.</p>
              </div>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-6">
              {/* Profile Picture Upload */}
              <div className="flex flex-col sm:flex-row items-center gap-6 p-4 rounded-xl bg-slate-900/60 border border-slate-800/80">
                <div className="relative group">
                  <div className="h-24 w-24 overflow-hidden rounded-full ring-4 ring-indigo-500/30 bg-slate-800 flex items-center justify-center text-white text-2xl font-bold uppercase shadow-lg">
                    {getProfileImageUrl() ? (
                      <img
                        src={getProfileImageUrl()}
                        alt="Staff Profile"
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <span>{profileForm.fullName?.charAt(0) || 'S'}</span>
                    )}
                  </div>

                  {uploadingImage && (
                    <div className="absolute inset-0 rounded-full bg-slate-950/70 flex items-center justify-center">
                      <div className="h-6 w-6 animate-spin rounded-full border-2 border-indigo-400 border-t-transparent"></div>
                    </div>
                  )}

                  <label
                    htmlFor="staff-image-input"
                    className="absolute bottom-0 right-0 flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-indigo-600 text-white shadow-md hover:bg-indigo-500 transition-colors"
                    title="Upload profile picture"
                  >
                    <FiCamera className="h-4 w-4" />
                    <input
                      id="staff-image-input"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleImageChange}
                      disabled={uploadingImage}
                    />
                  </label>
                </div>

                <div className="text-center sm:text-left space-y-1">
                  <h3 className="text-sm font-semibold text-white">Profile Photo</h3>
                  <p className="text-xs text-slate-400">
                    Upload your staff profile photo (JPG, PNG, WebP).
                  </p>
                  <label
                    htmlFor="staff-image-input"
                    className="inline-block cursor-pointer mt-2 text-xs font-semibold text-indigo-400 hover:text-indigo-300 transition-colors"
                  >
                    Click to browse file
                  </label>
                </div>
              </div>

              {/* Editable & Read-Only Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Full Name */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-2">
                    Full Name <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    name="fullName"
                    value={profileForm.fullName}
                    onChange={handleProfileChange}
                    placeholder="Enter full name"
                    className="w-full rounded-xl border border-slate-800 bg-slate-900 px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-colors"
                    required
                  />
                </div>

                {/* Phone Number */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-2 flex items-center gap-1">
                    <FiSmartphone className="h-3.5 w-3.5 text-slate-400" /> Phone Number
                  </label>
                  <input
                    type="text"
                    name="phone"
                    value={profileForm.phone}
                    onChange={handleProfileChange}
                    placeholder="Enter phone number"
                    className="w-full rounded-xl border border-slate-800 bg-slate-900 px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-colors"
                  />
                </div>

                {/* Email Address (Read Only) */}
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-2 flex items-center gap-1">
                    <FiMail className="h-3.5 w-3.5 text-slate-400" /> Email Address (Read Only)
                  </label>
                  <input
                    type="email"
                    value={profileForm.email}
                    readOnly
                    disabled
                    className="w-full cursor-not-allowed rounded-xl border border-slate-800 bg-slate-900/40 px-4 py-2.5 text-sm text-slate-400 font-medium opacity-80"
                  />
                </div>

                {/* Staff ID (Read Only) */}
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-2 flex items-center gap-1">
                    <FiBriefcase className="h-3.5 w-3.5 text-indigo-400" /> Staff ID (Read Only)
                  </label>
                  <input
                    type="text"
                    value={profileForm.staffId}
                    readOnly
                    disabled
                    className="w-full cursor-not-allowed rounded-xl border border-slate-800 bg-slate-900/40 px-4 py-2.5 text-sm font-semibold text-indigo-400 font-mono opacity-80"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800/80">
                <button
                  type="button"
                  onClick={handleCancelProfile}
                  disabled={savingProfile}
                  className="flex items-center gap-2 rounded-xl px-5 py-2.5 text-xs font-semibold text-slate-300 hover:bg-slate-900 hover:text-white transition-colors"
                >
                  <FiX className="h-4 w-4" /> Cancel
                </button>

                <button
                  type="submit"
                  disabled={savingProfile}
                  className="flex items-center gap-2 rounded-xl bg-indigo-600 px-6 py-2.5 text-xs font-semibold text-white shadow-lg shadow-indigo-600/20 hover:bg-indigo-500 disabled:opacity-50 transition-all"
                >
                  {savingProfile ? (
                    <>
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                      Saving...
                    </>
                  ) : (
                    <>
                      <FiSave className="h-4 w-4" /> Save Changes
                    </>
                  )}
                </button>
              </div>
            </form>
          </section>
        )}

        {/* SECTION 3: CHANGE PASSWORD */}
        {(activeTab === 'all' || activeTab === 'security') && (
          <section className="rounded-2xl border border-slate-800 bg-slate-950 p-6 md:p-8 shadow-xl transition-all">
            <div className="flex items-center gap-3 border-b border-slate-800/80 pb-4 mb-6">
              <div className="rounded-lg bg-indigo-500/10 p-2 text-indigo-400">
                <FiLock className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white">3. Change Password</h2>
                <p className="text-xs text-slate-400">Update your account login password (minimum 8 characters).</p>
              </div>
            </div>

            <form onSubmit={handleUpdatePassword} className="space-y-6 max-w-2xl">
              {/* Current Password */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-2">
                  Current Password <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showPasswords.current ? 'text' : 'password'}
                    name="currentPassword"
                    value={passwordForm.currentPassword}
                    onChange={handlePasswordChange}
                    placeholder="Enter current password"
                    className={`w-full rounded-xl border ${
                      passwordErrors.currentPassword ? 'border-red-500' : 'border-slate-800'
                    } bg-slate-900 px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-colors pr-11`}
                  />
                  <button
                    type="button"
                    onClick={() => togglePasswordVisibility('current')}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
                  >
                    {showPasswords.current ? <FiEyeOff className="h-4 w-4" /> : <FiEye className="h-4 w-4" />}
                  </button>
                </div>
                {passwordErrors.currentPassword && (
                  <p className="mt-1.5 text-xs text-red-400">{passwordErrors.currentPassword}</p>
                )}
              </div>

              {/* New Password & Confirm Password */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-2">
                    New Password <span className="text-red-400">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showPasswords.new ? 'text' : 'password'}
                      name="newPassword"
                      value={passwordForm.newPassword}
                      onChange={handlePasswordChange}
                      placeholder="At least 8 characters"
                      className={`w-full rounded-xl border ${
                        passwordErrors.newPassword ? 'border-red-500' : 'border-slate-800'
                      } bg-slate-900 px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-colors pr-11`}
                    />
                    <button
                      type="button"
                      onClick={() => togglePasswordVisibility('new')}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
                    >
                      {showPasswords.new ? <FiEyeOff className="h-4 w-4" /> : <FiEye className="h-4 w-4" />}
                    </button>
                  </div>
                  {passwordErrors.newPassword && (
                    <p className="mt-1.5 text-xs text-red-400">{passwordErrors.newPassword}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-2">
                    Confirm Password <span className="text-red-400">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showPasswords.confirm ? 'text' : 'password'}
                      name="confirmPassword"
                      value={passwordForm.confirmPassword}
                      onChange={handlePasswordChange}
                      placeholder="Re-enter new password"
                      className={`w-full rounded-xl border ${
                        passwordErrors.confirmPassword ? 'border-red-500' : 'border-slate-800'
                      } bg-slate-900 px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-colors pr-11`}
                    />
                    <button
                      type="button"
                      onClick={() => togglePasswordVisibility('confirm')}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
                    >
                      {showPasswords.confirm ? <FiEyeOff className="h-4 w-4" /> : <FiEye className="h-4 w-4" />}
                    </button>
                  </div>
                  {passwordErrors.confirmPassword && (
                    <p className="mt-1.5 text-xs text-red-400">{passwordErrors.confirmPassword}</p>
                  )}
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={savingPassword}
                  className="flex items-center gap-2 rounded-xl bg-indigo-600 px-6 py-2.5 text-xs font-semibold text-white shadow-lg shadow-indigo-600/20 hover:bg-indigo-500 disabled:opacity-50 transition-all"
                >
                  {savingPassword ? (
                    <>
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                      Updating...
                    </>
                  ) : (
                    <>
                      <FiLock className="h-4 w-4" /> Update Password
                    </>
                  )}
                </button>
              </div>
            </form>
          </section>
        )}

        {/* SECTION 4: NOTIFICATION SETTINGS */}
        {(activeTab === 'all' || activeTab === 'notifications') && (
          <section className="rounded-2xl border border-slate-800 bg-slate-950 p-6 md:p-8 shadow-xl transition-all">
            <div className="flex items-center gap-3 border-b border-slate-800/80 pb-4 mb-6">
              <div className="rounded-lg bg-indigo-500/10 p-2 text-indigo-400">
                <FiBell className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white">4. Notification Settings</h2>
                <p className="text-xs text-slate-400">Configure notifications for assigned projects, tasks, and messages.</p>
              </div>
            </div>

            <form onSubmit={handleSaveNotifications} className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  {
                    key: 'email',
                    title: 'Email Notifications',
                    desc: 'Receive digest emails regarding task assignments and project changes.',
                  },
                  {
                    key: 'browser',
                    title: 'Browser Notifications',
                    desc: 'Enable instant push notifications inside your browser window.',
                  },
                  {
                    key: 'projects',
                    title: 'Assigned Project Updates',
                    desc: 'Get notified when milestone or status updates occur on your assigned projects.',
                  },
                  {
                    key: 'tasks',
                    title: 'Task Notifications',
                    desc: 'Alerts when new tasks or checklist items are assigned to you.',
                  },
                  {
                    key: 'messages',
                    title: 'Message Notifications',
                    desc: 'Notifications when client or admin messages are sent to your workspace.',
                  },
                ].map((item) => (
                  <div
                    key={item.key}
                    onClick={() => handleNotificationToggle(item.key)}
                    className="flex items-start justify-between cursor-pointer rounded-xl border border-slate-800 bg-slate-900/60 p-4 transition-all hover:bg-slate-900 hover:border-slate-700"
                  >
                    <div className="pr-4 space-y-1">
                      <h3 className="text-xs font-bold text-white">{item.title}</h3>
                      <p className="text-xxs text-slate-400 leading-relaxed">{item.desc}</p>
                    </div>

                    {/* Toggle Switch */}
                    <div
                      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
                        notificationsForm[item.key] ? 'bg-indigo-600' : 'bg-slate-800'
                      }`}
                    >
                      <span
                        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                          notificationsForm[item.key] ? 'translate-x-5' : 'translate-x-0'
                        }`}
                      />
                    </div>
                  </div>
                ))}
              </div>

              {/* Submit Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={savingNotifications}
                  className="flex items-center gap-2 rounded-xl bg-indigo-600 px-6 py-2.5 text-xs font-semibold text-white shadow-lg shadow-indigo-600/20 hover:bg-indigo-500 disabled:opacity-50 transition-all"
                >
                  {savingNotifications ? (
                    <>
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                      Saving...
                    </>
                  ) : (
                    <>
                      <FiSave className="h-4 w-4" /> Save Notification Settings
                    </>
                  )}
                </button>
              </div>
            </form>
          </section>
        )}
      </div>
    </div>
  );
};
