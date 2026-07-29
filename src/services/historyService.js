import api from './api';

export const getProjectHistory = async (projectId) => {
  const response = await api.get(`/history/project/${projectId}`);
  return response.data;
};

export const getRequestHistory = async (requestId) => {
  const response = await api.get(`/history/request/${requestId}`);
  return response.data;
};
