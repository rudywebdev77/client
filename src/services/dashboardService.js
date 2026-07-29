import api from './api';

export const getAdminDashboard = async () => {
  const response = await api.get('/dashboard/admin');
  return response.data;
};

export const getStaffDashboard = async () => {
  const response = await api.get('/dashboard/staff');
  return response.data;
};

export const getClientDashboard = async () => {
  const response = await api.get('/dashboard/client');
  return response.data;
};
