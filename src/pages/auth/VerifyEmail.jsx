import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { verifyEmail } from '../../services/adminService';
import { useAuth } from '../../hooks/useAuth';
import { FiCheckCircle, FiAlertCircle, FiArrowRight, FiShield, FiMail } from 'react-icons/fi';

export const VerifyEmail = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const navigate = useNavigate();
  const { user, setUser } = useAuth();

  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState(false);
  const [message, setMessage] = useState('');
  const [verifiedEmail, setVerifiedEmail] = useState('');

  useEffect(() => {
    let isMounted = true;

    const performVerification = async () => {
      if (!token) {
        setLoading(false);
        setSuccess(false);
        setMessage('Missing or invalid verification token.');
        return;
      }

      try {
        setLoading(true);
        const data = await verifyEmail(token);
        if (isMounted) {
          if (data.success) {
            setSuccess(true);
            setMessage(data.message || 'Your email address has been verified and updated successfully!');
            setVerifiedEmail(data.user?.email || '');
            if (data.user && setUser) {
              setUser(data.user);
            }
          } else {
            setSuccess(false);
            setMessage(data.message || 'Email verification failed.');
          }
        }
      } catch (err) {
        if (isMounted) {
          setSuccess(false);
          setMessage(err.response?.data?.message || 'Verification link is invalid or has expired.');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    performVerification();

    return () => {
      isMounted = false;
    };
  }, [token, setUser]);

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-slate-950 px-4 py-12 text-slate-100 font-sans">
      <div className="w-full max-w-md overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/90 p-8 shadow-2xl backdrop-blur-xl">
        {/* Header Icon */}
        <div className="flex flex-col items-center text-center space-y-4">
          {loading ? (
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-indigo-500/10 border border-indigo-500/30">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent" />
            </div>
          ) : success ? (
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
              <FiCheckCircle className="h-10 w-10 animate-bounce" />
            </div>
          ) : (
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-500/10 border border-red-500/30 text-red-400">
              <FiAlertCircle className="h-10 w-10" />
            </div>
          )}

          <div>
            <h1 className="text-xl font-bold tracking-tight text-white md:text-2xl">
              {loading ? 'Verifying Email Address...' : success ? 'Email Verified Successfully!' : 'Verification Failed'}
            </h1>
            <p className="mt-2 text-xs text-slate-400 leading-relaxed">
              {message}
            </p>
          </div>

          {verifiedEmail && (
            <div className="flex items-center gap-2 rounded-xl bg-slate-950 px-4 py-2 text-xs font-semibold text-indigo-400 border border-slate-800">
              <FiMail className="h-4 w-4" />
              <span>{verifiedEmail}</span>
            </div>
          )}
        </div>

        {/* Dynamic Action Button */}
        {!loading && (
          <div className="mt-8 space-y-3">
            {success ? (
              <button
                onClick={() => {
                  if (user?.role === 'admin') navigate('/admin/settings');
                  else if (user?.role === 'staff') navigate('/staff/profile');
                  else if (user?.role === 'client') navigate('/client/profile');
                  else navigate('/login');
                }}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-xs font-bold text-white shadow-lg shadow-indigo-600/25 hover:bg-indigo-500 transition-all"
              >
                <span>Return to Profile & Settings</span>
                <FiArrowRight className="h-4 w-4" />
              </button>
            ) : (
              <div className="space-y-2">
                <Link
                  to="/login"
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-slate-800 px-5 py-3 text-xs font-semibold text-white hover:bg-slate-700 transition"
                >
                  <span>Go to Login</span>
                </Link>
              </div>
            )}
          </div>
        )}

        {/* Footer Brand Label */}
        <div className="mt-8 border-t border-slate-800/80 pt-4 text-center">
          <p className="text-xxs text-slate-500 flex items-center justify-center gap-1">
            <FiShield className="h-3 w-3 text-indigo-400" />
            <span>Work Portal Secure Account Verification</span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default VerifyEmail;
