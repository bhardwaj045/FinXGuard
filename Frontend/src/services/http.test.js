import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { requestApi, SESSION_TOKEN_KEY } from './http';

describe('requestApi authentication errors', () => {
  const session = new Map();
  const dispatchEvent = vi.fn();

  beforeEach(() => {
    session.clear();
    dispatchEvent.mockClear();
    vi.stubGlobal('sessionStorage', {
      getItem: (key) => session.get(key) ?? null,
      setItem: (key, value) => session.set(key, value),
      removeItem: (key) => session.delete(key)
    });
    vi.stubGlobal('window', { dispatchEvent });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('keeps the current session when login credentials are rejected', async () => {
    session.set(SESSION_TOKEN_KEY, 'existing-session');
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(
      new Response('Invalid email or password', { status: 401 })
    ));

    await expect(requestApi('http://backend/api', '/auth/login', {
      method: 'POST',
      body: '{}'
    })).rejects.toMatchObject({
      message: 'Invalid email or password',
      status: 401
    });

    expect(session.get(SESSION_TOKEN_KEY)).toBe('existing-session');
    expect(dispatchEvent).not.toHaveBeenCalled();
  });

  it('clears the session when an authenticated request is unauthorized', async () => {
    session.set(SESSION_TOKEN_KEY, 'expired-session');
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(
      new Response('Authentication required', { status: 401 })
    ));

    await expect(requestApi('http://backend/api', '/auth/me'))
      .rejects.toMatchObject({
        message: 'Your session has expired. Please sign in again.',
        status: 401
      });

    expect(session.has(SESSION_TOKEN_KEY)).toBe(false);
    expect(dispatchEvent).toHaveBeenCalledOnce();
  });

  it('explains that initial admin registration must be configured for a 503', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(
      new Response('Administrator registration is not configured', { status: 503 })
    ));

    await expect(requestApi('http://backend/api', '/auth/admin/register', {
      method: 'POST',
      body: '{}'
    })).rejects.toMatchObject({
      message: 'Initial administrator registration is not configured. Ask the system operator to configure the admin registration key.',
      status: 503
    });
  });
});
