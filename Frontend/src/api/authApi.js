import { backendRequest } from './apiClient';

export const authApi = {
  login: (email, password) =>
    backendRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    }),

  register: (name, email, password) =>
    backendRequest('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password })
    }),

  registerAdmin: (name, email, password, accessKey) =>
    backendRequest('/auth/admin/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password, accessKey })
    }),

  getCurrentUser: () =>
    backendRequest('/auth/me'),

  logout: () =>
    backendRequest('/auth/logout', { method: 'POST' })
};
