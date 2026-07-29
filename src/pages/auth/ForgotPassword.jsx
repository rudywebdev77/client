import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { forgotPassword } from '../../services/authService';
import toast from 'react-hot-toast';

export const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [simulatedToken, setSimulatedToken] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) {
      toast.error('Please enter your email');
      return;
    }

    setLoading(true);
    try {
      const res = await forgotPassword(email);
      if (res.success) {
        setSuccess(true);
        toast.success('Reset link generated!');
        if (res.resetToken) {
          setSimulatedToken(res.resetToken);
        }
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error requesting reset link');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-900 px-4 py-12 text-slate-100 sm:px-6 lg:px-8">
      <div className="absolute top-10 left-10 h-72 w-72 rounded-full bg-indigo-500/10 blur-3xl"></div>
      <div className="absolute bottom-10 right-10 h-72 w-72 rounded-full bg-purple-500/10 blur-3xl"></div>

      <div className="relative w-full max-w-md space-y-8 rounded-2xl border border-slate-800 bg-slate-950/40 p-8 shadow-2xl backdrop-blur-xl">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold tracking-tight text-white">
            Forgot Password
          </h2>
          <p className="mt-2 text-center text-sm text-slate-400">
            Enter your email to receive a password reset link
          </p>
        </div>

        {!success ? (
          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="email-address" className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Email Address
              </label>
              <input
                id="email-address"
                name="email"
                type="email"
                required
                className="relative mt-1 block w-full rounded-lg border border-slate-800 bg-slate-900/50 px-3 py-2.5 text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 sm:text-sm"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="group relative flex w-full justify-center rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors duration-200 hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-slate-900 disabled:opacity-50"
              >
                {loading ? (
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                ) : (
                  'Send Reset Link'
                )}
              </button>
            </div>
          </form>
        ) : (
          <div className="space-y-6 text-center">
            <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/5 p-4 text-emerald-400">
              A simulation password reset link has been logged to the server console.
            </div>

            {simulatedToken && (
              <div className="rounded-lg border border-indigo-500/20 bg-slate-900 p-4 text-left">
                <p className="text-xs text-slate-400 mb-2">Development Reset Link:</p>
                <Link
                  to={`/reset-password/${simulatedToken}`}
                  className="text-xs text-indigo-400 underline break-all hover:text-indigo-300"
                >
                  http://localhost:5173/reset-password/{simulatedToken}
                </Link>
              </div>
            )}
          </div>
        )}

        <div className="text-center">
          <Link
            to="/login"
            className="text-sm font-medium text-slate-400 hover:text-slate-300"
          >
            ← Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
};
