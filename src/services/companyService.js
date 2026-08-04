import api from './api';

export const getCompanyBranding = async () => {
  const response = await api.get('/company');
  return response.data;
};

export const updateCompanyBranding = async (formData) => {
  const response = await api.put('/company', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};
