import api from './api';

export const createRequest = async (formData) => {
  const response = await api.post('/requests', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

export const getRequests = async (params) => {
  const response = await api.get('/requests', { params });
  return response.data;
};

export const getRequest = async (id) => {
  const response = await api.get(`/requests/${id}`);
  return response.data;
};

export const reviewRequest = async (id, reviewData) => {
  const response = await api.put(`/requests/${id}/review`, reviewData);
  return response.data;
};
