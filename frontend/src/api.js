const BASE_URL = '/api';

async function request(endpoint, options = {}) {
  const token = localStorage.getItem('token');
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const error = new Error(data.message || 'Something went wrong');
    error.status = response.status;
    error.data = data;
    throw error;
  }

  return data;
}

export const api = {
  // Auth
  login: (credentials) => request('/auth/login', { method: 'POST', body: JSON.stringify(credentials) }),
  register: (userData) => request('/auth/register', { method: 'POST', body: JSON.stringify(userData) }),
  getMe: () => request('/auth/me'),
  changePassword: (passwords) => request('/auth/change-password', { method: 'PUT', body: JSON.stringify(passwords) }),

  // Admin
  getAdminStats: () => request('/admin/stats'),
  getAdminUsers: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/admin/users${query ? `?${query}` : ''}`);
  },
  createAdminUser: (userData) => request('/admin/users', { method: 'POST', body: JSON.stringify(userData) }),
  getUserDetails: (id) => request(`/admin/users/${id}`),
  getAdminStores: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/admin/stores${query ? `?${query}` : ''}`);
  },
  createAdminStore: (storeData) => request('/admin/stores', { method: 'POST', body: JSON.stringify(storeData) }),

  // User
  getUserStores: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/stores${query ? `?${query}` : ''}`);
  },
  submitRating: (ratingData) => request('/ratings', { method: 'POST', body: JSON.stringify(ratingData) }),

  // Store Owner
  getOwnerDashboard: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/owner/dashboard${query ? `?${query}` : ''}`);
  },
};
