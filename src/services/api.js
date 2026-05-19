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

// Auto-refresh token on 401
api.interceptors.response.use(
  (res) => res,
  async (error) => {
    if (error.response?.status === 401) {
      const refreshToken = localStorage.getItem('refreshToken')
      if (refreshToken) {
        try {
          const res = await axios.post(`${API_BASE}/auth/refresh`, {
            refreshToken,
          })
          const newToken = res.data.data.accessToken
          localStorage.setItem('accessToken', newToken)
          error.config.headers.Authorization = `Bearer ${newToken}`
          return axios(error.config)
        } catch {
          localStorage.clear()
          window.location.href = '/'
        }
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

export default api
