import api from './api';

export const createProject = async (formData) => {
  const response = await api.post('/projects', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};

export const getProjects = async (params) => {
  const response = await api.get('/projects', { params });
  return response.data;
};

export const getProject = async (id) => {
  const response = await api.get(`/projects/${id}`);
  return response.data;
};

export const updateProject = async (id, data) => {
  const response = await api.put(`/projects/${id}`, data);
  return response.data;
};

export const changeProjectStatus = async (id, statusData) => {
  const response = await api.patch(`/projects/${id}/status`, statusData);
  return response.data;
};

export const assignStaff = async (id, staffIds) => {
  const response = await api.patch(`/projects/${id}/assign`, { staffIds });
  return response.data;
};

export const acceptProject = async (id) => {
  const response = await api.patch(`/projects/${id}/accept`);
  return response.data;
};

export const submitForReview = async (id, formData) => {
  const response = await api.patch(`/projects/${id}/submit-review`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};

export const approveWork = async (id) => {
  const response = await api.patch(`/projects/${id}/approve`);
  return response.data;
};

export const requestRevision = async (id, remarks) => {
  const response = await api.patch(`/projects/${id}/revision`, { remarks });
  return response.data;
};
