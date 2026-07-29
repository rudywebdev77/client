import api from './api';

export const getProjectReports = async () => {
  const response = await api.get('/reports/projects');
  return response.data;
};

export const getUserReports = async () => {
  const response = await api.get('/reports/users');
  return response.data;
};
