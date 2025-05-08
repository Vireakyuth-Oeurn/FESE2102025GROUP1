export const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export const ROUTES = {
  HOME: '/',
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    RESET: '/auth/reset',
  },
  ADMIN: {
    DASHBOARD: '/admin/dashboard',
    USERS: '/admin/users',
    PRODUCTS: '/admin/products',
    CATEGORIES: '/admin/categories',
    ORDERS: '/admin/orders',
    LOGS: '/admin/logs',
  },
  USER: {
    PROFILE: '/user/profile',
    ADDRESSES: '/user/addresses',
    CART: '/user/cart',
    ORDERS: '/user/orders',
  },
};

export const USER_ROLES = {
  ADMIN: 'admin',
  USER: 'user',
}; 