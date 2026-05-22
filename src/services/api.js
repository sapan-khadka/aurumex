import axios from 'axios'

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5001/api/v1'

const api = axios.create({
  baseURL: API_BASE,
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
})

// Attach JWT token to every request automatically
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// 401 → single refresh retry; logout only if refresh fails or no refresh token
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config

    if (error.response?.status === 401 && !originalRequest?._retry) {
      originalRequest._retry = true
      const refreshToken = localStorage.getItem('refreshToken')

      if (refreshToken) {
        try {
          const res = await axios.post(`${API_BASE}/auth/refresh`, {
            refreshToken,
          })
          const newToken = res.data.data.accessToken
          localStorage.setItem('accessToken', newToken)
          originalRequest.headers.Authorization = `Bearer ${newToken}`
          return api(originalRequest)
        } catch (refreshError) {
          localStorage.clear()
          window.location.href = '/login'
          return Promise.reject(refreshError)
        }
      } else {
        localStorage.clear()
        window.location.href = '/login'
        return Promise.reject(error)
      }
    }

    return Promise.reject(error)
  },
)

export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  logout: () => api.post('/auth/logout'),
  refresh: (token) => api.post('/auth/refresh', { refreshToken: token }),
}

export const kycAPI = {
  getStatus: () => api.get('/kyc/status'),
  submit: (data) => api.post('/kyc/submit', data),
}

export const userAPI = {
  getProfile: () => api.get('/users/profile'),
  updateProfile: (data) => api.patch('/users/profile', data),
  changePassword: (data) => api.post('/users/change-password', data),
  toggle2FA: () => api.post('/users/toggle-2fa'),
}

export const pricesAPI = {
  getAll: () => api.get('/prices'),
  getPair: (pair) => api.get(`/prices/${pair.replace('/', '-')}`),
}

export const walletAPI = {
  getBalances: () => api.get('/wallet/balances'),
  getHistory: () => api.get('/wallet/history'),
  deposit: (data) => api.post('/wallet/deposit', data),
  withdraw: (data) => api.post('/wallet/withdraw', data),
}

export const ordersAPI = {
  create: (data) => api.post('/orders', data),
  getOpen: () => api.get('/orders?status=open'),
  getHistory: () => api.get('/orders/history'),
  cancel: (id) => api.delete(`/orders/${id}`),
}

export const earnAPI = {
  getProducts: () => api.get('/earn/products'),
  getPositions: () => api.get('/earn/positions'),
  getSummary: () => api.get('/earn/summary'),
  deposit: (data) => api.post('/earn/deposit', data),
  withdraw: (id) => api.post(`/earn/withdraw/${id}`),
}

export const adminAPI = {
  getStats: () => api.get('/admin/stats'),
  getUsers: (params) => api.get('/admin/users', { params }),
  getOrders: (params) => api.get('/admin/orders', { params }),
  getUserDetail: (id) => api.get(`/admin/users/${id}`),
  toggleUserActive: (id) => api.patch(`/admin/users/${id}/toggle`),
}

export const supportAPI = {
  createTicket: (data) => api.post('/support/tickets', data),
  getMyTickets: () => api.get('/support/tickets'),
  getTicket: (id) => api.get(`/support/tickets/${id}`),
  addMessage: (id, message) =>
    api.post(`/support/tickets/${id}/messages`, { message }),
  adminGetTickets: () => api.get('/support/admin/tickets'),
  adminGetTicket: (id) => api.get(`/support/admin/tickets/${id}`),
  adminReply: (id, message) =>
    api.post(`/support/admin/tickets/${id}/reply`, { message }),
  adminUpdateStatus: (id, status) =>
    api.patch(`/support/admin/tickets/${id}/status`, { status }),
}

export default api
