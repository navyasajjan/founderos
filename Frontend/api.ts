const API_URL = 'http://localhost:5000/api';

export const api = {
  setToken: (token: string) => localStorage.setItem('founder_os_token', token),
  getToken: () => localStorage.getItem('founder_os_token'),
  logout: () => localStorage.removeItem('founder_os_token'),

  request: async (endpoint: string, options: RequestInit = {}) => {
    const token = api.getToken();
    const headers = {
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    };

    const response = await fetch(`${API_URL}${endpoint}`, { ...options, headers });
    if (response.status === 204) return null;
    const data = await response.json();

    if (!response.ok) throw new Error(data.error || 'Network response failure');
    return data;
  },

  auth: {
    login: (creds: any) => api.request('/auth/login', { method: 'POST', body: JSON.stringify(creds) }),
    register: (details: any) => api.request('/auth/register', { method: 'POST', body: JSON.stringify(details) }),
    getMe: () => api.request('/auth/me')
  },

  records: {
    list: (companyId?: string | null) => api.request(`/records${companyId ? `?companyId=${companyId}` : ''}`),
    create: (data: any) => api.request('/records', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: string, data: any) => api.request(`/records/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (id: string, companyId: string) => api.request(`/records/${id}?companyId=${companyId}`, { method: 'DELETE' })
  },

  companies: {
    list: () => api.request('/companies'),
    create: (data: any) => api.request('/companies', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: string, data: any) => api.request(`/companies/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (id: string) => api.request(`/companies/${id}`, { method: 'DELETE' })
  },

  people: {
    list: () => api.request('/people'),
    create: (data: any) => api.request('/people', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: string, data: any) => api.request(`/people/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (id: string) => api.request(`/people/${id}`, { method: 'DELETE' }),
    roles: {
      list: () => api.request('/people/roles'),
      create: (data: any) => api.request('/people/roles', { method: 'POST', body: JSON.stringify(data) }),
      update: (id: string, data: any) => api.request(`/people/roles/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
      delete: (id: string) => api.request(`/people/roles/${id}`, { method: 'DELETE' })
    }
  },

  finance: {
    getExpenses: (companyId: string) => api.request(`/finance/${companyId}/expenses`),
    createExpense: (companyId: string, data: any) => api.request(`/finance/${companyId}/expenses`, { method: 'POST', body: JSON.stringify(data) }),
    deleteExpense: (companyId: string, id: string) => api.request(`/finance/${companyId}/expenses/${id}`, { method: 'DELETE' }),
    getData: (companyId: string) => api.request(`/finance/${companyId}`),
    updateData: (companyId: string, data: any) => api.request(`/finance/${companyId}`, { method: 'PUT', body: JSON.stringify(data) })
  },

  decisions: {
    list: (companyId: string) => api.request(`/decisions/${companyId}`),
    create: (companyId: string, data: any) => api.request(`/decisions/${companyId}`, { method: 'POST', body: JSON.stringify(data) }),
    update: (companyId: string, id: string, data: any) => api.request(`/decisions/${companyId}/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (companyId: string, id: string) => api.request(`/decisions/${companyId}/${id}`, { method: 'DELETE' })
  },

   intelligence: {
    getAssumptions: (companyId: string) => api.request(`/intelligence/assumptions?companyId=${companyId}`),
    saveAssumption: (data: any) => api.request('/intelligence/assumptions', { method: 'POST', body: JSON.stringify(data) }),
    deleteAssumption: (id: string, companyId: string) => api.request(`/intelligence/assumptions/${id}?companyId=${companyId}`, { method: 'DELETE' }),
    getRisks: (companyId: string) => api.request(`/intelligence/risks?companyId=${companyId}`),
    saveRisk: (data: any) => api.request('/intelligence/risks', { method: 'POST', body: JSON.stringify(data) }),
    deleteRisk: (id: string, companyId: string) => api.request(`/intelligence/risks/${id}?companyId=${companyId}`, { method: 'DELETE' })
  }
};