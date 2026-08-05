import api from './api';

export const getAdminProfile = async () => {
  const response = await api.get('/admin/profile');
  return response.data;
};

export const updateAdminProfile = async (data) => {
  const response = await api.put('/admin/profile', data);
  return response.data;
};

export const changeAdminPassword = async (data) => {
  const response = await api.put('/admin/change-password', data);
  return response.data;
};

export const uploadAdminProfileImage = async (formData) => {
  const response = await api.post('/admin/upload-profile-image', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

export const updateAdminPreferences = async (preferences) => {
  const response = await api.put('/admin/preferences', preferences);
  return response.data;
};

export const updateAdminNotifications = async (notifications) => {
  const response = await api.put('/admin/notifications', notifications);
  return response.data;
};

export const getEmailSettings = async () => {
  const response = await api.get('/admin/email-settings');
  return response.data;
};

export const updateEmailSettings = async (data) => {
  const response = await api.put('/admin/email-settings', data);
  return response.data;
};

export const sendTestEmail = async (data) => {
  const response = await api.post('/admin/email-settings/test', data);
  return response.data;
};

export const verifyEmail = async (token) => {
  const response = await api.post('/auth/verify-email', { token });
  return response.data;
};

export const resendEmailVerification = async () => {
  const response = await api.post('/auth/resend-verification');
  return response.data;
};

export const cancelEmailVerification = async () => {
  const response = await api.post('/auth/cancel-verification');
  return response.data;
};

