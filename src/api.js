// Base URL reads from environment variable.
// In development: create a .env.local file with VITE_API_URL=http://localhost:5000
// In production: set VITE_API_URL to your deployed backend URL (e.g. https://api.yourdomain.com)
const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'

function authHeaders() {
  const token = localStorage.getItem('authToken')
  return token ? { Authorization: `Bearer ${token}` } : {}
}

async function request(method, path, body) {
  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: body ? JSON.stringify(body) : undefined,
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.message || 'কিছু একটা ভুল হয়েছে')
  return data
}

export const api = {
  auth: {
    login: (email, password) => request('POST', '/api/auth/login', { email, password }),
    register: (name, email, password) => request('POST', '/api/auth/register', { name, email, password }),
    me: () => request('GET', '/api/auth/me'),
    updateProfile: (data) => request('PUT', '/api/auth/profile', data),
    google: (credential) => request('POST', '/api/auth/google', { credential }),
    facebook: (credential) => request('POST', '/api/auth/facebook', { credential }),
    sendOtp: (phone) => request('POST', '/api/auth/send-otp', { phone }),
    verifyOtp: (phone, otp) => request('POST', '/api/auth/verify-otp', { phone, otp }),
    users: () => request('GET', '/api/auth/users'),
  },
  products: {
    list: (params = {}) => {
      const qs = new URLSearchParams(params).toString()
      return request('GET', `/api/products${qs ? `?${qs}` : ''}`)
    },
    get: (id) => request('GET', `/api/products/${id}`),
    create: (data) => request('POST', '/api/products', data),
    update: (id, data) => request('PUT', `/api/products/${id}`, data),
    delete: (id) => request('DELETE', `/api/products/${id}`),
  },
  orders: {
    create: (data) => request('POST', '/api/orders', data),
    list: (params = {}) => {
      const qs = new URLSearchParams(params).toString()
      return request('GET', `/api/orders${qs ? `?${qs}` : ''}`)
    },
    get: (id) => request('GET', `/api/orders/${id}`),
    updateStatus: (id, status) => request('PUT', `/api/orders/${id}/status`, { status }),
    update: (id, data) => request('PUT', `/api/orders/${id}`, data),
    delete: (id) => request('DELETE', `/api/orders/${id}`),
    deleteCancelled: () => request('DELETE', '/api/orders/bulk/cancelled'),
    customers: () => request('GET', '/api/orders/customers'),
  },
  categories: {
    list: () => request('GET', '/api/categories'),
    all: () => request('GET', '/api/categories/all'),
    create: (data) => request('POST', '/api/categories', data),
    update: (id, data) => request('PUT', `/api/categories/${id}`, data),
    delete: (id) => request('DELETE', `/api/categories/${id}`),
  },
  settings: {
    get: () => request('GET', '/api/settings'),
    update: (data) => request('PUT', '/api/settings', data),
  },
}
