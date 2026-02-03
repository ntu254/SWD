import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// TODO: Update this URL to match your backend services
const API_BASE_URL = __DEV__ === true ? 'http://localhost:8080' : 'https://api.production.swd'; // Local development

export const apiClient = axios.create({
    baseURL: API_BASE_URL,
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor - Add auth token to requests
apiClient.interceptors.request.use(
    async (config) => {
        const token = await AsyncStorage.getItem('authToken');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor - Handle errors globally
apiClient.interceptors.response.use(
    (response) => response,
    async (error) => {
        if (error.response?.status === 401) {
            // Token expired, clear storage and redirect to login
            await AsyncStorage.removeItem('authToken');
            await AsyncStorage.removeItem('userData');
            // Navigation will be handled by auth store
        }
        return Promise.reject(error);
    }
);

export default apiClient;
