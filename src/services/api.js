const API_BASE = '/api';

const getHeaders = () => ({
  'Content-Type': 'application/json',
  'Authorization': localStorage.getItem('shakti-token') || 'fake-jwt-shakti-admin'
});

export const api = {
  // Appointments
  getAppointments: async () => {
    const r = await fetch(`${API_BASE}/bookings`, { headers: getHeaders() });
    return r.json();
  },
  
  createAppointment: async (data) => {
    const r = await fetch(`${API_BASE}/bookings`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data)
    });
    return r.json();
  },

  getBusySlots: async (date) => {
    const r = await fetch(`${API_BASE}/bookings/busy?date=${date}`);
    return r.json();
  },

  // Analytics
  getAnalytics: async () => {
    const r = await fetch(`${API_BASE}/reports/analytics`, { headers: getHeaders() });
    return r.json();
  },

  // Technicians
  getTechnicians: async () => {
    const r = await fetch(`${API_BASE}/technicians`);
    return r.json();
  },

  // Customers
  getCustomers: async (search = '') => {
    const r = await fetch(`${API_BASE}/customers?search=${search}`, { headers: getHeaders() });
    return r.json();
  },

  // Services
  getServices: async (search = '', showDeleted = false) => {
    const r = await fetch(`${API_BASE}/services?search=${search}&showDeleted=${showDeleted}`);
    return r.json();
  },

  // Settings
  getSettings: async () => {
    const r = await fetch(`${API_BASE}/settings`);
    return r.json();
  },

  updateSettings: async (data) => {
    const r = await fetch(`${API_BASE}/settings`, {
      method: 'PATCH',
      headers: getHeaders(),
      body: JSON.stringify(data)
    });
    return r.json();
  },

  // Auth
  login: async (credentials) => {
    const r = await fetch(`${API_BASE}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials)
    });
    return r.json();
  },

  // Contact
  sendContact: async (data) => {
    const r = await fetch(`${API_BASE}/contact`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return r.json();
  },

  validateVoucher: async (code, serviceId) => {
    const r = await fetch(`${API_BASE}/vouchers/validate?code=${code}&serviceId=${serviceId}`);
    return r.json();
  }
};
