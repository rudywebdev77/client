import api from './api';

export const getStaffProfile = async () => {
  const response = await api.get('/staff/profile');
  return response.data;
};

export const updateStaffProfile = async (data) => {
  const response = await api.put('/staff/profile', data);
  return response.data;
};

export const changeStaffPassword = async (data) => {
  const response = await api.put('/staff/change-password', data);
  return response.data;
};

export const uploadStaffProfileImage = async (formData) => {
  const response = await api.post('/staff/upload-profile-image', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

export const updateStaffNotifications = async (notifications) => {
  const response = await api.put('/staff/notifications', notifications);
  return response.data;
};
