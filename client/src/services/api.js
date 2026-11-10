import axios from 'axios';
const API_URL = '/api';
export function camelCaseKeys(value) {
    if (Array.isArray(value)) {
        return value.map((item) => camelCaseKeys(item));
    }
    if (value !== null && typeof value === 'object') {
        return Object.fromEntries(Object.entries(value).map(([key, nestedValue]) => [
            key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase()),
            camelCaseKeys(nestedValue),
        ]));
    }
    return value;
}
class ApiService {
    client;
    refreshTokenPromise = null;
    constructor() {
        this.client = axios.create({
            baseURL: API_URL,
            headers: {
                'Content-Type': 'application/json',
            },
            withCredentials: false,
        });
        this.client.interceptors.request.use((config) => {
            const accessToken = localStorage.getItem('accessToken');
            if (accessToken && config.headers) {
                config.headers.Authorization = `Bearer ${accessToken}`;
            }
            return config;
        }, (error) => Promise.reject(error));
        this.client.interceptors.response.use((response) => {
            if (response.data && typeof response.data === 'object' && 'data' in response.data) {
                response.data.data = camelCaseKeys(response.data.data);
            }
            return response;
        }, async (error) => {
            const originalRequest = error.config;
            if (error.response?.status === 401 && !originalRequest._retry && !originalRequest.url?.includes('/auth/')) {
                originalRequest._retry = true;
                try {
                    const newAccessToken = await this.refreshAccessToken();
                    if (originalRequest.headers) {
                        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
                    }
                    return this.client(originalRequest);
                }
                catch {
                    this.clearAuth();
                    window.location.href = '/login';
                    return Promise.reject(error);
                }
            }
            return Promise.reject(error);
        });
    }
    async refreshAccessToken() {
        if (this.refreshTokenPromise) {
            return this.refreshTokenPromise;
        }
        const refreshToken = localStorage.getItem('refreshToken');
        if (!refreshToken) {
            throw new Error('No refresh token');
        }
        this.refreshTokenPromise = this.client
            .post('/auth/refresh', { refreshToken })
            .then((response) => {
            const { accessToken, refreshToken: newRefreshToken } = response.data.data;
            localStorage.setItem('accessToken', accessToken);
            localStorage.setItem('refreshToken', newRefreshToken);
            return accessToken;
        })
            .finally(() => {
            this.refreshTokenPromise = null;
        });
        return this.refreshTokenPromise;
    }
    clearAuth() {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
    }
    getAccessToken() {
        return localStorage.getItem('accessToken');
    }
    isAuthenticated() {
        return !!this.getAccessToken();
    }
    async login(credentials) {
        const response = await this.client.post('/auth/login', credentials);
        const { accessToken, refreshToken, user } = response.data.data;
        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('refreshToken', refreshToken);
        localStorage.setItem('user', JSON.stringify(camelCaseKeys(user)));
        return response.data.data;
    }
    async login2FA(credentials) {
        const response = await this.client.post('/auth/login/2fa', credentials);
        const { accessToken, refreshToken, user } = response.data.data;
        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('refreshToken', refreshToken);
        localStorage.setItem('user', JSON.stringify(camelCaseKeys(user)));
        return response.data.data;
    }
    async logout() {
        try {
            await this.client.post('/auth/logout');
        }
        finally {
            this.clearAuth();
        }
    }
    async getMe() {
        const response = await this.client.get('/auth/me');
        const user = response.data.data;
        localStorage.setItem('user', JSON.stringify(camelCaseKeys(user)));
        return user;
    }
    async setup2FA() {
        const response = await this.client.post('/auth/setup-2fa');
        return response.data.data;
    }
    async verify2FA(token) {
        const response = await this.client.post('/auth/verify-2fa', { token });
        return response.data.data;
    }
    async disable2FA(password) {
        const response = await this.client.post('/auth/disable-2fa', { password });
        return response.data.data;
    }
    async getAccounts() {
        const response = await this.client.get('/accounts');
        return response.data.data;
    }
    async getAccount(id) {
        const response = await this.client.get(`/accounts/${id}`);
        return response.data.data;
    }
    async getAccountBalance(id) {
        const response = await this.client.get(`/accounts/${id}/balance`);
        return response.data.data;
    }
    async getTransactions(params) {
        const response = await this.client.get('/transactions', { params });
        return response.data.data;
    }
    async getTransaction(id) {
        const response = await this.client.get(`/transactions/${id}`);
        return response.data.data;
    }
    async transfer(data) {
        const response = await this.client.post('/transactions/transfer', data);
        return response.data.data;
    }
    async getUsers(params) {
        const response = await this.client.get('/admin/users', { params });
        return response.data.data;
    }
    async getAdminAccounts() {
        const response = await this.client.get('/admin/accounts');
        return response.data.data;
    }
    async getTransactionPolicy() {
        const response = await this.client.get('/admin/transaction-policy');
        return response.data.data;
    }
    async updateTransactionPolicy(policy) {
        const response = await this.client.put('/admin/transaction-policy', policy);
        return response.data.data;
    }
    async getUser(id) {
        const response = await this.client.get(`/admin/users/${id}`);
        return response.data.data;
    }
    async createUser(data) {
        const response = await this.client.post('/admin/users', data);
        return response.data.data;
    }
    async updateUser(id, data) {
        const response = await this.client.put(`/admin/users/${id}`, data);
        return response.data.data;
    }
    async updateUserTwoFactor(id, data) {
        const response = await this.client.put(`/admin/users/${id}/2fa`, data);
        return response.data.data;
    }
    async deleteUser(id) {
        const response = await this.client.delete(`/admin/users/${id}`);
        return response.data.data;
    }
    async updateUserBalance(data) {
        const response = await this.client.put('/admin/users/balance', data);
        return response.data.data;
    }
    async getAllTransactions(params) {
        const response = await this.client.get('/admin/transactions', { params });
        return response.data.data;
    }
    async createTransaction(userId, data) {
        const response = await this.client.post(`/admin/users/${userId}/transactions`, data);
        return response.data.data;
    }
    async updateTransaction(id, data) {
        const response = await this.client.put(`/admin/transactions/${id}`, data);
        return response.data.data;
    }
    async deleteTransaction(id) {
        const response = await this.client.delete(`/admin/transactions/${id}`);
        return response.data.data;
    }
}
export const api = new ApiService();
