import api from './api';

export const getClientActivities = async (params = {}) => {
  const response = await api.get('/client/activity', { params });
  return response.data;
};

export const getActivityStats = async () => {
  const response = await api.get('/client/activity/stats');
  return response.data;
};
