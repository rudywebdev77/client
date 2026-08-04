import api from './api';

export const getClientProfile = async () => {
  const response = await api.get('/client/profile');
  return response.data;
};

export const updateClientProfile = async (data) => {
  const response = await api.put('/client/profile', data);
  return response.data;
};

export const changeClientPassword = async (data) => {
  const response = await api.put('/client/change-password', data);
  return response.data;
};

export const uploadClientProfileImage = async (formData) => {
  const response = await api.post('/client/upload-profile-image', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

export const updateClientNotifications = async (notifications) => {
  const response = await api.put('/client/notifications', notifications);
  return response.data;
};
