import axios from 'axios';
import Cookies from 'js-cookie';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

export const api = axios.create({ baseURL: API_URL });

api.interceptors.request.use((config) => {
  const token = Cookies.get('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      Cookies.remove('token');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

// Auth
export const authApi = {
  register: (data: { name: string; email: string; password: string }) =>
    api.post('/auth/register', data),
  login: (data: { email: string; password: string }) =>
    api.post('/auth/login', data),
  me: () => api.get('/auth/me'),
};

// Dashboard
export const dashboardApi = {
  getSummary: () => api.get('/dashboard/summary'),
};

// Transactions
export const transactionsApi = {
  create: (data: any) => api.post('/transactions', data),
  list: (params?: any) => api.get('/transactions', { params }),
  update: (id: string, data: any) => api.put(`/transactions/${id}`, data),
  delete: (id: string) => api.delete(`/transactions/${id}`),
  categoryStats: (month?: number, year?: number) =>
    api.get('/transactions/stats/categories', { params: { month, year } }),
  trend: () => api.get('/transactions/stats/trend'),
};

// Budgets
export const budgetsApi = {
  create: (data: any) => api.post('/budgets', data),
  list: (month?: number, year?: number) =>
    api.get('/budgets', { params: { month, year } }),
  update: (id: string, data: any) => api.put(`/budgets/${id}`, data),
  delete: (id: string) => api.delete(`/budgets/${id}`),
};

// Goals
export const goalsApi = {
  create: (data: any) => api.post('/goals', data),
  list: () => api.get('/goals'),
  contribute: (id: string, amount: number) =>
    api.post(`/goals/${id}/contribute`, { amount }),
  update: (id: string, data: any) => api.put(`/goals/${id}`, data),
  delete: (id: string) => api.delete(`/goals/${id}`),
};
