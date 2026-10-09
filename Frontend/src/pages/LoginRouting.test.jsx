import { render, screen, fireEvent, waitFor, cleanup } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import React from 'react';
import App from '../App';
import { supabase } from '../lib/supabaseClient';

vi.mock('../lib/supabaseClient', () => ({
  supabase: {
    auth: {
      getSession: vi.fn().mockResolvedValue({ data: { session: null }, error: null }),
      onAuthStateChange: vi.fn().mockReturnValue({ data: { subscription: { unsubscribe: vi.fn() } } }),
      signInWithPassword: vi.fn(),
      signOut: vi.fn().mockResolvedValue({ error: null }),
      signUp: vi.fn(),
      resetPasswordForEmail: vi.fn(),
      updateUser: vi.fn(),
    }
  }
}));

describe('Portal Navigation and Routing Tests', () => {
  beforeEach(() => {
    sessionStorage.clear();
    localStorage.clear();
    vi.restoreAllMocks();
    supabase.auth.getSession.mockResolvedValue({ data: { session: null }, error: null });
    supabase.auth.onAuthStateChange.mockReturnValue({ data: { subscription: { unsubscribe: vi.fn() } } });
    supabase.auth.signOut.mockResolvedValue({ error: null });
  });

  afterEach(() => {
    cleanup();
  });

  // TEST 1: Open /user/login -> Expected: USER LOGIN PAGE, NOT Administrator Login
  it('TEST 1: /user/login renders User Login page and not Administrator Login', () => {
    window.history.pushState({}, '', '/user/login');
    render(<App />);

    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('User Login');
    expect(screen.queryByText('Administrator Login')).toBeNull();
    expect(screen.getByText('Sign in to access your real-time credit card fraud protection portal.')).toBeInTheDocument();
  });

  // TEST 2: Open /admin/login -> Expected: ADMINISTRATOR LOGIN PAGE
  it('TEST 2: /admin/login renders Administrator Login page', () => {
    window.history.pushState({}, '', '/admin/login');
    render(<App />);

    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Administrator Login');
    expect(screen.getByText('Secure console access for fraud detection and system telemetry.')).toBeInTheDocument();
  });

  // TEST 3: In portal selector, click User Login -> Expected: /user/login and User Login page
  it('TEST 3: clicking User Login in portal selector updates URL to /user/login and renders User Login', () => {
    window.history.pushState({}, '', '/admin/login');
    render(<App />);

    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Administrator Login');

    const userLoginBtn = screen.getByRole('button', { name: /User Login/i });
    fireEvent.click(userLoginBtn);

    expect(window.location.pathname).toBe('/user/login');
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('User Login');
  });

  // TEST 4: In portal selector, click Admin Login -> Expected: /admin/login and Administrator Login page
  it('TEST 4: clicking Admin Login in portal selector updates URL to /admin/login and renders Administrator Login', () => {
    window.history.pushState({}, '', '/user/login');
    render(<App />);

    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('User Login');

    const adminLoginBtn = screen.getByRole('button', { name: /Admin Login/i });
    fireEvent.click(adminLoginBtn);

    expect(window.location.pathname).toBe('/admin/login');
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Administrator Login');
  });

  // TEST 5: Refresh /user/login -> Expected: User Login
  it('TEST 5: /user/login on reload/refresh renders User Login', () => {
    window.history.pushState({}, '', '/user/login');
    render(<App />);
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('User Login');
  });

  // TEST 6: Refresh /admin/login -> Expected: Administrator Login
  it('TEST 6: /admin/login on reload/refresh renders Administrator Login', () => {
    window.history.pushState({}, '', '/admin/login');
    render(<App />);
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Administrator Login');
  });

  // TEST 7: Login USER at /user/login -> Expected: /user
  it('TEST 7: login USER at /user/login navigates to /user', async () => {
    supabase.auth.signInWithPassword.mockResolvedValueOnce({
      data: {
        session: { access_token: 'token-user' },
        user: { id: 'sb-1', email: 'user@test.com', user_metadata: { full_name: 'Normal User' } }
      },
      error: null
    });

    vi.stubGlobal('fetch', vi.fn().mockImplementation((url) => {
      if (url.includes('/auth/profile/sync') || url.includes('/auth/me')) {
        return Promise.resolve(new Response(JSON.stringify({
          id: '1', name: 'Normal User', email: 'user@test.com', role: 'USER'
        }), { status: 200, headers: { 'Content-Type': 'application/json' } }));
      }
      return Promise.resolve(new Response('{}', { status: 200, headers: { 'Content-Type': 'application/json' } }));
    }));

    window.history.pushState({}, '', '/user/login');
    const { container } = render(<App />);

    fireEvent.change(screen.getByLabelText(/Email Address/i), { target: { value: 'user@test.com' } });
    fireEvent.change(screen.getByLabelText(/^Password$/i), { target: { value: 'password123' } });
    
    const submitBtn = container.querySelector('button[type="submit"]');
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(window.location.pathname).toBe('/user');
    });
  });

  // TEST 8: Login USER at /admin/login -> Expected: access denied
  it('TEST 8: login USER at /admin/login displays access denied', async () => {
    supabase.auth.signInWithPassword.mockResolvedValueOnce({
      data: {
        session: { access_token: 'token-user' },
        user: { id: 'sb-1', email: 'user@test.com', user_metadata: { full_name: 'Normal User' } }
      },
      error: null
    });

    vi.stubGlobal('fetch', vi.fn().mockImplementation((url) => {
      if (url.includes('/auth/profile/sync')) {
        return Promise.resolve(new Response(JSON.stringify({
          id: '1', name: 'Normal User', email: 'user@test.com', role: 'USER'
        }), { status: 200, headers: { 'Content-Type': 'application/json' } }));
      }
      return Promise.resolve(new Response('{}', { status: 200, headers: { 'Content-Type': 'application/json' } }));
    }));

    window.history.pushState({}, '', '/admin/login');
    const { container } = render(<App />);

    fireEvent.change(screen.getByLabelText(/Admin Email Address/i), { target: { value: 'user@test.com' } });
    fireEvent.change(screen.getByLabelText(/^Password$/i), { target: { value: 'password123' } });
    
    const submitBtn = container.querySelector('button[type="submit"]');
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(screen.getByText('You do not have administrator access.')).toBeInTheDocument();
      expect(window.location.pathname).toBe('/admin/login');
    });
  });

  // TEST 9: Login ADMIN at /admin/login -> Expected: /admin
  it('TEST 9: login ADMIN at /admin/login navigates to /admin', async () => {
    supabase.auth.signInWithPassword.mockResolvedValueOnce({
      data: {
        session: { access_token: 'token-admin' },
        user: { id: 'sb-2', email: 'admin@test.com', user_metadata: { full_name: 'Admin User' } }
      },
      error: null
    });

    vi.stubGlobal('fetch', vi.fn().mockImplementation((url) => {
      if (url.includes('/auth/profile/sync') || url.includes('/auth/me')) {
        return Promise.resolve(new Response(JSON.stringify({
          id: '2', name: 'Admin User', email: 'admin@test.com', role: 'ADMIN'
        }), { status: 200, headers: { 'Content-Type': 'application/json' } }));
      }
      return Promise.resolve(new Response('{}', { status: 200, headers: { 'Content-Type': 'application/json' } }));
    }));

    window.history.pushState({}, '', '/admin/login');
    const { container } = render(<App />);

    fireEvent.change(screen.getByLabelText(/Admin Email Address/i), { target: { value: 'admin@test.com' } });
    fireEvent.change(screen.getByLabelText(/^Password$/i), { target: { value: 'password123' } });
    
    const submitBtn = container.querySelector('button[type="submit"]');
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(window.location.pathname).toBe('/admin');
    });
  });

  // TEST 10: Login ADMIN at /user/login -> Expected: access denied / administrator portal warning
  it('TEST 10: login ADMIN at /user/login displays administrator portal warning', async () => {
    supabase.auth.signInWithPassword.mockResolvedValueOnce({
      data: {
        session: { access_token: 'token-admin' },
        user: { id: 'sb-2', email: 'admin@test.com', user_metadata: { full_name: 'Admin User' } }
      },
      error: null
    });

    vi.stubGlobal('fetch', vi.fn().mockImplementation((url) => {
      if (url.includes('/auth/profile/sync')) {
        return Promise.resolve(new Response(JSON.stringify({
          id: '2', name: 'Admin User', email: 'admin@test.com', role: 'ADMIN'
        }), { status: 200, headers: { 'Content-Type': 'application/json' } }));
      }
      return Promise.resolve(new Response('{}', { status: 200, headers: { 'Content-Type': 'application/json' } }));
    }));

    window.history.pushState({}, '', '/user/login');
    const { container } = render(<App />);

    fireEvent.change(screen.getByLabelText(/Email Address/i), { target: { value: 'admin@test.com' } });
    fireEvent.change(screen.getByLabelText(/^Password$/i), { target: { value: 'password123' } });
    
    const submitBtn = container.querySelector('button[type="submit"]');
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(screen.getByText('This account belongs to the administrator portal.')).toBeInTheDocument();
      expect(window.location.pathname).toBe('/user/login');
    });
  });
});
