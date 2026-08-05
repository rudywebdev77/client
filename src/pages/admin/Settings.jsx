import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useCompany } from '../../context/CompanyContext';
import * as adminService from '../../services/adminService';
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
  FiClock,
  FiMail,
  FiSmartphone,
  FiInfo,
  FiCheckCircle,
  FiCheck,
  FiCheckSquare,
  FiGlobe,
  FiMapPin,
  FiSend,
  FiRefreshCw,
} from 'react-icons/fi';

export const Settings = () => {
  const { user, setUser } = useAuth();
  // Company Branding States
  const { companyName, companyLogo, supportEmail, supportPhone, website, companyAddress, companyDescription, companyTagline, getCompanyLogoUrl, updateBranding } = useCompany();
  const [activeTab, setActiveTab] = useState('all'); // 'all', 'summary', 'company', 'profile', 'security', 'notifications'

  // Loading States
  const [fetching, setFetching] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [savingNotifications, setSavingNotifications] = useState(false);

  // Company Branding States
  const [companyNameInput, setCompanyNameInput] = useState('');
  const [supportEmailInput, setSupportEmailInput] = useState('');
  const [supportPhoneInput, setSupportPhoneInput] = useState('');
  const [websiteInput, setWebsiteInput] = useState('');
  const [companyAddressInput, setCompanyAddressInput] = useState('');
  const [companyDescriptionInput, setCompanyDescriptionInput] = useState('');
  const [companyTaglineInput, setCompanyTaglineInput] = useState('');
  const [companyLogoFile, setCompanyLogoFile] = useState(null);
  const [companyLogoPreview, setCompanyLogoPreview] = useState(null);
  const [removeCompanyLogoFlag, setRemoveCompanyLogoFlag] = useState(false);
  const [savingBranding, setSavingBranding] = useState(false);

  useEffect(() => {
    setCompanyNameInput(companyName || 'Work Portal');
    setSupportEmailInput(supportEmail || '');
    setSupportPhoneInput(supportPhone || '');
    setWebsiteInput(website || '');
    setCompanyAddressInput(companyAddress || '');
    setCompanyDescriptionInput(companyDescription || '');
    setCompanyTaglineInput(companyTagline || '');
    setCompanyLogoPreview(getCompanyLogoUrl());
  }, [companyName, companyLogo, supportEmail, supportPhone, website, companyAddress, companyDescription, companyTagline]);

  const handleCompanyLogoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setCompanyLogoFile(file);
      setCompanyLogoPreview(URL.createObjectURL(file));
      setRemoveCompanyLogoFlag(false);
    }
  };

  const handleRemoveCompanyLogo = () => {
    setCompanyLogoFile(null);
    setCompanyLogoPreview(null);
    setRemoveCompanyLogoFlag(true);
  };

  const handleCancelCompanyBranding = () => {
    setCompanyNameInput(companyName || 'Work Portal');
    setSupportEmailInput(supportEmail || '');
    setSupportPhoneInput(supportPhone || '');
    setWebsiteInput(website || '');
    setCompanyAddressInput(companyAddress || '');
    setCompanyDescriptionInput(companyDescription || '');
    setCompanyTaglineInput(companyTagline || '');
    setCompanyLogoFile(null);
    setCompanyLogoPreview(getCompanyLogoUrl());
    setRemoveCompanyLogoFlag(false);
  };

  const handleSaveCompanyBranding = async (e) => {
    e.preventDefault();
    try {
      setSavingBranding(true);
      const res = await updateBranding({
        name: companyNameInput,
        supportEmail: supportEmailInput,
        supportPhone: supportPhoneInput,
        website: websiteInput,
        companyAddress: companyAddressInput,
        companyDescription: companyDescriptionInput,
        companyTagline: companyTaglineInput,
        logoFile: companyLogoFile,
        removeLogo: removeCompanyLogoFlag,
      });
      if (res.success) {
        toast.success(res.message || 'Company branding updated successfully!');
        setCompanyLogoFile(null);
        setRemoveCompanyLogoFlag(false);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update company branding');
    } finally {
      setSavingBranding(false);
    }
  };

  // ── Email Configuration States ──
  const [emailForm, setEmailForm] = useState({
    provider: 'custom',
    senderName: 'Work Portal',
    senderEmail: 'noreply@portal.com',
    replyToEmail: '',
    smtpHost: 'smtp.gmail.com',
    smtpPort: 587,
    encryption: 'TLS',
    smtpUsername: '',
    smtpPassword: '',
    isPasswordSet: false,
    connectionTimeout: 10000,
  });
  const [initialEmailForm, setInitialEmailForm] = useState(null);
  const [showSmtpPassword, setShowSmtpPassword] = useState(false);
  const [savingEmailSettings, setSavingEmailSettings] = useState(false);
  const [testEmailModalOpen, setTestEmailModalOpen] = useState(false);
  const [testEmailRecipient, setTestEmailRecipient] = useState('');
  const [sendingTestEmail, setSendingTestEmail] = useState(false);

  // Fetch Email Configuration
  const fetchEmailSettings = async () => {
    try {
      const res = await adminService.getEmailSettings();
      if (res.success && res.emailSettings) {
        const loaded = {
          provider: res.emailSettings.provider || 'custom',
          senderName: res.emailSettings.senderName || 'Work Portal',
          senderEmail: res.emailSettings.senderEmail || 'noreply@portal.com',
          replyToEmail: res.emailSettings.replyToEmail || '',
          smtpHost: res.emailSettings.smtpHost || 'smtp.gmail.com',
          smtpPort: res.emailSettings.smtpPort || 587,
          encryption: res.emailSettings.encryption || 'TLS',
          smtpUsername: res.emailSettings.smtpUsername || '',
          smtpPassword: res.emailSettings.smtpPassword || '',
          isPasswordSet: !!res.emailSettings.isPasswordSet,
          connectionTimeout: res.emailSettings.connectionTimeout || 10000,
        };
        setEmailForm(loaded);
        setInitialEmailForm(loaded);
        if (user?.email) setTestEmailRecipient(user.email);
      }
    } catch (err) {
      console.error('Failed to load email settings', err);
    }
  };

  useEffect(() => {
    fetchEmailSettings();
  }, []);

  const handleProviderSelect = (prov) => {
    if (prov === 'gmail') {
      setEmailForm((prev) => ({
        ...prev,
        provider: 'gmail',
        smtpHost: 'smtp.gmail.com',
        smtpPort: 587,
        encryption: 'TLS',
      }));
    } else if (prov === 'outlook') {
      setEmailForm((prev) => ({
        ...prev,
        provider: 'outlook',
        smtpHost: 'smtp.office365.com',
        smtpPort: 587,
        encryption: 'TLS',
      }));
    } else {
      setEmailForm((prev) => ({
        ...prev,
        provider: 'custom',
      }));
    }
  };

  const handleEmailFormChange = (e) => {
    const { name, value } = e.target;
    setEmailForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSaveEmailSettings = async (e) => {
    e.preventDefault();
    if (!emailForm.senderName || !emailForm.senderEmail || !emailForm.smtpHost || !emailForm.smtpPort || !emailForm.smtpUsername) {
      toast.error('Please fill in all required email configuration fields.');
      return;
    }
    try {
      setSavingEmailSettings(true);
      const res = await adminService.updateEmailSettings(emailForm);
      if (res.success) {
        toast.success(res.message || 'Email configuration saved successfully!');
        const updated = {
          ...emailForm,
          smtpPassword: '••••••••',
          isPasswordSet: true,
        };
        setEmailForm(updated);
        setInitialEmailForm(updated);
      }
    } catch (err) {
      if (err.response?.status === 401) {
        toast.error('Session expired. Please log in again.');
      } else {
        toast.error(err.response?.data?.message || 'Failed to save email configuration');
      }
    } finally {
      setSavingEmailSettings(false);
    }
  };

  const handleResetEmailSettings = () => {
    if (initialEmailForm) {
      setEmailForm(initialEmailForm);
      toast.success('Email settings reset to last saved state.');
    }
  };

  const handleTriggerSendTestEmail = async (e) => {
    e.preventDefault();
    if (!testEmailRecipient) {
      toast.error('Please enter a destination email address.');
      return;
    }
    try {
      setSendingTestEmail(true);
      const res = await adminService.sendTestEmail({ testEmailRecipient });
      if (res.success) {
        toast.success(res.message || 'Test email sent successfully!');
        setTestEmailModalOpen(false);
      }
    } catch (err) {
      if (err.response?.status === 401) {
        toast.error('Session expired. Please log in again.');
      } else {
        toast.error(err.response?.data?.message || 'Failed to send test email');
      }
    } finally {
      setSendingTestEmail(false);
    }
  };

  // Form States
  // 1. Profile Info
  const [profileForm, setProfileForm] = useState({
    fullName: '',
    username: '',
    phone: '',
    email: '',
    role: 'Admin',
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
    security: true,
  });

  // 4. Account Info (Read-only metadata)
  const [accountMetadata, setAccountMetadata] = useState({
    createdAt: '',
    lastLogin: '',
    lastPasswordChange: '',
  });

  // Image upload preview state
  const [imagePreview, setImagePreview] = useState(null);

  // Fetch admin profile on mount
  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        setFetching(true);
        const data = await adminService.getAdminProfile();
        if (data.success && data.user) {
          const u = data.user;
          const initialProfile = {
            fullName: u.fullName || '',
            username: u.username || '',
            phone: u.phone || '',
            email: u.email || '',
            role: 'Admin',
            profileImage: u.profileImage || '',
          };
          setProfileForm(initialProfile);
          setOriginalProfile(initialProfile);

          if (u.notifications) {
            setNotificationsForm({
              email: u.notifications.email ?? true,
              browser: u.notifications.browser ?? true,
              projects: u.notifications.projects ?? true,
              security: u.notifications.security ?? true,
            });
          }

          setAccountMetadata({
            createdAt: u.createdAt ? new Date(u.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : 'N/A',
            lastLogin: u.lastLogin ? new Date(u.lastLogin).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' }) : new Date().toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' }),
            lastPasswordChange: u.lastPasswordChange ? new Date(u.lastPasswordChange).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' }) : 'Never changed recently',
          });

          // Sync auth user context
          setUser(u);
        }
      } catch (err) {
        console.error('Error loading admin profile:', err);
        toast.error('Failed to load profile settings');
      } finally {
        setFetching(false);
      }
    };

    fetchAdminData();
  }, [setUser]);

  // Additional state for Profile Email & Security Confirmation
  const [profileCurrentPassword, setProfileCurrentPassword] = useState('');
  const [showProfileCurrentPassword, setShowProfileCurrentPassword] = useState(false);
  const [emailConfirmModalOpen, setEmailConfirmModalOpen] = useState(false);
  const [resendingVerification, setResendingVerification] = useState(false);
  const [cancelingVerification, setCancelingVerification] = useState(false);

  // Profile Information Handlers
  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfileForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleCancelProfile = () => {
    setProfileForm(originalProfile);
    setProfileCurrentPassword('');
    setImagePreview(null);
    toast.dismiss();
    toast('Profile changes discarded', { icon: 'ℹ️' });
  };

  const handleSaveProfile = async (e) => {
    if (e) e.preventDefault();

    if (!profileForm.fullName.trim()) {
      toast.error('Full Name is required');
      return;
    }

    const normalizedEmail = profileForm.email.toLowerCase().trim();
    if (!normalizedEmail) {
      toast.error('Email address is required');
      return;
    }

    const emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    if (!emailRegex.test(normalizedEmail)) {
      toast.error('Please enter a valid email address');
      return;
    }

    await executeSaveProfile();
  };


  const executeSaveProfile = async () => {
    try {
      setSavingProfile(true);
      const normalizedEmail = profileForm.email.toLowerCase().trim();
      const isEmailChanging = normalizedEmail !== (user?.email || '').toLowerCase().trim();

      const payload = {
        fullName: profileForm.fullName,
        username: profileForm.username,
        phone: profileForm.phone,
        email: normalizedEmail,
        currentPassword: isEmailChanging ? profileCurrentPassword : undefined,
      };

      console.log('[DEBUG Frontend] Email value before sending request:', profileForm.email);
      console.log('[DEBUG Frontend] Full payload being sent to /api/admin/profile:', payload);

      const data = await adminService.updateAdminProfile(payload);

      console.log('[DEBUG Frontend] Response received from backend:', data);

      if (data.success && data.user) {
        toast.success(data.message || 'Profile information updated successfully!');
        const updated = {
          ...profileForm,
          fullName: data.user.fullName,
          username: data.user.username,
          phone: data.user.phone,
          email: data.user.email,
        };
        setProfileForm(updated);
        setOriginalProfile(updated);
        setUser(data.user);
        setProfileCurrentPassword('');
        setEmailConfirmModalOpen(false);
      } else {
        toast.error(data.message || 'Failed to update profile');
      }
    } catch (err) {
      console.error('[DEBUG Frontend] Error during profile update request:', err);
      toast.error(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setSavingProfile(false);
    }
  };


  const handleResendVerification = async () => {
    try {
      setResendingVerification(true);
      const res = await adminService.resendEmailVerification();
      if (res.success) {
        toast.success(res.message || 'Verification email resent successfully!');
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
      const res = await adminService.cancelEmailVerification();
      if (res.success) {
        toast.success(res.message || 'Pending email change cancelled');
        if (res.user) {
          setUser(res.user);
          setProfileForm((prev) => ({ ...prev, email: res.user.email }));
        }
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to cancel email verification');
    } finally {
      setCancelingVerification(false);
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
      const data = await adminService.uploadAdminProfileImage(formData);
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
      const data = await adminService.changeAdminPassword({
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
        setAccountMetadata((prev) => ({
          ...prev,
          lastPasswordChange: new Date().toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' }),
        }));
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update password');
    } finally {
      setSavingPassword(false);
    }
  };

  // Notifications Handlers
  const handleNotificationToggle = (key) => {
    setNotificationsForm((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSaveNotifications = async (e) => {
    e.preventDefault();
    try {
      setSavingNotifications(true);
      const data = await adminService.updateAdminNotifications(notificationsForm);
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
              <h1 className="text-2xl font-bold tracking-tight text-white md:text-3xl">Admin Profile Settings</h1>
            </div>
            <p className="mt-2 text-sm text-slate-400 max-w-xl">
              Manage your administrator account details, security credentials, and notification alerts.
            </p>
          </div>

          <div className="flex items-center gap-2 rounded-xl bg-slate-900/80 px-4 py-2 text-xs font-semibold text-indigo-400 border border-slate-700/60 shadow-sm">
            <FiShield className="h-4 w-4 text-emerald-400" />
            <span>Administrator Access Active</span>
          </div>
        </div>

        {/* Tab Filters */}
        <div className="mt-6 flex flex-wrap items-center gap-2 border-t border-slate-800/80 pt-4">
          {[
            { id: 'all', label: 'All Settings', icon: <FiSliders className="h-4 w-4" /> },
            { id: 'summary', label: 'Account Summary', icon: <FiInfo className="h-4 w-4" /> },
            { id: 'company', label: 'Company Settings', icon: <FiCheckSquare className="h-4 w-4" /> },
            { id: 'email', label: 'Email Configuration', icon: <FiMail className="h-4 w-4" /> },
            { id: 'profile', label: 'Profile Information', icon: <FiUser className="h-4 w-4" /> },
            { id: 'security', label: 'Security & Password', icon: <FiLock className="h-4 w-4" /> },
            { id: 'notifications', label: 'Notifications', icon: <FiBell className="h-4 w-4" /> },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-medium transition-all duration-200 ${activeTab === tab.id
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

        {/* TOP CARD: ACCOUNT SUMMARY (READ ONLY) */}
        {(activeTab === 'all' || activeTab === 'summary') && (
          <section className="relative overflow-hidden rounded-2xl border border-slate-800 bg-slate-950 p-6 md:p-8 shadow-xl transition-all">
            {/* Ambient background accent */}
            <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-indigo-500/10 blur-3xl"></div>

            <div className="flex items-center justify-between border-b border-slate-800/80 pb-4 mb-6">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-indigo-500/10 p-2 text-indigo-400">
                  <FiInfo className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white">Account Summary</h2>
                  <p className="text-xs text-slate-400">Overview of your administrator profile and status (Read Only).</p>
                </div>
              </div>

              <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-900 px-3 py-1 text-xxs font-semibold uppercase tracking-wider text-slate-400 border border-slate-800">
                <FiInfo className="h-3 w-3 text-indigo-400" /> Read Only
              </span>
            </div>

            {/* Main Info Card Layout */}
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 pb-6 border-b border-slate-800/60">
              {/* Profile Avatar & Primary Info */}
              <div className="flex items-center gap-5">
                <div className="relative shrink-0">
                  <div className="h-20 w-20 overflow-hidden rounded-full ring-4 ring-indigo-500/20 bg-slate-800 flex items-center justify-center text-white text-2xl font-bold uppercase shadow-md">
                    {getProfileImageUrl() ? (
                      <img
                        src={getProfileImageUrl()}
                        alt="Admin Avatar"
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <span>{profileForm.fullName?.charAt(0) || 'A'}</span>
                    )}
                  </div>
                  <span className="absolute bottom-0 right-0 h-4 w-4 rounded-full bg-emerald-500 ring-2 ring-slate-950" title="Active Account"></span>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-xl font-bold text-white tracking-tight">{profileForm.fullName || 'Administrator'}</h3>
                    <span className="rounded-md bg-indigo-500/10 px-2 py-0.5 text-xs font-semibold text-indigo-400 border border-indigo-500/20">
                      Administrator
                    </span>
                  </div>
                  <p className="text-xs font-medium text-slate-400 flex items-center gap-1.5">
                    <FiMail className="h-3.5 w-3.5 text-slate-500" /> {profileForm.email || user?.email || 'admin@portal.com'}
                  </p>
                  {profileForm.username && (
                    <p className="text-xxs font-mono text-slate-500">@{profileForm.username}</p>
                  )}
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
                    Active
                  </p>
                </div>
              </div>
            </div>

            {/* Read-Only Details Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-6">
              {/* Phone Number */}
              <div className="rounded-xl border border-slate-800/80 bg-slate-900/40 p-4 space-y-1">
                <span className="text-xxs font-semibold uppercase tracking-wider text-slate-500 flex items-center gap-1">
                  <FiSmartphone className="h-3 w-3 text-slate-400" /> Phone Number
                </span>
                <p className="text-xs font-semibold text-slate-200 truncate">
                  {profileForm.phone || 'Not specified'}
                </p>
              </div>

              {/* Member Since */}
              <div className="rounded-xl border border-slate-800/80 bg-slate-900/40 p-4 space-y-1">
                <span className="text-xxs font-semibold uppercase tracking-wider text-slate-500 flex items-center gap-1">
                  <FiCalendar className="h-3 w-3 text-slate-400" /> Member Since
                </span>
                <p className="text-xs font-semibold text-slate-200 truncate">
                  {accountMetadata.createdAt}
                </p>
              </div>

              {/* Last Login */}
              <div className="rounded-xl border border-slate-800/80 bg-slate-900/40 p-4 space-y-1">
                <span className="text-xxs font-semibold uppercase tracking-wider text-slate-500 flex items-center gap-1">
                  <FiClock className="h-3 w-3 text-emerald-400" /> Last Login
                </span>
                <p className="text-xs font-semibold text-slate-200 truncate">
                  {accountMetadata.lastLogin}
                </p>
              </div>

              {/* Last Password Change */}
              <div className="rounded-xl border border-slate-800/80 bg-slate-900/40 p-4 space-y-1">
                <span className="text-xxs font-semibold uppercase tracking-wider text-slate-500 flex items-center gap-1">
                  <FiLock className="h-3 w-3 text-amber-400" /> Last Password Change
                </span>
                <p className="text-xs font-semibold text-slate-200 truncate">
                  {accountMetadata.lastPasswordChange}
                </p>
              </div>
            </div>
          </section>
        )}

        {/* 🏢 COMPANY SETTINGS (ADMIN ONLY) */}
        {(activeTab === 'all' || activeTab === 'company') && (
          <section className="relative overflow-hidden rounded-2xl border border-slate-800 bg-slate-950 p-6 md:p-8 shadow-xl transition-all">
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-4 mb-6">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-indigo-500/10 p-2 text-indigo-400">
                  <FiCheckSquare className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white flex items-center gap-2">
                    🏢 Company Settings
                  </h2>
                  <p className="text-xs text-slate-400">Manage company logo, organization name, contact details, and website branding.</p>
                </div>
              </div>

              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-3 py-1 text-xxs font-semibold uppercase tracking-wider text-emerald-400 border border-emerald-500/20">
                <FiShield className="h-3 w-3" /> Admin Access Only
              </span>
            </div>

            <form onSubmit={handleSaveCompanyBranding} className="space-y-6">
              {/* Company Logo Row */}
              <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/80">
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-3">
                  Company Logo
                </label>
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
                  <div className="relative shrink-0">
                    <div className="h-20 w-20 overflow-hidden rounded-2xl border border-slate-800 bg-slate-900 flex items-center justify-center text-slate-400 shadow-md">
                      {companyLogoPreview ? (
                        <img src={companyLogoPreview} alt="Company Logo Preview" className="h-full w-full object-cover" />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center bg-gradient-to-tr from-indigo-500 to-purple-500 text-white">
                          <FiCheckSquare className="h-10 w-10" />
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-3">
                    <label className="cursor-pointer inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-bold text-white shadow-md shadow-indigo-600/20 hover:bg-indigo-500 transition">
                      <FiCamera className="h-4 w-4" />
                      <span>{companyLogoPreview ? 'Replace Logo' : 'Upload Company Logo'}</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleCompanyLogoChange}
                      />
                    </label>

                    {(companyLogoPreview || companyLogo) && (
                      <button
                        type="button"
                        onClick={handleRemoveCompanyLogo}
                        className="inline-flex items-center gap-1.5 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-2 text-xs font-bold text-red-400 hover:bg-red-500/20 transition"
                      >
                        <FiX className="h-4 w-4" />
                        <span>Remove Logo</span>
                      </button>
                    )}
                  </div>
                </div>
                <p className="mt-2 text-xxs text-slate-500">Recommended format: PNG, SVG, or JPG (max 2MB). Automatically updates across the application.</p>
              </div>

              {/* Company Information Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Company Name */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
                    Company Name
                  </label>
                  <input
                    type="text"
                    value={companyNameInput}
                    onChange={(e) => setCompanyNameInput(e.target.value)}
                    placeholder="Enter company name..."
                    className="w-full rounded-xl border border-slate-800 bg-slate-900/60 px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    required
                  />
                </div>

                {/* Sidebar Subtitle / Tagline */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2 flex items-center justify-between">
                    <span>Sidebar Subtitle / Role Label</span>
                    <span className="text-xxs text-indigo-400 font-normal lowercase">(e.g. ADMINISTRATOR)</span>
                  </label>
                  <input
                    type="text"
                    value={companyTaglineInput}
                    onChange={(e) => setCompanyTaglineInput(e.target.value)}
                    placeholder="e.g. ADMINISTRATOR, Work Portal, Admin Space"
                    className="w-full rounded-xl border border-slate-800 bg-slate-900/60 px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                  <p className="mt-1 text-xxs text-slate-500">Custom subtitle displayed under company name in the sidebar.</p>
                </div>

                {/* Company Description */}
                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
                    Company Description (Optional)
                  </label>
                  <textarea
                    rows={2}
                    value={companyDescriptionInput}
                    onChange={(e) => setCompanyDescriptionInput(e.target.value)}
                    placeholder="Short description of your organization..."
                    className="w-full rounded-xl border border-slate-800 bg-slate-900/60 px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>

                {/* Support Email */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
                    Support Email
                  </label>
                  <div className="relative">
                    <FiMail className="absolute left-3.5 top-3 h-4 w-4 text-slate-500" />
                    <input
                      type="email"
                      value={supportEmailInput}
                      onChange={(e) => setSupportEmailInput(e.target.value)}
                      placeholder="support@company.com"
                      className="w-full rounded-xl border border-slate-800 bg-slate-900/60 py-2.5 pl-10 pr-4 text-sm text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>
                </div>

                {/* Support Phone */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
                    Support Phone
                  </label>
                  <div className="relative">
                    <FiSmartphone className="absolute left-3.5 top-3 h-4 w-4 text-slate-500" />
                    <input
                      type="text"
                      value={supportPhoneInput}
                      onChange={(e) => setSupportPhoneInput(e.target.value)}
                      placeholder="+1 (555) 000-0000"
                      className="w-full rounded-xl border border-slate-800 bg-slate-900/60 py-2.5 pl-10 pr-4 text-sm text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>
                </div>

                {/* Website */}
                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
                    Website URL
                  </label>
                  <div className="relative">
                    <FiGlobe className="absolute left-3.5 top-3 h-4 w-4 text-slate-500" />
                    <input
                      type="url"
                      value={websiteInput}
                      onChange={(e) => setWebsiteInput(e.target.value)}
                      placeholder="https://company.com"
                      className="w-full rounded-xl border border-slate-800 bg-slate-900/60 py-2.5 pl-10 pr-4 text-sm text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>
                </div>

                {/* Company Address (Optional) */}
                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
                    Company Address (Optional)
                  </label>
                  <div className="relative">
                    <FiMapPin className="absolute left-3.5 top-3 h-4 w-4 text-slate-500" />
                    <textarea
                      rows={3}
                      value={companyAddressInput}
                      onChange={(e) => setCompanyAddressInput(e.target.value)}
                      placeholder="123 Corporate Blvd, Suite 400, New York, NY 10001"
                      className="w-full rounded-xl border border-slate-800 bg-slate-900/60 py-2.5 pl-10 pr-4 text-sm text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>
                </div>
              </div>

              {/* Action Buttons: Save Changes & Cancel */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800/80">
                <button
                  type="button"
                  onClick={handleCancelCompanyBranding}
                  disabled={savingBranding}
                  className="rounded-xl border border-slate-800 bg-slate-900 px-5 py-2.5 text-xs font-semibold text-slate-300 hover:bg-slate-800 hover:text-white transition disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingBranding}
                  className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-6 py-2.5 text-xs font-bold text-white shadow-md shadow-indigo-600/20 hover:bg-indigo-500 disabled:opacity-50 transition"
                >
                  {savingBranding ? (
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  ) : (
                    <FiSave className="h-4 w-4" />
                  )}
                  <span>Save Changes</span>
                </button>
              </div>
            </form>
          </section>
        )}

        {/* 📧 EMAIL CONFIGURATION (ADMIN ONLY) */}
        {(activeTab === 'all' || activeTab === 'email') && (
          <section className="relative overflow-hidden rounded-2xl border border-slate-800 bg-slate-950 p-6 md:p-8 shadow-xl transition-all">
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-4 mb-6">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-indigo-500/10 p-2 text-indigo-400">
                  <FiMail className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white flex items-center gap-2">
                    📧 Email Configuration
                  </h2>
                  <p className="text-xs text-slate-400">Configure global SMTP settings used across the entire application for email notifications, password resets, and alerts.</p>
                </div>
              </div>

              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-3 py-1 text-xxs font-semibold uppercase tracking-wider text-emerald-400 border border-emerald-500/20">
                <FiShield className="h-3 w-3" /> Admin Access Only
              </span>
            </div>

            {/* Provider Selection */}
            <div className="mb-6 p-4 rounded-xl bg-slate-900/60 border border-slate-800/80 space-y-3">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300">
                Select Email Provider Preset
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {[
                  { id: 'gmail', label: 'Gmail', desc: 'smtp.gmail.com (Port 587 TLS)' },
                  { id: 'outlook', label: 'Outlook / Office 365', desc: 'smtp.office365.com (Port 587 TLS)' },
                  { id: 'custom', label: 'Custom SMTP', desc: 'Manual host, port & encryption' },
                ].map((prov) => (
                  <button
                    key={prov.id}
                    type="button"
                    onClick={() => handleProviderSelect(prov.id)}
                    className={`flex flex-col items-start p-3 rounded-xl border text-left transition-all ${
                      emailForm.provider === prov.id
                        ? 'border-indigo-500 bg-indigo-600/10 text-white ring-1 ring-indigo-500'
                        : 'border-slate-800 bg-slate-950/60 text-slate-400 hover:bg-slate-900 hover:text-slate-200'
                    }`}
                  >
                    <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                      {prov.id === emailForm.provider && <FiCheck className="h-3.5 w-3.5 text-indigo-400" />}
                      {prov.label}
                    </span>
                    <span className="text-xxs text-slate-500 mt-1">{prov.desc}</span>
                  </button>
                ))}
              </div>
            </div>

            <form onSubmit={handleSaveEmailSettings} className="space-y-6">
              {/* Sender Information */}
              <div className="space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 border-b border-slate-800/60 pb-2">
                  Sender Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                      Sender Name *
                    </label>
                    <input
                      type="text"
                      name="senderName"
                      value={emailForm.senderName}
                      onChange={handleEmailFormChange}
                      placeholder="e.g. ABC Technologies"
                      className="w-full rounded-xl border border-slate-800 bg-slate-900/60 px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                      Sender Email Address *
                    </label>
                    <input
                      type="email"
                      name="senderEmail"
                      value={emailForm.senderEmail}
                      onChange={handleEmailFormChange}
                      placeholder="noreply@abctechnologies.com"
                      className="w-full rounded-xl border border-slate-800 bg-slate-900/60 px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                      Reply-To Email <span className="text-slate-500 font-normal lowercase">(Optional)</span>
                    </label>
                    <input
                      type="email"
                      name="replyToEmail"
                      value={emailForm.replyToEmail}
                      onChange={handleEmailFormChange}
                      placeholder="support@abctechnologies.com"
                      className="w-full rounded-xl border border-slate-800 bg-slate-900/60 px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>
                </div>
              </div>

              {/* SMTP Configuration */}
              <div className="space-y-4 pt-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 border-b border-slate-800/60 pb-2">
                  SMTP Server Credentials
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                      SMTP Host *
                    </label>
                    <input
                      type="text"
                      name="smtpHost"
                      value={emailForm.smtpHost}
                      onChange={handleEmailFormChange}
                      placeholder="e.g. smtp.gmail.com"
                      className="w-full rounded-xl border border-slate-800 bg-slate-900/60 px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                      SMTP Port *
                    </label>
                    <input
                      type="number"
                      name="smtpPort"
                      value={emailForm.smtpPort}
                      onChange={handleEmailFormChange}
                      placeholder="587"
                      className="w-full rounded-xl border border-slate-800 bg-slate-900/60 px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                      Encryption
                    </label>
                    <select
                      name="encryption"
                      value={emailForm.encryption}
                      onChange={handleEmailFormChange}
                      className="w-full rounded-xl border border-slate-800 bg-slate-900/60 px-4 py-2.5 text-xs text-white focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    >
                      <option value="TLS">TLS (Recommended - Port 587)</option>
                      <option value="SSL">SSL (Port 465)</option>
                      <option value="None">None (Port 25)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                      SMTP Username *
                    </label>
                    <input
                      type="text"
                      name="smtpUsername"
                      value={emailForm.smtpUsername}
                      onChange={handleEmailFormChange}
                      placeholder="user@domain.com"
                      className="w-full rounded-xl border border-slate-800 bg-slate-900/60 px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                      SMTP Password (App Password)
                    </label>
                    <div className="relative">
                      <input
                        type={showSmtpPassword ? 'text' : 'password'}
                        name="smtpPassword"
                        value={emailForm.smtpPassword}
                        onChange={handleEmailFormChange}
                        placeholder={emailForm.isPasswordSet ? '••••••••' : 'Enter App Password'}
                        className="w-full rounded-xl border border-slate-800 bg-slate-900/60 px-4 py-2.5 pr-10 text-xs text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      />
                      <button
                        type="button"
                        onClick={() => setShowSmtpPassword(!showSmtpPassword)}
                        className="absolute right-3 top-2.5 text-slate-400 hover:text-white"
                        title={showSmtpPassword ? 'Hide Password' : 'Show Password'}
                      >
                        {showSmtpPassword ? <FiEyeOff className="h-4 w-4" /> : <FiEye className="h-4 w-4" />}
                      </button>
                    </div>
                    <p className="mt-1 text-xxs text-slate-500">Stored using AES-256 encryption. Password is masked in API responses.</p>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                      Connection Timeout <span className="text-slate-500 font-normal lowercase">(ms)</span>
                    </label>
                    <input
                      type="number"
                      name="connectionTimeout"
                      value={emailForm.connectionTimeout}
                      onChange={handleEmailFormChange}
                      placeholder="10000"
                      className="w-full rounded-xl border border-slate-800 bg-slate-900/60 px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-slate-800/80">
                <div className="flex items-center gap-3">
                  <button
                    type="submit"
                    disabled={savingEmailSettings}
                    className="flex items-center gap-2 rounded-xl bg-indigo-600 px-6 py-2.5 text-xs font-semibold text-white shadow-lg shadow-indigo-600/20 hover:bg-indigo-500 disabled:opacity-50 transition-all"
                  >
                    {savingEmailSettings ? (
                      <>
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                        Saving...
                      </>
                    ) : (
                      <>
                        <FiSave className="h-4 w-4" /> Save Configuration
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={handleResetEmailSettings}
                    className="flex items-center gap-1.5 rounded-xl border border-slate-800 bg-slate-900/60 px-4 py-2.5 text-xs font-semibold text-slate-300 hover:bg-slate-800 hover:text-white transition"
                  >
                    <FiRefreshCw className="h-3.5 w-3.5" /> Reset
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => setTestEmailModalOpen(true)}
                  className="flex items-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-5 py-2.5 text-xs font-bold text-emerald-400 hover:bg-emerald-500/20 transition"
                >
                  <FiSend className="h-4 w-4" /> Send Test Email
                </button>
              </div>
            </form>
          </section>
        )}

        {/* ── Test Email Modal Popup ── */}
        {testEmailModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
            <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-950 p-6 shadow-2xl space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <FiSend className="h-5 w-5 text-emerald-400" />
                  <h3 className="text-sm font-bold text-white">Send Real Test Email</h3>
                </div>
                <button
                  type="button"
                  onClick={() => setTestEmailModalOpen(false)}
                  className="rounded-lg p-1 text-slate-400 hover:bg-slate-800 hover:text-white"
                >
                  <FiX className="h-4 w-4" />
                </button>
              </div>

              <p className="text-xs text-slate-400 leading-relaxed">
                Enter a destination email address to verify that your configured SMTP server sends emails successfully.
              </p>

              <form onSubmit={handleTriggerSendTestEmail} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                    Destination Email Address
                  </label>
                  <input
                    type="email"
                    value={testEmailRecipient}
                    onChange={(e) => setTestEmailRecipient(e.target.value)}
                    placeholder="admin@example.com"
                    className="w-full rounded-xl border border-slate-800 bg-slate-900/60 px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    required
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setTestEmailModalOpen(false)}
                    className="rounded-xl border border-slate-800 bg-slate-900/60 px-4 py-2 text-xs font-semibold text-slate-300 hover:bg-slate-800"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={sendingTestEmail}
                    className="flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-2 text-xs font-bold text-white hover:bg-emerald-500 disabled:opacity-50 transition shadow-md shadow-emerald-600/20"
                  >
                    {sendingTestEmail ? (
                      <>
                        <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                        Sending Test Email...
                      </>
                    ) : (
                      <>
                        <FiSend className="h-3.5 w-3.5" /> Dispatch Test Email
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* SECTION 1: PROFILE INFORMATION */}
        {(activeTab === 'all' || activeTab === 'profile') && (
          <section className="rounded-2xl border border-slate-800 bg-slate-950 p-6 md:p-8 shadow-xl transition-all">
            <div className="flex items-center gap-3 border-b border-slate-800/80 pb-4 mb-6">
              <div className="rounded-lg bg-indigo-500/10 p-2 text-indigo-400">
                <FiUser className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white">Profile Information</h2>
                <p className="text-xs text-slate-400">Update your avatar, name, username, and contact number.</p>
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
                        alt="Admin Profile"
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <span>{profileForm.fullName?.charAt(0) || 'A'}</span>
                    )}
                  </div>

                  {uploadingImage && (
                    <div className="absolute inset-0 rounded-full bg-slate-950/70 flex items-center justify-center">
                      <div className="h-6 w-6 animate-spin rounded-full border-2 border-indigo-400 border-t-transparent"></div>
                    </div>
                  )}

                  <label
                    htmlFor="profile-image-input"
                    className="absolute bottom-0 right-0 flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-indigo-600 text-white shadow-md hover:bg-indigo-500 transition-colors"
                    title="Upload profile picture"
                  >
                    <FiCamera className="h-4 w-4" />
                    <input
                      id="profile-image-input"
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
                    Upload a high-resolution avatar. Supported formats: JPG, PNG, or WebP.
                  </p>
                  <label
                    htmlFor="profile-image-input"
                    className="inline-block cursor-pointer mt-2 text-xs font-semibold text-indigo-400 hover:text-indigo-300 transition-colors"
                  >
                    Click to browse file
                  </label>
                </div>
              </div>

              {/* Pending Email Verification Alert Banner */}
              {user?.pendingEmail && (
                <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 animate-fade-in">
                  <div className="flex items-start gap-3">
                    <div className="rounded-lg bg-amber-500/20 p-2 text-amber-400 shrink-0">
                      <FiMail className="h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-amber-300 uppercase tracking-wider flex items-center gap-2">
                        <span>Email Verification Pending</span>
                      </h4>
                      <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                        A verification link was sent to <strong className="text-white underline">{user.pendingEmail}</strong>. Your active login email remains <strong className="text-white">{user.email}</strong> until verification is complete.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={handleResendVerification}
                      disabled={resendingVerification}
                      className="rounded-xl bg-amber-500/20 border border-amber-500/40 px-3.5 py-2 text-xs font-bold text-amber-300 hover:bg-amber-500/30 transition disabled:opacity-50"
                    >
                      {resendingVerification ? 'Sending...' : 'Resend Email'}
                    </button>
                    <button
                      type="button"
                      onClick={handleCancelVerification}
                      disabled={cancelingVerification}
                      className="rounded-xl bg-slate-900 border border-slate-700 px-3.5 py-2 text-xs font-semibold text-slate-400 hover:text-white transition disabled:opacity-50"
                    >
                      {cancelingVerification ? 'Canceling...' : 'Cancel Request'}
                    </button>
                  </div>
                </div>
              )}

              {/* Editable & Read-Only Fields Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Full Name */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-2">
                    Full Name <span className="text-red-400">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      name="fullName"
                      value={profileForm.fullName}
                      onChange={handleProfileChange}
                      placeholder="e.g. John Doe"
                      className="w-full rounded-xl border border-slate-800 bg-slate-900 px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-colors"
                      required
                    />
                  </div>
                </div>

                {/* Username */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-2">
                    Username
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      name="username"
                      value={profileForm.username}
                      onChange={handleProfileChange}
                      placeholder="e.g. admin_john"
                      className="w-full rounded-xl border border-slate-800 bg-slate-900 px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-colors"
                    />
                  </div>
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
                    placeholder="e.g. +1 (555) 019-2834"
                    className="w-full rounded-xl border border-slate-800 bg-slate-900 px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-colors"
                  />
                </div>

                {/* Email Address (Editable) */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-2 flex items-center justify-between">
                    <span className="flex items-center gap-1">
                      <FiMail className="h-3.5 w-3.5 text-indigo-400" /> Email Address <span className="text-red-400">*</span>
                    </span>
                    {user?.pendingEmail && (
                      <span className="text-xxs font-bold text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-md">
                        Pending Verification
                      </span>
                    )}
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={profileForm.email}
                    onChange={handleProfileChange}
                    placeholder="admin@portal.com"
                    className="w-full rounded-xl border border-slate-800 bg-slate-900 px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-colors"
                    required
                  />
                  <p className="mt-1 text-xxs text-slate-500">
                    Changing email address requires current password confirmation.
                  </p>
                </div>

                {/* Role (Read-Only) */}
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-2 flex items-center gap-1">
                    <FiShield className="h-3.5 w-3.5 text-indigo-400" /> Role (Read Only)
                  </label>
                  <input
                    type="text"
                    value={profileForm.role}
                    readOnly
                    disabled
                    className="w-full cursor-not-allowed rounded-xl border border-slate-800 bg-slate-900/40 px-4 py-2.5 text-sm font-semibold text-indigo-400 capitalize opacity-80"
                  />
                </div>

                {/* Security Password Requirement box when Email Value is Modified */}
                {profileForm.email.toLowerCase().trim() !== (user?.email || '').toLowerCase().trim() && (
                  <div className="md:col-span-2 p-4 rounded-xl bg-slate-900/90 border border-indigo-500/30 space-y-2.5 animate-fade-in shadow-inner">
                    <label className="block text-xs font-bold uppercase tracking-wider text-indigo-300 flex items-center gap-2">
                      <FiLock className="h-4 w-4 text-indigo-400" /> Confirm Current Password to Change Email
                    </label>
                    <div className="relative">
                      <input
                        type={showProfileCurrentPassword ? 'text' : 'password'}
                        value={profileCurrentPassword}
                        onChange={(e) => setProfileCurrentPassword(e.target.value)}
                        placeholder="Enter your current password..."
                        className="w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-2.5 pr-10 text-xs text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowProfileCurrentPassword(!showProfileCurrentPassword)}
                        className="absolute right-3 top-2.5 text-slate-400 hover:text-white"
                        title={showProfileCurrentPassword ? 'Hide password' : 'Show password'}
                      >
                        {showProfileCurrentPassword ? <FiEyeOff className="h-4 w-4" /> : <FiEye className="h-4 w-4" />}
                      </button>
                    </div>
                    <p className="text-xxs text-slate-400">
                      🔒 Backend security: Your current password will be authenticated before issuing the email verification request.
                    </p>
                  </div>
                )}
              </div>


              {/* Profile Buttons */}
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

        {/* SECTION 2: CHANGE PASSWORD */}
        {(activeTab === 'all' || activeTab === 'security') && (
          <section className="rounded-2xl border border-slate-800 bg-slate-950 p-6 md:p-8 shadow-xl transition-all">
            <div className="flex items-center gap-3 border-b border-slate-800/80 pb-4 mb-6">
              <div className="rounded-lg bg-indigo-500/10 p-2 text-indigo-400">
                <FiLock className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white">Change Password</h2>
                <p className="text-xs text-slate-400">Ensure your account is protected with a strong 8+ character password.</p>
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
                    className={`w-full rounded-xl border ${passwordErrors.currentPassword ? 'border-red-500' : 'border-slate-800'
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
                      className={`w-full rounded-xl border ${passwordErrors.newPassword ? 'border-red-500' : 'border-slate-800'
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
                      className={`w-full rounded-xl border ${passwordErrors.confirmPassword ? 'border-red-500' : 'border-slate-800'
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

        {/* SECTION 3: NOTIFICATIONS */}
        {(activeTab === 'all' || activeTab === 'notifications') && (
          <section className="rounded-2xl border border-slate-800 bg-slate-950 p-6 md:p-8 shadow-xl transition-all">
            <div className="flex items-center gap-3 border-b border-slate-800/80 pb-4 mb-6">
              <div className="rounded-lg bg-indigo-500/10 p-2 text-indigo-400">
                <FiBell className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white">Notifications</h2>
                <p className="text-xs text-slate-400">Control alert notifications for system events and updates.</p>
              </div>
            </div>

            <form onSubmit={handleSaveNotifications} className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  {
                    key: 'email',
                    title: 'Email Notifications',
                    desc: 'Receive digest emails for new user requests and critical alerts.',
                  },
                  {
                    key: 'browser',
                    title: 'Browser Notifications',
                    desc: 'Enable instant push notifications inside your browser window.',
                  },
                  {
                    key: 'projects',
                    title: 'Project Updates',
                    desc: 'Get notified when project statuses or milestones change.',
                  },
                  {
                    key: 'security',
                    title: 'Security Alerts',
                    desc: 'Alerts regarding new admin sign-ins or password changes.',
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
                      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${notificationsForm[item.key] ? 'bg-indigo-600' : 'bg-slate-800'
                        }`}
                    >
                      <span
                        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${notificationsForm[item.key] ? 'translate-x-5' : 'translate-x-0'
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

        {/* ── Confirmation Modal for Email Address Change ── */}
        {emailConfirmModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-fade-in">
            <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-950 p-6 shadow-2xl space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <FiMail className="h-5 w-5 text-indigo-400" />
                  <h3 className="text-sm font-bold text-white">Confirm Email Address Change</h3>
                </div>
                <button
                  type="button"
                  onClick={() => setEmailConfirmModalOpen(false)}
                  className="rounded-lg p-1 text-slate-400 hover:bg-slate-800 hover:text-white"
                >
                  <FiX className="h-4 w-4" />
                </button>
              </div>

              <div className="space-y-3 text-xs text-slate-300 leading-relaxed">
                <p>Are you sure you want to change your administrator email address?</p>
                <div className="rounded-xl bg-slate-900/80 p-3.5 border border-slate-800 space-y-1.5">
                  <p className="text-slate-400 flex justify-between">
                    <span>Current Active Email:</span>
                    <span className="text-white font-medium">{user?.email}</span>
                  </p>
                  <p className="text-indigo-400 flex justify-between">
                    <span>New Email Address:</span>
                    <span className="text-white font-bold">{profileForm.email.toLowerCase().trim()}</span>
                  </p>
                </div>
                <p className="text-slate-400 text-xxs leading-normal">
                  📧 A verification link will be sent to the new email address. Your active login email will remain unchanged until verification is complete.
                </p>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setEmailConfirmModalOpen(false)}
                  disabled={savingProfile}
                  className="rounded-xl border border-slate-800 bg-slate-900 px-4 py-2 text-xs font-semibold text-slate-300 hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={executeSaveProfile}
                  disabled={savingProfile}
                  className="flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2 text-xs font-bold text-white hover:bg-indigo-500 disabled:opacity-50 transition shadow-md shadow-indigo-600/20"
                >
                  {savingProfile ? (
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
    </div>
  );
};

