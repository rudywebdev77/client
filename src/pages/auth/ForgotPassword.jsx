import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { forgotPassword, verifyOtp, resetPassword } from '../../services/authService';
import toast from 'react-hot-toast';
import { FiMail, FiKey, FiLock, FiCheckCircle, FiAlertCircle, FiEye, FiEyeOff, FiArrowLeft, FiRefreshCw, FiArrowRight } from 'react-icons/fi';

export const ForgotPassword = () => {
  const navigate = useNavigate();

  // Steps: 1 = Email Input, 2 = 6-Digit OTP Verification, 3 = New Password Reset
  const [step, setStep] = useState(1);

  // Form States
  const [email, setEmail] = useState('');
  const [otpDigits, setOtpDigits] = useState(['', '', '', '', '', '']);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Status & Timers
  const [loading, setLoading] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  // Refs for 6 OTP input boxes
  const otpInputRefs = [
    useRef(null),
    useRef(null),
    useRef(null),
    useRef(null),
    useRef(null),
    useRef(null),
  ];

  // Cooldown countdown effect
  useEffect(() => {
    let timer;
    if (cooldown > 0) {
      timer = setInterval(() => {
        setCooldown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [cooldown]);

  // Focus first OTP box when entering Step 2
  useEffect(() => {
    if (step === 2 && otpInputRefs[0].current) {
      otpInputRefs[0].current.focus();
    }
  }, [step]);

  // Step 1: Send OTP to Email
  const handleSendEmail = async (e) => {
    e.preventDefault();
    if (!email) {
      toast.error('Please enter your email address.');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      toast.error('Please enter a valid email address.');
      return;
    }

    setLoading(true);
    try {
      const res = await forgotPassword(email.trim());
      if (res.success) {
        toast.success(res.message || 'Verification code sent.');
        setStep(2);
        setCooldown(60); // 60-second resend cooldown
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'This account does not exist.');
    } finally {
      setLoading(false);
    }
  };

  // Step 2 OTP Digits Handlers
  const handleOtpDigitChange = (index, value) => {
    const cleaned = value.replace(/[^0-9]/g, '');
    if (!cleaned && value !== '') return;

    const newDigits = [...otpDigits];
    newDigits[index] = cleaned.slice(-1);
    setOtpDigits(newDigits);

    if (cleaned && index < 5 && otpInputRefs[index + 1].current) {
      otpInputRefs[index + 1].current.focus();
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace') {
      if (!otpDigits[index] && index > 0 && otpInputRefs[index - 1].current) {
        otpInputRefs[index - 1].current.focus();
      }
    }
  };

  const handleOtpPaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/[^0-9]/g, '').slice(0, 6);
    if (pasted) {
      const newDigits = ['', '', '', '', '', ''];
      for (let i = 0; i < pasted.length; i++) {
        newDigits[i] = pasted[i];
      }
      setOtpDigits(newDigits);
      const focusIndex = Math.min(pasted.length, 5);
      if (otpInputRefs[focusIndex].current) {
        otpInputRefs[focusIndex].current.focus();
      }
    }
  };

  // Step 2: Verify OTP
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    const otpCode = otpDigits.join('');
    if (otpCode.length < 6) {
      toast.error('Please enter the full 6-digit verification code.');
      return;
    }

    setLoading(true);
    try {
      const res = await verifyOtp(email, otpCode);
      if (res.success) {
        toast.success(res.message || 'Verification successful.');
        setStep(3);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid verification code.');
    } finally {
      setLoading(false);
    }
  };

  // Resend OTP
  const handleResendOtp = async () => {
    if (cooldown > 0) return;
    setLoading(true);
    try {
      const res = await forgotPassword(email.trim());
      if (res.success) {
        toast.success('New verification code sent to your email.');
        setOtpDigits(['', '', '', '', '', '']);
        setCooldown(60);
        if (otpInputRefs[0].current) otpInputRefs[0].current.focus();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to resend code.');
    } finally {
      setLoading(false);
    }
  };

  // Password Rules & Strength Score
  const getPasswordRules = (pass) => ({
    minChars: pass.length >= 8,
    hasUpper: /[A-Z]/.test(pass),
    hasLower: /[a-z]/.test(pass),
    hasNumber: /[0-9]/.test(pass),
    hasSpecial: /[!@#$%^&*(),.?":{}|<>]/.test(pass),
  });

  const rules = getPasswordRules(newPassword);
  const passedRulesCount = Object.values(rules).filter(Boolean).length;

  const getStrengthLabel = () => {
    if (!newPassword) return { label: '', color: 'bg-slate-700' };
    if (passedRulesCount <= 2) return { label: 'Weak', color: 'bg-red-500' };
    if (passedRulesCount === 3) return { label: 'Fair', color: 'bg-amber-500' };
    if (passedRulesCount === 4) return { label: 'Good', color: 'bg-blue-500' };
    return { label: 'Strong', color: 'bg-emerald-500' };
  };

  const strength = getStrengthLabel();

  // Step 3: Reset Password
  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!newPassword || !confirmPassword) {
      toast.error('Please fill in all password fields.');
      return;
    }

    if (passedRulesCount < 5) {
      toast.error('Please meet all password requirements.');
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      const otpCode = otpDigits.join('');
      const res = await resetPassword(email, otpCode, newPassword);
      if (res.success) {
        toast.success(res.message || 'Password updated successfully!');
        toast.success('Confirmation email sent.');
        setTimeout(() => {
          navigate('/login');
        }, 1500);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-[#090d16] p-4 sm:p-6 md:p-8 font-sans antialiased selection:bg-purple-500 selection:text-white overflow-hidden">
      {/* Ambient background radial glow */}
      <div className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[500px] w-[500px] rounded-full bg-gradient-to-tr from-purple-600/15 via-indigo-600/15 to-blue-600/10 blur-[130px]" />

      {/* Main SaaS Card Container */}
      <div className="relative w-full max-w-[440px] rounded-2xl border border-slate-700/40 bg-[#131b2e] p-8 sm:p-10 shadow-2xl shadow-black/60 backdrop-blur-2xl transition-all duration-200">
        
        {/* Step Indicator Header */}
        <div className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-500 text-white shadow-lg shadow-purple-600/30">
            {step === 1 && <FiMail className="h-6 w-6" />}
            {step === 2 && <FiKey className="h-6 w-6" />}
            {step === 3 && <FiLock className="h-6 w-6" />}
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white">
            {step === 1 && 'Forgot Password'}
            {step === 2 && 'Verify Code'}
            {step === 3 && 'New Password'}
          </h1>
          <p className="mt-2.5 text-sm font-medium text-slate-300 leading-relaxed">
            {step === 1 && 'Enter your registered email address to receive a verification code.'}
            {step === 2 && `We sent a 6-digit verification code to ${email}. Code expires in 10 minutes.`}
            {step === 3 && 'Choose a strong new password to protect your account.'}
          </p>
        </div>

        {/* ── STEP 1: ENTER REGISTERED EMAIL ── */}
        {step === 1 && (
          <form onSubmit={handleSendEmail} className="mt-8 space-y-6">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
                Email Address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full rounded-xl border border-slate-200/80 bg-[#f8fafc] px-4 py-3 text-sm font-semibold text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-indigo-500/20 transition-all duration-200"
              />
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="group relative flex w-full items-center justify-center rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-indigo-700 py-3.5 px-4 text-sm font-bold text-white shadow-lg shadow-purple-600/25 hover:shadow-purple-600/40 hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.99] transition-all duration-200 ease-in-out disabled:opacity-50 disabled:pointer-events-none"
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    <span>Sending Code...</span>
                  </div>
                ) : (
                  <span className="flex items-center gap-2">
                    <span>Send Verification Code</span>
                    <FiArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </span>
                )}
              </button>
            </div>
          </form>
        )}

        {/* ── STEP 2: 6-DIGIT OTP VERIFICATION ── */}
        {step === 2 && (
          <form onSubmit={handleVerifyOtp} className="mt-8 space-y-6">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-3 text-center">
                Enter 6-Digit Verification Code
              </label>
              
              {/* 6 Individual Digit Input Boxes */}
              <div className="flex items-center justify-center gap-2 sm:gap-2.5">
                {otpDigits.map((digit, idx) => (
                  <input
                    key={idx}
                    ref={otpInputRefs[idx]}
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpDigitChange(idx, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                    onPaste={handleOtpPaste}
                    className="h-12 w-11 sm:w-12 rounded-xl border border-slate-200/80 bg-[#f8fafc] text-center text-lg font-bold text-slate-900 focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-indigo-500/20 transition-all duration-200 shadow-inner"
                  />
                ))}
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading || otpDigits.join('').length < 6}
                className="group relative flex w-full items-center justify-center rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-indigo-700 py-3.5 px-4 text-sm font-bold text-white shadow-lg shadow-purple-600/25 hover:shadow-purple-600/40 hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.99] transition-all duration-200 ease-in-out disabled:opacity-50 disabled:pointer-events-none"
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    <span>Verifying Code...</span>
                  </div>
                ) : (
                  <span className="flex items-center gap-2">
                    <span>Verify Code</span>
                    <FiArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </span>
                )}
              </button>
            </div>

            {/* Resend Code Bar */}
            <div className="flex items-center justify-between pt-3 border-t border-slate-800/80 text-xs text-slate-400">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="flex items-center gap-1.5 font-semibold hover:text-white transition-colors duration-200"
              >
                <FiArrowLeft className="h-3.5 w-3.5" /> Back
              </button>

              <button
                type="button"
                onClick={handleResendOtp}
                disabled={cooldown > 0 || loading}
                className="flex items-center gap-1.5 font-semibold text-purple-400 hover:text-purple-300 disabled:opacity-50 transition-colors duration-200"
              >
                <FiRefreshCw className={`h-3.5 w-3.5 ${cooldown > 0 ? 'animate-spin' : ''}`} />
                {cooldown > 0 ? `Resend Code (${cooldown}s)` : 'Resend Code'}
              </button>
            </div>
          </form>
        )}

        {/* ── STEP 3: CREATE NEW PASSWORD ── */}
        {step === 3 && (
          <form onSubmit={handleResetPassword} className="mt-8 space-y-6">
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
                  New Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full rounded-xl border border-slate-200/80 bg-[#f8fafc] px-4 py-3 pr-10 text-sm font-semibold text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-indigo-500/20 transition-all duration-200"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-3.5 text-slate-400 hover:text-slate-700 transition-colors"
                  >
                    {showPassword ? <FiEyeOff className="h-4 w-4" /> : <FiEye className="h-4 w-4" />}
                  </button>
                </div>

                {/* Password Strength Indicator */}
                {newPassword && (
                  <div className="mt-2 space-y-1">
                    <div className="flex items-center justify-between text-xxs font-semibold">
                      <span className="text-slate-400">Password Strength:</span>
                      <span className={passedRulesCount >= 4 ? 'text-emerald-400' : 'text-amber-400'}>
                        {strength.label}
                      </span>
                    </div>
                    <div className="h-1.5 w-full rounded-full bg-slate-800 overflow-hidden">
                      <div
                        className={`h-full transition-all duration-300 ${strength.color}`}
                        style={{ width: `${(passedRulesCount / 5) * 100}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
                  Confirm New Password
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full rounded-xl border border-slate-200/80 bg-[#f8fafc] px-4 py-3 pr-10 text-sm font-semibold text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-indigo-500/20 transition-all duration-200"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3.5 top-3.5 text-slate-400 hover:text-slate-700 transition-colors"
                  >
                    {showConfirmPassword ? <FiEyeOff className="h-4 w-4" /> : <FiEye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {/* Password Complexity Checklist */}
              <div className="rounded-xl border border-slate-800/80 bg-slate-900/60 p-3.5 space-y-1.5 text-xxs">
                <p className="font-bold text-slate-400 uppercase tracking-wider">Password Requirements:</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-slate-400">
                  <div className={`flex items-center gap-1.5 ${rules.minChars ? 'text-emerald-400 font-semibold' : ''}`}>
                    {rules.minChars ? <FiCheckCircle className="h-3 w-3" /> : <FiAlertCircle className="h-3 w-3 text-slate-600" />}
                    <span>At least 8 characters</span>
                  </div>
                  <div className={`flex items-center gap-1.5 ${rules.hasUpper ? 'text-emerald-400 font-semibold' : ''}`}>
                    {rules.hasUpper ? <FiCheckCircle className="h-3 w-3" /> : <FiAlertCircle className="h-3 w-3 text-slate-600" />}
                    <span>One uppercase letter (A-Z)</span>
                  </div>
                  <div className={`flex items-center gap-1.5 ${rules.hasLower ? 'text-emerald-400 font-semibold' : ''}`}>
                    {rules.hasLower ? <FiCheckCircle className="h-3 w-3" /> : <FiAlertCircle className="h-3 w-3 text-slate-600" />}
                    <span>One lowercase letter (a-z)</span>
                  </div>
                  <div className={`flex items-center gap-1.5 ${rules.hasNumber ? 'text-emerald-400 font-semibold' : ''}`}>
                    {rules.hasNumber ? <FiCheckCircle className="h-3 w-3" /> : <FiAlertCircle className="h-3 w-3 text-slate-600" />}
                    <span>One number (0-9)</span>
                  </div>
                  <div className={`flex items-center gap-1.5 ${rules.hasSpecial ? 'text-emerald-400 font-semibold' : ''} sm:col-span-2`}>
                    {rules.hasSpecial ? <FiCheckCircle className="h-3 w-3" /> : <FiAlertCircle className="h-3 w-3 text-slate-600" />}
                    <span>One special character (!@#$%^&*)</span>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading || passedRulesCount < 5 || newPassword !== confirmPassword}
                className="group relative flex w-full items-center justify-center rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-indigo-700 py-3.5 px-4 text-sm font-bold text-white shadow-lg shadow-purple-600/25 hover:shadow-purple-600/40 hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.99] transition-all duration-200 ease-in-out disabled:opacity-50 disabled:pointer-events-none"
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    <span>Updating Password...</span>
                  </div>
                ) : (
                  <span className="flex items-center gap-2">
                    <span>Update Password</span>
                    <FiArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </span>
                )}
              </button>
            </div>
          </form>
        )}

        {/* Footer Back to Login Link */}
        <div className="text-center pt-5 mt-6 border-t border-slate-800/80">
          <Link
            to="/login"
            className="inline-flex items-center justify-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors duration-200 group"
          >
            <FiArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
            <span>Back to Login</span>
          </Link>
        </div>

      </div>
    </div>
  );
};

export default ForgotPassword;

