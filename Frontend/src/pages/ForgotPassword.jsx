
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import {
  Shield,
  Mail,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleSendResetLink = async (e) => {
    e.preventDefault();
    setError('');

    const trimmedEmail = email.trim().toLowerCase();

    if (!trimmedEmail) {
      setError('Please enter your email address.');
      return;
    }

    setLoading(true);

    try {
      const redirectUrl =
        `${window.location.origin}/reset-password`;

      const { error: resetError } =
        await supabase.auth.resetPasswordForEmail(
          trimmedEmail,
          {
            redirectTo: redirectUrl
          }
        );

      if (resetError) {
        throw new Error(
          resetError.message ||
          'Unable to send password recovery email.'
        );
      }

      // Hide the Forgot Password heading after a successful request.
      setSubmitted(true);
    } catch (err) {
      console.error('Password recovery error:', err);

      setError(
        err?.message ||
        'Unable to process your request. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#07111F] px-4 py-8 text-[#F4F7FB]">
      <div className="mx-auto w-full max-w-xl">
        <div className="rounded-2xl border border-[#29445D] bg-[#102438] px-6 py-7 shadow-[0_18px_50px_rgba(0,0,0,0.4)] sm:px-9 sm:py-8">

          {/* Hide the complete header after the request succeeds */}
          {!submitted && (
            <div className="text-center">
              <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl border border-[#19C99A]/30 bg-[#19C99A]/10 text-[#19C99A]">
                <Shield className="h-6 w-6" />
              </div>

              <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
                Forgot Password
              </h1>

              <p className="mt-2 text-sm leading-6 text-[#9FB0C3] sm:text-base">
                Reset your FinXGuard account password securely via Supabase Auth.
              </p>
            </div>
          )}

          {/* Success state: header is hidden */}
          {submitted ? (
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full border border-[#19C99A]/30 bg-[#19C99A]/10 text-[#19C99A]">
                <CheckCircle2 className="h-9 w-9" />
              </div>

              <h2 className="text-2xl font-bold">
                Request Submitted
              </h2>

              <p className="mt-3 text-sm leading-6 text-[#9FB0C3]">
                link sent to {' '}
                <strong className="text-[#19C99A]">
                  {email}
                </strong>
                , check your inbox and spam folder for password recovery instructions.
              </p>

              <p className="mt-3 text-xs leading-5 text-[#9FB0C3]">
                Use the secure recovery link in the email to set a new password.
              </p>

              <div className="mt-6 flex flex-col gap-3">
                <Link
                  to="/user/login"
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#19C99A] px-6 py-3 text-sm font-semibold text-[#07111F] transition hover:bg-[#19C99A]/90"
                >
                  Return to Login
                  <ArrowRight className="h-4 w-4" />
                </Link>

                <button
                  type="button"
                  onClick={() => {
                    setSubmitted(false);
                    setEmail('');
                    setError('');
                  }}
                  className="text-xs text-[#9FB0C3] hover:text-[#F4F7FB]"
                >
                  Try a different email address
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* Error message */}
              {error && (
                <div
                  role="alert"
                  className="mt-6 flex items-start gap-3 rounded-xl border border-[#FF5C70]/40 bg-[#FF5C70]/10 p-3.5 text-sm text-[#FF5C70]"
                >
                  <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                  <span className="font-medium">{error}</span>
                </div>
              )}

              {/* Password recovery form */}
              <form
                onSubmit={handleSendResetLink}
                className="mt-7 space-y-6"
              >
                <div>
                  <label
                    htmlFor="forgot-email"
                    className="mb-2 block text-sm font-semibold"
                  >
                    Email Address
                  </label>

                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9FB0C3]" />

                    <input
                      id="forgot-email"
                      type="email"
                      required
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        setError('');
                      }}
                      placeholder="name@company.com"
                      autoComplete="email"
                      className="w-full rounded-xl border border-[#29445D] bg-[#0D2033] py-3 pl-10 pr-4 text-sm text-[#F4F7FB] placeholder-[#9FB0C3]/60 focus:border-[#19C99A] focus:outline-none focus:ring-2 focus:ring-[#19C99A]/30"
                    />
                  </div>

                  <p className="mt-2 text-xs text-[#9FB0C3]">
                    A secure password recovery link will be requested for this address.
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#19C99A] px-5 py-3 text-base font-semibold text-[#07111F] transition hover:bg-[#19C99A]/90 disabled:cursor-not-allowed disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-[#19C99A]"
                >
                  {loading
                    ? 'Sending Recovery Email...'
                    : 'Send Recovery Link'}

                  <ArrowRight className="h-4 w-4" />
                </button>

                <div className="text-center">
                  <Link
                    to="/user/login"
                    className="inline-flex items-center gap-2 text-sm text-[#9FB0C3] transition hover:text-[#F4F7FB]"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    Back to Login
                  </Link>
                </div>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
