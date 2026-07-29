import api from './api';

export const getProjectMessages = async (projectId) => {
  const response = await api.get(`/messages/project/${projectId}`);
  return response.data;
};

export const sendMessage = async (formData) => {
  const response = await api.post('/messages', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};

export const markMessageRead = async (id) => {
  const response = await api.patch(`/messages/${id}/read`);
  return response.data;
};
