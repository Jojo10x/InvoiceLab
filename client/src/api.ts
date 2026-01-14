import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';
console.log('API_URL:', API_URL);

export const api = axios.create({
  baseURL: API_URL,
});

export const getAuthHeaders = async (getToken: () => Promise<string | null>) => {
  const token = await getToken();
  return {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'multipart/form-data', 
    },
  };
};