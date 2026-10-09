import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { backendRequest, SESSION_TOKEN_KEY } from '../services/http';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(null);
  const [hasLoggedOut, setHasLoggedOut] = useState(false);

  useEffect(() => {
    localStorage.removeItem('finxguard_auth_user');
    localStorage.removeItem('finxguard_registered_users');

    const clearSession = () => {
      sessionStorage.removeItem(SESSION_TOKEN_KEY);
      setCurrentUser(null);
    };

    window.addEventListener('finxguard:unauthorized', clearSession);

    // Initial session restoration
    const restoreSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error || !session) {
          sessionStorage.removeItem(SESSION_TOKEN_KEY);
          setCurrentUser(null);
        } else {
          sessionStorage.setItem(SESSION_TOKEN_KEY, session.access_token);
          const profile = await backendRequest('/auth/me');
          setCurrentUser(profile);
        }
      } catch (err) {
        console.warn('Session restoration failed:', err);
        sessionStorage.removeItem(SESSION_TOKEN_KEY);
        setCurrentUser(null);
      } finally {
        setLoading(false);
      }
    };

    restoreSession();

    // Listen to Supabase auth events
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_OUT') {
        sessionStorage.removeItem(SESSION_TOKEN_KEY);
        setCurrentUser(null);
      } else if (session?.access_token) {
        sessionStorage.setItem(SESSION_TOKEN_KEY, session.access_token);
        if (event === 'PASSWORD_RECOVERY') {
          // Handled on /reset-password route
        }
      }
    });

    return () => {
      window.removeEventListener('finxguard:unauthorized', clearSession);
      subscription?.unsubscribe();
    };
  }, []);

  const login = async (email, password, expectedRole = null) => {
    setAuthError(null);
    const normalizedEmail = email.trim().toLowerCase();

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: normalizedEmail,
        password
      });

      if (error) {
        if (error.message.includes('Email not confirmed')) {
          throw new Error('Please verify your email address before signing in.');
        }
        if (error.message.includes('Invalid login credentials')) {
          throw new Error('Invalid email or password.');
        }
        throw new Error(error.message || 'Login failed.');
      }

      if (!data.session?.access_token) {
        throw new Error('No active session returned. Please verify your email.');
      }

      sessionStorage.setItem(SESSION_TOKEN_KEY, data.session.access_token);

      // Synchronize authenticated identity to PostgreSQL profile
      const profile = await backendRequest('/auth/profile/sync', {
        method: 'POST',
        body: JSON.stringify({
          name: data.user?.user_metadata?.full_name || data.user?.user_metadata?.name
        })
      });

      // Role check based on PostgreSQL-backed profile
      if (expectedRole && profile.role !== expectedRole) {
        await supabase.auth.signOut().catch(() => {});
        sessionStorage.removeItem(SESSION_TOKEN_KEY);
        setCurrentUser(null);
        if (expectedRole === 'ADMIN' && profile.role === 'USER') {
          throw new Error('You do not have administrator access.');
        }
        if (expectedRole === 'USER' && profile.role === 'ADMIN') {
          throw new Error('This account belongs to the administrator portal.');
        }
        throw new Error(`This account is not authorized for the ${expectedRole.toLowerCase()} portal.`);
      }

      setCurrentUser(profile);
      setHasLoggedOut(false);
      return profile;
    } catch (error) {
      setAuthError(error.message);
      return false;
    }
  };

  const register = async ({ name, email, password, confirmPassword, role = 'USER', accessKey }) => {
    setAuthError(null);
    const normalizedEmail = email.trim().toLowerCase();
    const trimmedName = name.trim();

    if (password !== confirmPassword) {
      setAuthError('Passwords do not match.');
      return false;
    }

    if (password.length < 8) {
      setAuthError('Password must contain at least 8 characters.');
      return false;
    }

    if (role === 'ADMIN' && (!accessKey || !accessKey.trim())) {
      setAuthError('Please enter the administrator access key.');
      return false;
    }

    try {
      const { data, error } = await supabase.auth.signUp({
        email: normalizedEmail,
        password,
        options: {
          data: {
            full_name: trimmedName,
            role
          }
        }
      });

      if (error) {
        if (error.message.includes('already registered')) {
          throw new Error('An account with this email already exists.');
        }
        throw new Error(error.message || 'Registration failed.');
      }

      // If an immediate session is issued (email auto-confirmation enabled)
      if (data.session) {
        sessionStorage.setItem(SESSION_TOKEN_KEY, data.session.access_token);

        const profile = await backendRequest('/auth/profile/sync', {
          method: 'POST',
          body: JSON.stringify({
            name: trimmedName,
            role,
            accessKey: role === 'ADMIN' ? accessKey.trim() : undefined
          })
        });

        setCurrentUser(profile);
        setHasLoggedOut(false);
        return { user: profile, session: data.session, needsEmailVerification: false };
      }

      // Supabase requires email verification
      return { user: data.user, session: null, needsEmailVerification: true };
    } catch (error) {
      setAuthError(error.message);
      return false;
    }
  };

  const logout = async () => {
    try {
      await supabase.auth.signOut().catch(() => {});
      if (sessionStorage.getItem(SESSION_TOKEN_KEY)) {
        await backendRequest('/auth/logout', { method: 'POST' }).catch(() => {});
      }
    } finally {
      sessionStorage.removeItem(SESSION_TOKEN_KEY);
      setCurrentUser(null);
      setHasLoggedOut(true);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        isAuthenticated: !!currentUser,
        loading,
        hasLoggedOut,
        role: currentUser?.role || null,
        login,
        register,
        logout,
        authError,
        setAuthError
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
