
import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Shield,
  Lock,
  Mail,
  AlertCircle,
  ArrowRight,
  Eye,
  EyeOff
} from 'lucide-react';

export default function Login({ role: initialRole = 'USER' }) {
  // The route decides which login page is rendered:
  // /user/login or /admin/login
  const activeRole = initialRole === 'ADMIN' ? 'ADMIN' : 'USER';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const { login, authError, setAuthError } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    setAuthError(null);
  }, [activeRole, setAuthError]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setAuthError(null);

    try {
      const user = await login(email, password, activeRole);

      if (user) {
        navigate(user.role === 'ADMIN' ? '/admin' : '/user');
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#07111F] px-4 py-8 text-[#F4F7FB]">
      <div className="mx-auto w-full max-w-xl rounded-2xl border border-[#29445D] bg-[#102438] px-6 py-7 shadow-[0_18px_50px_rgba(0,0,0,0.4)] sm:px-9 sm:py-8">

        {/* Header */}
        <div className="text-center">
          <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl border border-[#19C99A]/30 bg-[#19C99A]/10 text-[#19C99A]">
            <Shield className="h-6 w-6" />
          </div>

          <h1 className="text-3xl font-bold tracking-tight text-[#F4F7FB] sm:text-4xl">
            {activeRole === 'ADMIN'
              ? 'Administrator Login'
              : 'User Login'}
          </h1>

          <p className="mt-2 text-sm leading-6 text-[#9FB0C3] sm:text-base">
            {activeRole === 'ADMIN'
              ? 'Secure console access for fraud detection and system telemetry.'
              : 'Sign in to access your real-time credit card fraud protection portal.'}
          </p>
        </div>

        {/* Authentication error */}
        {authError && (
          <div className="mt-5 flex items-start gap-3 rounded-xl border border-[#FF5C70]/40 bg-[#FF5C70]/10 p-3.5 text-left text-sm text-[#FF5C70]">
            <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-[#FF5C70] text-[#FF5C70]">
              <AlertCircle className="h-3.5 w-3.5" />
            </div>

            <span className="font-medium">{authError}</span>
          </div>
        )}

        {/* Login form */}
        <form onSubmit={handleSubmit} className="mt-6 space-y-5">

          {/* Email */}
          <div>
            <label
              htmlFor="login-email"
              className="mb-2 block text-sm font-semibold text-[#F4F7FB]"
            >
              {activeRole === 'ADMIN'
                ? 'Admin Email Address'
                : 'Email Address'}
            </label>

            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9FB0C3]" />

              <input
                id="login-email"
                type="email"
                required
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setAuthError(null);
                }}
                placeholder={
                  activeRole === 'ADMIN'
                    ? 'admin@finxguard.com'
                    : 'name@company.com'
                }
                className="w-full rounded-xl border border-[#29445D] bg-[#0D2033] py-3 pl-10 pr-4 text-sm text-[#F4F7FB] placeholder-[#9FB0C3]/60 transition focus:border-[#19C99A] focus:outline-none focus:ring-2 focus:ring-[#19C99A]/30"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <div className="mb-2 flex items-center justify-between">
              <label
                htmlFor="login-password"
                className="text-sm font-semibold text-[#F4F7FB]"
              >
                Password
              </label>

              <Link
                to="/forgot-password"
                className="text-xs text-[#19C99A] hover:underline"
              >
                Forgot password?
              </Link>
            </div>

            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9FB0C3]" />

              <input
                id="login-password"
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setAuthError(null);
                }}
                placeholder="••••••••"
                className="w-full rounded-xl border border-[#29445D] bg-[#0D2033] py-3 pl-10 pr-11 text-sm text-[#F4F7FB] placeholder-[#9FB0C3]/60 transition focus:border-[#19C99A] focus:outline-none focus:ring-2 focus:ring-[#19C99A]/30"
              />

              <button
                type="button"
                onClick={() => setShowPassword((visible) => !visible)}
                aria-label={
                  showPassword ? 'Hide password' : 'Show password'
                }
                title={
                  showPassword ? 'Hide password' : 'Show password'
                }
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#9FB0C3] transition hover:text-[#19C99A] focus:outline-none focus:ring-2 focus:ring-[#19C99A]/50"
              >
                {showPassword
                  ? <EyeOff className="h-4 w-4" />
                  : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={submitting}
            className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-[#19C99A] px-5 py-3 text-base font-semibold text-[#07111F] transition hover:bg-[#19C99A]/90 disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-[#19C99A] focus:ring-offset-2 focus:ring-offset-[#102438]"
          >
            <span>
              {submitting
                ? 'Authenticating...'
                : `Sign In to ${
                    activeRole === 'ADMIN'
                      ? 'Admin Portal'
                      : 'User Portal'
                  }`}
            </span>

            <ArrowRight className="h-4 w-4" />
          </button>
        </form>

        {/* Registration link */}
        <div className="mt-6 text-center text-sm text-[#9FB0C3]">
          Don't have an account?{' '}

          <Link
            to={
              activeRole === 'ADMIN'
                ? '/admin/register'
                : '/user/register'
            }
            className="font-semibold text-[#19C99A] hover:underline"
          >
            Register here
          </Link>
        </div>
      </div>
    </div>
  );
}

