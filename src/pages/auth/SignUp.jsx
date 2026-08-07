import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import toast from 'react-hot-toast';
import { FiArrowRight, FiEye, FiEyeOff, FiUser, FiMail, FiPhone, FiLock } from 'react-icons/fi';

export const SignUp = () => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  const { signupUser, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const rawFrom = location.state?.from?.pathname;
  const isPublicRoute = rawFrom && ['/login', '/signup', '/forgot-password', '/reset-password', '/verify-email'].some(p => rawFrom.startsWith(p));
  const from = isPublicRoute || !rawFrom ? '/' : rawFrom;

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!fullName || !email || !password) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    const res = await signupUser({ fullName, email, phone, password });
    if (res.success) {
      toast.success('Account created successfully!');
      navigate(from, { replace: true });
    } else {
      toast.error(res.error || 'Registration failed');
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-[#090d16] p-4 sm:p-6 md:p-8 font-sans antialiased selection:bg-purple-500 selection:text-white overflow-hidden">
      {/* Ambient background radial glow */}
      <div className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[500px] w-[500px] rounded-full bg-gradient-to-tr from-purple-600/15 via-indigo-600/15 to-blue-600/10 blur-[130px]" />

      {/* Main SaaS Card Container */}
      <div className="relative w-full max-w-[460px] rounded-2xl border border-slate-700/40 bg-[#131b2e] p-8 sm:p-10 shadow-2xl shadow-black/60 backdrop-blur-2xl transition-all duration-200">
        {/* Top App Logo & Header */}
        <div className="text-center">
          <img
            src="/wodwes-logo.svg"
            alt="WODWES Logo"
            className="mx-auto mb-3 h-16 w-16 object-contain filter drop-shadow-[0_0_12px_rgba(168,85,247,0.4)]"
          />
          <h1 className="text-3xl font-extrabold tracking-tight text-white">
            WODWES
          </h1>
          <p className="mt-2 text-sm font-medium text-slate-300">
            Create an account to access your workspace.
          </p>
        </div>

        {/* Signup Form */}
        <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
          <div className="space-y-4">
            {/* Full Name */}
            <div>
              <label
                htmlFor="full-name"
                className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5"
              >
                Full Name <span className="text-purple-400">*</span>
              </label>
              <input
                id="full-name"
                name="fullName"
                type="text"
                required
                className="w-full rounded-xl border border-slate-200/80 bg-[#f8fafc] px-4 py-3 text-sm font-semibold text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-indigo-500/20 transition-all duration-200"
                placeholder="John Doe"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
              />
            </div>

            {/* Email Address */}
            <div>
              <label
                htmlFor="email-address"
                className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5"
              >
                Email Address <span className="text-purple-400">*</span>
              </label>
              <input
                id="email-address"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="w-full rounded-xl border border-slate-200/80 bg-[#f8fafc] px-4 py-3 text-sm font-semibold text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-indigo-500/20 transition-all duration-200"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            {/* Phone Number */}
            <div>
              <label
                htmlFor="phone"
                className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5"
              >
                Phone Number <span className="text-slate-500 font-normal">(Optional)</span>
              </label>
              <input
                id="phone"
                name="phone"
                type="tel"
                className="w-full rounded-xl border border-slate-200/80 bg-[#f8fafc] px-4 py-3 text-sm font-semibold text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-indigo-500/20 transition-all duration-200"
                placeholder="+1 (555) 000-0000"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>

            {/* Password */}
            <div>
              <label
                htmlFor="password"
                className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5"
              >
                Password <span className="text-purple-400">*</span>
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  className="w-full rounded-xl border border-slate-200/80 bg-[#f8fafc] px-4 py-3 pr-11 text-sm font-semibold text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-indigo-500/20 transition-all duration-200"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 transition-colors p-1 focus:outline-none"
                  title={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <FiEyeOff className="h-4 w-4" /> : <FiEye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <label
                htmlFor="confirm-password"
                className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5"
              >
                Confirm Password <span className="text-purple-400">*</span>
              </label>
              <input
                id="confirm-password"
                name="confirmPassword"
                type={showPassword ? 'text' : 'password'}
                required
                className="w-full rounded-xl border border-slate-200/80 bg-[#f8fafc] px-4 py-3 text-sm font-semibold text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-indigo-500/20 transition-all duration-200"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="group relative flex w-full items-center justify-center rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-indigo-700 py-3.5 px-4 text-sm font-bold text-white shadow-lg shadow-purple-600/25 hover:shadow-purple-600/40 hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.99] transition-all duration-200 ease-in-out disabled:opacity-50 disabled:pointer-events-none"
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  <span>Creating Account...</span>
                </div>
              ) : (
                <span className="flex items-center gap-2">
                  <span>Create Account</span>
                  <FiArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </span>
              )}
            </button>
          </div>
        </form>

        {/* Link to Login */}
        <p className="mt-6 text-center text-xs text-slate-400">
          Already have an account?{' '}
          <Link
            to="/login"
            className="font-semibold text-purple-400 hover:text-purple-300 hover:underline transition-colors"
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
};
