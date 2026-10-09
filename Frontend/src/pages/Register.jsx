import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Shield, Mail, Lock, User, Key, Eye, EyeOff, CheckCircle2, AlertCircle, ArrowRight } from 'lucide-react';

export default function Register({ role = 'USER' }) {
  const navigate = useNavigate();
  const isAdmin = role === 'ADMIN';
  const { register, authError, setAuthError } = useAuth();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [accessKey, setAccessKey] = useState('');

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [verificationPending, setVerificationPending] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const handleRegister = async (e) => {
    e.preventDefault();
    setAuthError(null);
    setSuccessMessage('');

    const trimmedName = name.trim();
    const trimmedEmail = email.trim().toLowerCase();

    if (!trimmedName) {
      setAuthError('Please enter your full name.');
      return;
    }

    if (!trimmedEmail) {
      setAuthError('Please enter your email address.');
      return;
    }

    if (password.length < 8) {
      setAuthError('Password must contain at least 8 characters.');
      return;
    }

    if (password !== confirmPassword) {
      setAuthError('Passwords do not match.');
      return;
    }

    if (isAdmin && !accessKey.trim()) {
      setAuthError('Please enter the administrator access key.');
      return;
    }

    setLoading(true);

    const result = await register({
      name: trimmedName,
      email: trimmedEmail,
      password,
      confirmPassword,
      role: isAdmin ? 'ADMIN' : 'USER',
      accessKey: isAdmin ? accessKey.trim() : undefined
    });

    setLoading(false);

    if (result) {
      if (result.needsEmailVerification) {
        setVerificationPending(true);
      } else {
        setSuccessMessage(isAdmin ? 'Administrator account created successfully!' : 'Account created successfully!');
        setTimeout(() => {
          navigate(isAdmin ? '/admin' : '/user');
        }, 1200);
      }
    }
  };

  const inputClass =
    'w-full rounded-xl border border-[#29445D] bg-[#0D1D2D] px-4 py-2.5 text-sm text-[#F4F7FB] outline-none transition placeholder:text-[#60758B] focus:border-[#19C99A] focus:ring-1 focus:ring-[#19C99A]';

  const labelClass = 'mb-1.5 block text-sm font-semibold text-[#F4F7FB]';

  return (
    <div className="min-h-screen bg-[#06101C] px-4 py-8 flex items-center justify-center">
      <div className="w-full max-w-xl">
        <div className="rounded-2xl border border-[#29445D] bg-[#102438] px-6 py-6 shadow-2xl sm:px-8 sm:py-7">
          
          {/* HEADER */}
          <div className="mb-6 text-center">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl border border-[#176E69] bg-[#0D3540] text-[#19C99A]">
              <Shield className="h-6 w-6" />
            </div>

            <h1 className="text-3xl font-bold tracking-tight text-[#F4F7FB]">
              {isAdmin ? 'Administrator Setup' : 'Create FinXGuard Account'}
            </h1>

            <p className="mt-1 text-sm text-[#9FB0C3]">
              {isAdmin
                ? 'Create the initial administrator account with your setup access key.'
                : 'Sign up with Supabase authentication to monitor transactions in real time.'}
            </p>
          </div>

          {/* VERIFICATION PENDING SUCCESS VIEW */}
          {verificationPending ? (
            <div className="text-center py-4">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full border border-[#19C99A]/30 bg-[#19C99A]/10 text-[#19C99A]">
                <CheckCircle2 className="h-9 w-9" />
              </div>
              <h2 className="text-2xl font-bold text-[#F4F7FB]">Verify Your Email</h2>
              <p className="mt-3 text-sm leading-6 text-[#9FB0C3]">
                We have sent a verification email to <strong className="text-[#19C99A]">{email}</strong>.
                Please check your inbox and click the verification link to activate your account.
              </p>
              <div className="mt-6">
                <Link
                  to={isAdmin ? '/admin/login' : '/user/login'}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#19C99A] px-6 py-3 text-sm font-bold text-[#06151F] transition hover:bg-[#38DDB0]"
                >
                  Proceed to Login
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          ) : (
            <>
              {/* ERROR ALERT */}
              {authError && (
                <div className="mb-4 flex items-start gap-3 rounded-xl border border-[#713340] bg-[#321823] px-3.5 py-3 text-sm text-[#FF7A89]">
                  <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                  <span className="font-medium">{authError}</span>
                </div>
              )}

              {/* SUCCESS ALERT */}
              {successMessage && (
                <div className="mb-4 flex items-start gap-3 rounded-xl border border-[#176E69] bg-[#0C302E] px-3.5 py-3 text-sm text-[#52E0B5]">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
                  <span className="font-medium">{successMessage}</span>
                </div>
              )}

              {/* REGISTRATION FORM */}
              <form onSubmit={handleRegister} className="space-y-4">
                {/* FULL NAME */}
                <div>
                  <label htmlFor="reg-name" className={labelClass}>Full Name</label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#91A7BC]" />
                    <input
                      id="reg-name"
                      type="text"
                      required
                      value={name}
                      onChange={(e) => {
                        setName(e.target.value);
                        setAuthError(null);
                      }}
                      placeholder="Jane Doe"
                      className={`${inputClass} pl-10`}
                      autoComplete="name"
                    />
                  </div>
                </div>

                {/* EMAIL */}
                <div>
                  <label htmlFor="reg-email" className={labelClass}>Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#91A7BC]" />
                    <input
                      id="reg-email"
                      type="email"
                      required
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        setAuthError(null);
                      }}
                      placeholder="name@company.com"
                      className={`${inputClass} pl-10`}
                      autoComplete="email"
                    />
                  </div>
                </div>

                {/* PASSWORD */}
                <div>
                  <label htmlFor="reg-password" className={labelClass}>Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#91A7BC]" />
                    <input
                      id="reg-password"
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value);
                        setAuthError(null);
                      }}
                      placeholder="At least 8 characters"
                      className={`${inputClass} pl-10 pr-11`}
                      autoComplete="new-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#91A7BC] hover:text-[#19C99A]"
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                {/* CONFIRM PASSWORD */}
                <div>
                  <label htmlFor="reg-confirm-password" className={labelClass}>Confirm Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#91A7BC]" />
                    <input
                      id="reg-confirm-password"
                      type={showConfirmPassword ? 'text' : 'password'}
                      required
                      value={confirmPassword}
                      onChange={(e) => {
                        setConfirmPassword(e.target.value);
                        setAuthError(null);
                      }}
                      placeholder="Re-enter your password"
                      className={`${inputClass} pl-10 pr-11`}
                      autoComplete="new-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#91A7BC] hover:text-[#19C99A]"
                      aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                    >
                      {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                {/* ADMIN ACCESS KEY */}
                {isAdmin && (
                  <div>
                    <label htmlFor="reg-access-key" className={labelClass}>Administrator Access Key</label>
                    <div className="relative">
                      <Key className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#91A7BC]" />
                      <input
                        id="reg-access-key"
                        type="password"
                        required
                        value={accessKey}
                        onChange={(e) => {
                          setAccessKey(e.target.value);
                          setAuthError(null);
                        }}
                        placeholder="Enter administrator setup key"
                        className={`${inputClass} pl-10`}
                        autoComplete="off"
                      />
                    </div>
                  </div>
                )}

                {/* SUBMIT BUTTON */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full mt-2 flex items-center justify-center gap-2 rounded-xl bg-[#19C99A] py-3 text-sm font-bold text-[#06151F] transition hover:bg-[#38DDB0] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {loading
                    ? 'Creating Account...'
                    : isAdmin
                      ? 'Create Administrator Account'
                      : 'Create FinXGuard Account'}
                  <ArrowRight className="h-4 w-4" />
                </button>
              </form>

              {/* LOGIN LINK */}
              <div className="mt-4 text-center text-sm text-[#9FB0C3]">
                Already have an account?{' '}
                <Link
                  to={isAdmin ? '/admin/login' : '/user/login'}
                  className="font-semibold text-[#19C99A] transition hover:text-[#52E0B5]"
                >
                  Sign in here
                </Link>
              </div>
            </>
          )}

        </div>
      </div>
    </div>
  );
}