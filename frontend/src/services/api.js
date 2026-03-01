import axios from 'axios';

const DISPUTES_API_BASE_URL = 'https://api.kambiop2p.com';
const MARKET_API_BASE_URL = 'https://api.kambiop2p.com';
const TRANSACTIONS_API_BASE_URL = 'https://api.kambiop2p.com';
const USERS_API_BASE_URL = 'https://api.kambiop2p.com';

export const disputesApi = axios.create({ baseURL: DISPUTES_API_BASE_URL });
export const marketApi = axios.create({ baseURL: MARKET_API_BASE_URL });
export const transactionsApi = axios.create({ baseURL: TRANSACTIONS_API_BASE_URL });
export const usersApi = axios.create({ baseURL: USERS_API_BASE_URL });

// Group the instances that require auth
const authenticatedServices = [transactionsApi, disputesApi];

// Apply the interceptor to all of them at once
authenticatedServices.forEach((instance) => {
  instance.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });
});