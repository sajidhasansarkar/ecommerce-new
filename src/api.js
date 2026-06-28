const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'

async function request(method, path, body) {
  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include', // httpOnly cookie পাঠাবে প্রতিটি রিকোয়েস্টে
    body: body ? JSON.stringify(body) : undefined,
  })

  const raw = await res.text()
  let data
  try {
    data = raw ? JSON.parse(raw) : {}
  } catch {
    if (res.status === 413 || raw.trim().startsWith('<')) {
      throw new Error('ছবি/ডাটার সাইজ অনেক বড় — সার্ভার এটা গ্রহণ করতে পারছে না। ছবির সাইজ ছোট করে আবার চেষ্টা করুন।')
    }
    throw new Error(`সার্ভার থেকে অপ্রত্যাশিত উত্তর এসেছে (status ${res.status})। কিছুক্ষণ পর আবার চেষ্টা করুন।`)
  }

  if (!res.ok) throw new Error(data.message || 'কিছু একটা ভুল হয়েছে')
  return data
}

export const api = {
  auth: {
    login: (email, password) => request('POST', '/api/auth/login', { email, password }),
    register: (name, email, password) => request('POST', '/api/auth/register', { name, email, password }),
    me: () => request('GET', '/api/auth/me'),
    logout: () => request('POST', '/api/auth/logout'),
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
    migrateProductIds: () => request('POST', '/api/products/migrate/product-ids'),
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
  promo: {
    list: () => request('GET', '/api/promo'),
    create: (data) => request('POST', '/api/promo', data),
    update: (id, data) => request('PUT', `/api/promo/${id}`, data),
    delete: (id) => request('DELETE', `/api/promo/${id}`),
    apply: (code, subtotal) => request('POST', '/api/promo/apply', { code, subtotal }),
  },
  upload: {
    image: (dataUrlOrBase64, name) => request('POST', '/api/upload', { image: dataUrlOrBase64, name }),
  },
}
