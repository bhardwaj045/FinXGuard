import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import { Shield, Lock, Eye, EyeOff, CheckCircle2, AlertCircle, ArrowRight } from 'lucide-react';

export default function ResetPassword() {
  const navigate = useNavigate();
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);
  const [hasRecoverySession, setHasRecoverySession] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    let mounted = true;

    const checkSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session && mounted) {
          setHasRecoverySession(true);
        }
      } catch (err) {
        console.warn('Error checking recovery session:', err);
      } finally {
        if (mounted) setCheckingSession(false);
      }
    };

    checkSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'PASSWORD_RECOVERY' || (session && event === 'SIGNED_IN')) {
        if (mounted) {
          setHasRecoverySession(true);
          setCheckingSession(false);
        }
      }
    });

    return () => {
      mounted = false;
      subscription?.unsubscribe();
    };
  }, []);

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError('');

    if (newPassword.length < 8) {
      setError('Password must contain at least 8 characters.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);

    try {
      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (updateError) {
        throw new Error(updateError.message || 'Unable to update password.');
      }

      setSuccess(true);
    } catch (err) {
      console.error('Password update error:', err);
      setError(err?.message || 'Unable to update password. Your recovery link may have expired.');
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    'w-full rounded-xl border border-[#29445D] bg-[#0D2033] py-3 pl-10 pr-12 text-sm text-[#F4F7FB] placeholder-[#9FB0C3]/60 focus:border-[#19C99A] focus:outline-none focus:ring-2 focus:ring-[#19C99A]/30';

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#07111F] px-4 py-8 text-[#F4F7FB]">
      <div className="mx-auto w-full max-w-xl">
        <div className="rounded-2xl border border-[#29445D] bg-[#102438] px-6 py-7 shadow-[0_18px_50px_rgba(0,0,0,0.4)] sm:px-9 sm:py-8">
          
          {/* HEADER */}
          <div className="text-center">
            <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl border border-[#19C99A]/30 bg-[#19C99A]/10 text-[#19C99A]">
              <Shield className="h-6 w-6" />
            </div>

            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Set New Password
            </h1>

            <p className="mt-2 text-sm leading-6 text-[#9FB0C3] sm:text-base">
              Enter your new FinXGuard account password below.
            </p>
          </div>

          {/* CHECKING STATE */}
          {checkingSession ? (
            <div className="mt-8 text-center text-sm text-[#9FB0C3]">
              Verifying recovery session...
            </div>
          ) : !hasRecoverySession && !success ? (
            <div className="mt-6 text-center">
              <div className="mb-4 flex items-start gap-3 rounded-xl border border-[#FF5C70]/40 bg-[#FF5C70]/10 p-3.5 text-sm text-[#FF5C70]">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                <span className="font-medium">
                  Invalid, expired, or missing password recovery session.
                </span>
              </div>
              <p className="text-sm text-[#9FB0C3] mb-6">
                Please request a new password recovery link to continue.
              </p>
              <Link
                to="/forgot-password"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#19C99A] px-6 py-3 text-sm font-semibold text-[#07111F] transition hover:bg-[#19C99A]/90"
              >
                Request New Reset Link
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          ) : success ? (
            /* SUCCESS STATE */
            <div className="mt-7 text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full border border-[#19C99A]/30 bg-[#19C99A]/10 text-[#19C99A]">
                <CheckCircle2 className="h-9 w-9" />
              </div>

              <h2 className="text-2xl font-bold">Password Reset Successfully</h2>

              <p className="mt-3 text-sm leading-6 text-[#9FB0C3]">
                Your password has been updated in Supabase Auth. You can now sign in with your new password.
              </p>

              <button
                type="button"
                onClick={() => navigate('/user/login')}
                className="mt-6 inline-flex items-center justify-center gap-2 rounded-xl bg-[#19C99A] px-6 py-3 text-sm font-semibold text-[#07111F] transition hover:bg-[#19C99A]/90"
              >
                Go to Login
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          ) : (
            /* RESET FORM */
            <>
              {error && (
                <div className="mt-6 flex items-start gap-3 rounded-xl border border-[#FF5C70]/40 bg-[#FF5C70]/10 p-3.5 text-sm text-[#FF5C70]">
                  <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                  <span className="font-medium">{error}</span>
                </div>
              )}

              <form onSubmit={handleResetPassword} className="mt-7 space-y-5">
                <div>
                  <label htmlFor="new-pass" className="mb-2 block text-sm font-semibold">
                    New Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#9FB0C3]" />
                    <input
                      id="new-pass"
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={newPassword}
                      onChange={(e) => {
                        setNewPassword(e.target.value);
                        setError('');
                      }}
                      placeholder="At least 8 characters"
                      autoComplete="new-password"
                      className={inputClass}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#9FB0C3] hover:text-[#19C99A]"
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label htmlFor="confirm-pass" className="mb-2 block text-sm font-semibold">
                    Confirm New Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#9FB0C3]" />
                    <input
                      id="confirm-pass"
                      type={showConfirmPassword ? 'text' : 'password'}
                      required
                      value={confirmPassword}
                      onChange={(e) => {
                        setConfirmPassword(e.target.value);
                        setError('');
                      }}
                      placeholder="Re-enter your new password"
                      autoComplete="new-password"
                      className={inputClass}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#9FB0C3] hover:text-[#19C99A]"
                      aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                    >
                      {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#19C99A] px-5 py-3 text-base font-semibold text-[#07111F] transition hover:bg-[#19C99A]/90 disabled:opacity-50"
                >
                  {loading ? 'Updating Password...' : 'Update Password'}
                  <ArrowRight className="h-4 w-4" />
                </button>
              </form>
            </>
          )}

        </div>
      </div>
    </div>
  );
}
