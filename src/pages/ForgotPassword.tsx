import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Building2,
  Mail,
  Lock,
  ArrowRight,
  ArrowLeft,
  KeyRound,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Eye,
  EyeOff,
  ShieldCheck,
} from 'lucide-react';
import { authApi } from '../api/auth.api';
import { useToast } from '../context/ToastContext';

export const ForgotPassword: React.FC = () => {
  const [step, setStep] = useState<'EMAIL' | 'RESET' | 'SUCCESS'>('EMAIL');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [challengeId, setChallengeId] = useState('');
  const [destinationMasked, setDestinationMasked] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Error & Loading States
  const [emailError, setEmailError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [confirmError, setConfirmError] = useState<string | null>(null);
  const [otpError, setOtpError] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [countdown, setCountdown] = useState(0);

  const { showSuccess, showError } = useToast();
  const navigate = useNavigate();

  // Resend Countdown Timer
  useEffect(() => {
    let timer: ReturnType<typeof setInterval>;
    if (countdown > 0) {
      timer = setInterval(() => {
        setCountdown((p) => p - 1);
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [countdown]);

  const validateEmailFormat = (val: string) => {
    const trimmed = (val || '').trim();
    if (!trimmed) return 'Official email address is required.';
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!regex.test(trimmed)) return 'Please enter a valid email address.';
    return null;
  };

  const validatePasswordStrength = (val: string) => {
    if (!val) return 'New password is required.';
    if (val.length < 8) return 'Password must be at least 8 characters long.';
    if (!/[A-Z]/.test(val)) return 'Password must contain at least one uppercase letter.';
    if (!/[0-9]/.test(val)) return 'Password must contain at least one number.';
    if (!/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(val)) {
      return 'Password must contain at least one special character.';
    }
    return null;
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setEmailError(null);

    const err = validateEmailFormat(email);
    if (err) {
      setEmailError(err);
      return;
    }

    try {
      setLoading(true);
      const res = await authApi.forgotPassword(email.trim());
      if (res.success && res.data) {
        if (res.data.challengeId) {
          setChallengeId(res.data.challengeId);
          setDestinationMasked(res.data.destinationMasked || email);
          setCountdown(30);
          setStep('RESET');
          showSuccess('Password reset verification code sent to your official email!');
        } else {
          showSuccess(res.data.message || 'If an active account exists, a code was sent.');
          setStep('RESET');
        }
      }
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Failed to send reset code. Please try again.';
      setErrorMessage(msg);
      showError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    if (countdown > 0 || resending) return;
    try {
      setResending(true);
      setErrorMessage(null);
      const res = await authApi.forgotPassword(email.trim());
      if (res.success && res.data?.challengeId) {
        setChallengeId(res.data.challengeId);
        setDestinationMasked(res.data.destinationMasked || email);
        setCountdown(30);
        showSuccess('New verification code sent to your official email!');
      }
    } catch (err: any) {
      showError(err.response?.data?.message || 'Failed to resend code');
    } finally {
      setResending(false);
    }
  };

  const handleResetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setPasswordError(null);
    setConfirmError(null);
    setOtpError(null);

    if (!otp || otp.trim().length < 6) {
      setOtpError('Please enter the 6-digit verification code.');
      return;
    }

    const pwErr = validatePasswordStrength(newPassword);
    if (pwErr) {
      setPasswordError(pwErr);
      return;
    }

    if (newPassword !== confirmPassword) {
      setConfirmError('Passwords do not match.');
      return;
    }

    try {
      setLoading(true);
      const res = await authApi.resetPassword({
        challengeId,
        otp: otp.trim(),
        newPassword,
      });

      if (res.success) {
        setStep('SUCCESS');
        showSuccess('Your password has been successfully reset!');
      }
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Failed to reset password. Please check your verification code.';
      setErrorMessage(msg);
      if (msg.toLowerCase().includes('verification code') || msg.toLowerCase().includes('otp')) {
        setOtpError(msg);
      }
      showError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      {/* Header Branding */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-600 to-amber-500 flex items-center justify-center text-white shadow-lg shadow-amber-500/25">
            <Building2 className="w-6 h-6 text-white" />
          </div>
        </div>
        <h2 className="mt-4 text-center text-2xl font-extrabold text-slate-900 tracking-tight">
          {step === 'SUCCESS' ? 'Password Reset Complete' : 'Reset Staff Password'}
        </h2>
        <p className="mt-1 text-center text-xs font-semibold text-amber-600 uppercase tracking-wider">
          ANS Tax Consultancy — Admin Portal
        </p>
        <p className="mt-2 text-center text-xs text-slate-500 max-w-sm mx-auto">
          {step === 'EMAIL' && 'Enter your official registered email address to receive a secure password reset code.'}
          {step === 'RESET' && `Enter the 6-digit code sent to ${destinationMasked || email} and set a new password.`}
          {step === 'SUCCESS' && 'Your password has been changed. You can now sign in to the administrative portal.'}
        </p>
      </div>

      {/* Card Box */}
      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 shadow-xl shadow-slate-200/60 sm:rounded-2xl sm:px-10 border border-slate-200/80">
          {errorMessage && (
            <div className="mb-5 p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* STEP 1: REQUEST OTP */}
          {step === 'EMAIL' && (
            <form onSubmit={handleEmailSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Official Email Address <span className="text-rose-500">*</span>
                </label>
                <div className="relative rounded-xl shadow-sm">
                  <div className={`absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none ${emailError ? 'text-rose-500' : 'text-slate-400'}`}>
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      setEmailError(null);
                    }}
                    placeholder="admin@anstaxconsultancy.com"
                    className={`block w-full pl-10 pr-3 py-2.5 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none transition-colors border ${
                      emailError
                        ? 'bg-rose-50/40 border-rose-400 focus:ring-2 focus:ring-rose-300'
                        : 'bg-slate-50 border-slate-200 focus:ring-2 focus:ring-amber-500 focus:bg-white'
                    }`}
                  />
                </div>
                {emailError && (
                  <p className="text-[11px] text-rose-600 font-semibold mt-1.5 flex items-center gap-1">
                    <span>•</span> {emailError}
                  </p>
                )}
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading || !email}
                  className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-900 shadow-md shadow-slate-900/10 disabled:opacity-50 transition-all cursor-pointer"
                >
                  {loading ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <span>Send Reset Code</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>

              <div className="text-center pt-3 border-t border-slate-100">
                <Link
                  to="/login"
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-amber-600 transition-colors"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back to Sign In</span>
                </Link>
              </div>
            </form>
          )}

          {/* STEP 2: ENTER OTP & NEW PASSWORD */}
          {step === 'RESET' && (
            <form onSubmit={handleResetSubmit} className="space-y-4 text-xs">
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
                    6-Digit Verification Code <span className="text-rose-500">*</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => setStep('EMAIL')}
                    className="text-[11px] text-amber-600 hover:underline cursor-pointer"
                  >
                    Change Email
                  </button>
                </div>
                <div className="relative rounded-xl shadow-sm">
                  <div className={`absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none ${otpError ? 'text-rose-500' : 'text-slate-400'}`}>
                    <KeyRound className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    value={otp}
                    onChange={(e) => {
                      setOtp(e.target.value.replace(/\D/g, ''));
                      setOtpError(null);
                    }}
                    placeholder="123456"
                    className={`block w-full pl-10 pr-3 py-2.5 rounded-xl text-center text-sm font-mono tracking-widest text-slate-900 placeholder-slate-400 focus:outline-none transition-colors border ${
                      otpError
                        ? 'bg-rose-50/40 border-rose-400 focus:ring-2 focus:ring-rose-300'
                        : 'bg-slate-50 border-slate-200 focus:ring-2 focus:ring-amber-500 focus:bg-white'
                    }`}
                  />
                </div>
                {otpError && (
                  <p className="text-[11px] text-rose-600 font-semibold mt-1.5 flex items-center gap-1">
                    <span>•</span> {otpError}
                  </p>
                )}
              </div>

              {/* Resend Action */}
              <div className="flex items-center justify-between text-xs py-1">
                <span className="text-slate-500">Didn't receive email?</span>
                {countdown > 0 ? (
                  <span className="text-slate-400 font-semibold text-[11px]">
                    Resend in <span className="text-amber-600 font-bold">{countdown}s</span>
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={handleResendCode}
                    disabled={resending}
                    className="text-amber-600 hover:text-amber-700 font-bold flex items-center gap-1 cursor-pointer disabled:opacity-50 text-xs"
                  >
                    <RefreshCw className={`w-3 h-3 ${resending ? 'animate-spin' : ''}`} />
                    <span>Resend Code</span>
                  </button>
                )}
              </div>

              {/* New Password */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  New Password <span className="text-rose-500">*</span>
                </label>
                <div className="relative rounded-xl shadow-sm">
                  <div className={`absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none ${passwordError ? 'text-rose-500' : 'text-slate-400'}`}>
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={newPassword}
                    onChange={(e) => {
                      setNewPassword(e.target.value);
                      setPasswordError(null);
                    }}
                    placeholder="Min. 8 chars with uppercase, number & symbol"
                    className={`block w-full pl-10 pr-10 py-2.5 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none transition-colors border ${
                      passwordError
                        ? 'bg-rose-50/40 border-rose-400 focus:ring-2 focus:ring-rose-300'
                        : 'bg-slate-50 border-slate-200 focus:ring-2 focus:ring-amber-500 focus:bg-white'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 p-1 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {passwordError && (
                  <p className="text-[11px] text-rose-600 font-semibold mt-1.5 flex items-center gap-1">
                    <span>•</span> {passwordError}
                  </p>
                )}
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Confirm New Password <span className="text-rose-500">*</span>
                </label>
                <div className="relative rounded-xl shadow-sm">
                  <div className={`absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none ${confirmError ? 'text-rose-500' : 'text-slate-400'}`}>
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    required
                    value={confirmPassword}
                    onChange={(e) => {
                      setConfirmPassword(e.target.value);
                      setConfirmError(null);
                    }}
                    placeholder="Re-enter your new password"
                    className={`block w-full pl-10 pr-10 py-2.5 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none transition-colors border ${
                      confirmError
                        ? 'bg-rose-50/40 border-rose-400 focus:ring-2 focus:ring-rose-300'
                        : 'bg-slate-50 border-slate-200 focus:ring-2 focus:ring-amber-500 focus:bg-white'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 p-1 cursor-pointer"
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {confirmError && (
                  <p className="text-[11px] text-rose-600 font-semibold mt-1.5 flex items-center gap-1">
                    <span>•</span> {confirmError}
                  </p>
                )}
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading || otp.length < 6 || !newPassword}
                  className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-900 shadow-md shadow-slate-900/10 disabled:opacity-50 transition-all cursor-pointer"
                >
                  {loading ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <span>Confirm &amp; Reset Password</span>
                      <ShieldCheck className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </form>
          )}

          {/* STEP 3: SUCCESS */}
          {step === 'SUCCESS' && (
            <div className="text-center py-4 space-y-5">
              <div className="w-16 h-16 rounded-3xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 mx-auto">
                <CheckCircle2 className="w-8 h-8" />
              </div>

              <div>
                <h3 className="text-base font-extrabold text-slate-900">Password Reset Successful!</h3>
                <p className="text-xs text-slate-500 mt-2">
                  Your administrative password has been updated. You can now log in to the portal with your new credentials.
                </p>
              </div>

              <button
                type="button"
                onClick={() => navigate('/login')}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 shadow-md shadow-slate-900/10 transition-all cursor-pointer"
              >
                <span>Go to Admin Sign In</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
