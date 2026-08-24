import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Building2, Lock, Mail, ArrowRight, ShieldCheck, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export const Login: React.FC = () => {
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);

  // Field errors
  const [emailError, setEmailError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [touched, setTouched] = useState<{ email?: boolean; password?: boolean }>({});
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const { login } = useAuth();
  const { showSuccess } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const from = (location.state as any)?.from?.pathname || '/';

  const checkEmail = (val: string) => {
    const trimmed = (val || '').trim();
    if (!trimmed) return 'Official email address is required.';
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmed)) return 'Please enter a valid email address (e.g. admin@anstaxconsultancy.com).';
    return null;
  };

  const checkPassword = (val: string) => {
    if (!val) return 'Password is required.';
    if (val.length < 8) return 'Password must be at least 8 characters.';
    return null;
  };

  const handleEmailChange = (val: string) => {
    setEmail(val);
    if (touched.email) {
      setEmailError(checkEmail(val));
    }
  };

  const handlePasswordChange = (val: string) => {
    setPassword(val);
    if (touched.password) {
      setPasswordError(checkPassword(val));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const emErr = checkEmail(email);
    const pwErr = checkPassword(password);

    setTouched({ email: true, password: true });
    setEmailError(emErr);
    setPasswordError(pwErr);

    if (emErr || pwErr) {
      setErrorMessage('Please correct the highlighted fields before signing in.');
      return;
    }

    try {
      setIsSubmitting(true);
      await login({ email: email.trim(), password });
      showSuccess('Welcome back! Administrative session verified.');
      navigate(from, { replace: true });
    } catch (err: any) {
      const status = err.response?.status;
      if (status === 401) {
        setErrorMessage('Invalid administrative email or password. Please verify credentials.');
      } else if (status === 429) {
        setErrorMessage('Too many login attempts. Account temporarily locked for 15 minutes.');
      } else {
        setErrorMessage(
          err.response?.data?.message || err.message || 'Unable to connect to login service. Please try again.'
        );
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-600 to-amber-500 flex items-center justify-center text-white shadow-lg shadow-amber-500/25">
            <Building2 className="w-6 h-6 text-white" />
          </div>
        </div>
        <h2 className="mt-4 text-center text-2xl font-extrabold text-slate-900 tracking-tight">
          ANS Tax Consultancy
        </h2>
        <p className="mt-1 text-center text-xs font-semibold text-amber-600 uppercase tracking-wider">
          Admin & Consultant Portal
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 shadow-xl shadow-slate-200/60 sm:rounded-2xl sm:px-10 border border-slate-200/80">
          {errorMessage && (
            <div className="mb-5 p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form className="space-y-4" onSubmit={handleSubmit} noValidate>
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Official Email <span className="text-rose-500">*</span>
              </label>
              <div className="relative rounded-xl shadow-sm">
                <div className={`absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none ${emailError ? 'text-rose-500' : 'text-slate-400'}`}>
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => handleEmailChange(e.target.value)}
                  onBlur={() => {
                    setTouched((p) => ({ ...p, email: true }));
                    setEmailError(checkEmail(email));
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

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Password <span className="text-rose-500">*</span>
              </label>
              <div className="relative rounded-xl shadow-sm">
                <div className={`absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none ${passwordError ? 'text-rose-500' : 'text-slate-400'}`}>
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => handlePasswordChange(e.target.value)}
                  onBlur={() => {
                    setTouched((p) => ({ ...p, password: true }));
                    setPasswordError(checkPassword(password));
                  }}
                  placeholder="••••••••••••"
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
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
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

            <div className="pt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-900 shadow-md shadow-slate-900/10 disabled:opacity-50 transition-all cursor-pointer"
              >
                {isSubmitting ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <span>Sign in to Portal</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </form>

          <div className="mt-6 pt-5 border-t border-slate-100 flex items-center justify-center gap-2 text-slate-400 text-xs">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>256-Bit Encrypted &bull; ISO 27001 Standard</span>
          </div>
        </div>
      </div>
    </div>
  );
};
