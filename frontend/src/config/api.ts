import axios from 'axios';

// Determine API URL based on environment
const getAPIURL = (): string => {
  // Development: local backend
  if (import.meta.env.DEV) {
    return import.meta.env.VITE_API_URL || 'http://localhost:8000';
  }

  // Production: use Vercel URL automatically
  const vercelUrl = import.meta.env.VITE_VERCEL_URL;
  if (vercelUrl) {
    return `https://${vercelUrl}/_/backend`;
  }

  // Fallback (shouldn't happen in production)
  return 'http://localhost:8000';
};

const API_URL = getAPIURL();

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
});

export default api;
