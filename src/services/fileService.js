import api from './api';

export const getAllFiles = async () => {
  const response = await api.get('/files');
  return response.data;
};

export const getProjectFiles = async (projectId) => {
  const response = await api.get(`/files/project/${projectId}`);
  return response.data;
};

export const getRequestFiles = async (requestId) => {
  const response = await api.get(`/files/request/${requestId}`);
  return response.data;
};
