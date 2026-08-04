import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import * as companyService from '../services/companyService';

const CompanyContext = createContext();

export const CompanyProvider = ({ children }) => {
  const [companyName, setCompanyName] = useState('Work Portal');
  const [companyLogo, setCompanyLogo] = useState('');
  const [supportEmail, setSupportEmail] = useState('');
  const [supportPhone, setSupportPhone] = useState('');
  const [website, setWebsite] = useState('');
  const [companyAddress, setCompanyAddress] = useState('');
  const [companyDescription, setCompanyDescription] = useState('');
  const [companyTagline, setCompanyTagline] = useState('');
  const [companyCreatedAt, setCompanyCreatedAt] = useState('');
  const [loading, setLoading] = useState(true);
  const [isCompanyModalOpen, setIsCompanyModalOpen] = useState(false);

  const openCompanyModal = () => setIsCompanyModalOpen(true);
  const closeCompanyModal = () => setIsCompanyModalOpen(false);

  const fetchBranding = useCallback(async () => {
    try {
      setLoading(true);
      const data = await companyService.getCompanyBranding();
      if (data.success && data.company) {
        setCompanyName(data.company.companyName || 'Work Portal');
        setCompanyLogo(data.company.companyLogo || '');
        setSupportEmail(data.company.supportEmail || '');
        setSupportPhone(data.company.supportPhone || '');
        setWebsite(data.company.website || '');
        setCompanyAddress(data.company.companyAddress || '');
        setCompanyDescription(data.company.companyDescription || '');
        setCompanyTagline(data.company.companyTagline || '');
        setCompanyCreatedAt(data.company.createdAt || '');
      }
    } catch (err) {
      console.error('Failed to load company branding:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBranding();
  }, [fetchBranding]);

  const getCompanyLogoUrl = (logoPath) => {
    const logo = logoPath !== undefined ? logoPath : companyLogo;
    if (!logo) return null;
    if (logo.startsWith('http')) return logo;
    const serverUrl = import.meta.env.VITE_SERVER_URL || 'http://localhost:5000';
    return `${serverUrl}/uploads/${logo}`;
  };

  const updateBranding = async ({
    name,
    supportEmail: sEmail,
    supportPhone: sPhone,
    website: web,
    companyAddress: cAddr,
    companyDescription: cDesc,
    companyTagline: cTagline,
    logoFile,
    removeLogo,
  }) => {
    const formData = new FormData();
    if (name !== undefined) formData.append('companyName', name);
    if (sEmail !== undefined) formData.append('supportEmail', sEmail);
    if (sPhone !== undefined) formData.append('supportPhone', sPhone);
    if (web !== undefined) formData.append('website', web);
    if (cAddr !== undefined) formData.append('companyAddress', cAddr);
    if (cDesc !== undefined) formData.append('companyDescription', cDesc);
    if (cTagline !== undefined) formData.append('companyTagline', cTagline);
    if (removeLogo) formData.append('removeLogo', 'true');
    if (logoFile) formData.append('logo', logoFile);

    const res = await companyService.updateCompanyBranding(formData);
    if (res.success && res.company) {
      setCompanyName(res.company.companyName || 'Work Portal');
      setCompanyLogo(res.company.companyLogo || '');
      setSupportEmail(res.company.supportEmail || '');
      setSupportPhone(res.company.supportPhone || '');
      setWebsite(res.company.website || '');
      setCompanyAddress(res.company.companyAddress || '');
      setCompanyDescription(res.company.companyDescription || '');
      setCompanyTagline(res.company.companyTagline || '');
      setCompanyCreatedAt(res.company.createdAt || '');
    }
    return res;
  };

  return (
    <CompanyContext.Provider
      value={{
        companyName,
        companyLogo,
        supportEmail,
        supportPhone,
        website,
        companyAddress,
        companyDescription,
        companyTagline,
        companyCreatedAt,
        loading,
        getCompanyLogoUrl,
        updateBranding,
        refetchBranding: fetchBranding,
        isCompanyModalOpen,
        openCompanyModal,
        closeCompanyModal,
      }}
    >
      {children}
    </CompanyContext.Provider>
  );
};

export const useCompany = () => {
  const context = useContext(CompanyContext);
  if (!context) {
    return {
      companyName: 'Work Portal',
      companyLogo: '',
      supportEmail: '',
      supportPhone: '',
      website: '',
      companyAddress: '',
      companyDescription: '',
      companyTagline: '',
      companyCreatedAt: '',
      loading: false,
      getCompanyLogoUrl: () => null,
      updateBranding: async () => ({ success: false }),
      refetchBranding: async () => {},
      isCompanyModalOpen: false,
      openCompanyModal: () => {},
      closeCompanyModal: () => {},
    };
  }
  return context;
};
