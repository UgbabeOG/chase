import axios, { AxiosInstance, InternalAxiosRequestConfig, AxiosError } from 'axios';
import type { ApiResponse, LoginResponse, LoginRequest, User, Account, AdminAccount, Transaction, PaginatedResponse, TransferRequest, TransferResponse, Setup2FAResponse, AdminCreateUserRequest, AdminUpdateUserRequest, AdminUpdateTwoFactorRequest, AdminUpdateBalanceRequest, AdminCreateTransactionRequest, TransactionPolicy } from '../types/api';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

export function camelCaseKeys<T>(value: T): T {
  if (Array.isArray(value)) {
    return value.map((item) => camelCaseKeys(item)) as T;
  }

  if (value !== null && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value).map(([key, nestedValue]) => [
        key.replace(/_([a-z])/g, (_, letter: string) => letter.toUpperCase()),
        camelCaseKeys(nestedValue),
      ]),
    ) as T;
  }

  return value;
}

class ApiService {
  private client: AxiosInstance;
  private refreshTokenPromise: Promise<string> | null = null;

  constructor() {
    this.client = axios.create({
      baseURL: API_URL,
      headers: {
        'Content-Type': 'application/json',
      },
      withCredentials: false,
    });

    this.client.interceptors.request.use(
      (config: InternalAxiosRequestConfig) => {
        const accessToken = localStorage.getItem('accessToken');
        if (accessToken && config.headers) {
          config.headers.Authorization = `Bearer ${accessToken}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    this.client.interceptors.response.use(
      (response) => {
        if (response.data && typeof response.data === 'object' && 'data' in response.data) {
          response.data.data = camelCaseKeys(response.data.data);
        }
        return response;
      },
      async (error: AxiosError) => {
        const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

        if (error.response?.status === 401 && !originalRequest._retry && !originalRequest.url?.includes('/auth/')) {
          originalRequest._retry = true;

          try {
            const newAccessToken = await this.refreshAccessToken();
            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
            }
            return this.client(originalRequest);
          } catch {
            this.clearAuth();
            window.location.href = '/login';
            return Promise.reject(error);
          }
        }

        return Promise.reject(error);
      }
    );
  }

  private async refreshAccessToken(): Promise<string> {
    if (this.refreshTokenPromise) {
      return this.refreshTokenPromise;
    }

    const refreshToken = localStorage.getItem('refreshToken');
    if (!refreshToken) {
      throw new Error('No refresh token');
    }

    this.refreshTokenPromise = this.client
      .post<ApiResponse<{ accessToken: string; refreshToken: string }>>('/auth/refresh', { refreshToken })
      .then((response) => {
        const { accessToken, refreshToken: newRefreshToken } = response.data.data!;
        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('refreshToken', newRefreshToken);
        return accessToken;
      })
      .finally(() => {
        this.refreshTokenPromise = null;
      });

    return this.refreshTokenPromise;
  }

  clearAuth(): void {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
  }

  getAccessToken(): string | null {
    return localStorage.getItem('accessToken');
  }

  isAuthenticated(): boolean {
    return !!this.getAccessToken();
  }

  async login(credentials: LoginRequest): Promise<LoginResponse> {
    const response = await this.client.post<ApiResponse<LoginResponse>>('/auth/login', credentials);
    const { accessToken, refreshToken, user } = response.data.data!;
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
    localStorage.setItem('user', JSON.stringify(camelCaseKeys(user)));
    return response.data.data!;
  }

  async login2FA(credentials: LoginRequest): Promise<LoginResponse> {
    const response = await this.client.post<ApiResponse<LoginResponse>>('/auth/login/2fa', credentials);
    const { accessToken, refreshToken, user } = response.data.data!;
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
    localStorage.setItem('user', JSON.stringify(camelCaseKeys(user)));
    return response.data.data!;
  }

  async logout(): Promise<void> {
    try {
      await this.client.post('/auth/logout');
    } finally {
      this.clearAuth();
    }
  }

  async getMe(): Promise<User> {
    const response = await this.client.get<ApiResponse<User>>('/auth/me');
    const user = response.data.data!;
    localStorage.setItem('user', JSON.stringify(camelCaseKeys(user)));
    return user;
  }

  async setup2FA(): Promise<Setup2FAResponse> {
    const response = await this.client.post<ApiResponse<Setup2FAResponse>>('/auth/setup-2fa');
    return response.data.data!;
  }

  async verify2FA(token: string): Promise<{ message: string }> {
    const response = await this.client.post<ApiResponse<{ message: string }>>('/auth/verify-2fa', { token });
    return response.data.data!;
  }

  async disable2FA(password: string): Promise<{ message: string }> {
    const response = await this.client.post<ApiResponse<{ message: string }>>('/auth/disable-2fa', { password });
    return response.data.data!;
  }

  async getAccounts(): Promise<Account[]> {
    const response = await this.client.get<ApiResponse<Account[]>>('/accounts');
    return response.data.data!;
  }

  async getAccount(id: number): Promise<Account> {
    const response = await this.client.get<ApiResponse<Account>>(`/accounts/${id}`);
    return response.data.data!;
  }

  async getAccountBalance(id: number): Promise<Pick<Account, 'id' | 'balance' | 'availableBalance' | 'accountType' | 'accountNumber'>> {
    const response = await this.client.get<ApiResponse<Pick<Account, 'id' | 'balance' | 'availableBalance' | 'accountType' | 'accountNumber'>>>(`/accounts/${id}/balance`);
    return response.data.data!;
  }

  async getTransactions(params?: {
    page?: number;
    limit?: number;
    accountId?: number;
    type?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<PaginatedResponse<Transaction>> {
    const response = await this.client.get<ApiResponse<PaginatedResponse<Transaction>>>('/transactions', { params });
    return response.data.data!;
  }

  async getTransaction(id: number): Promise<Transaction> {
    const response = await this.client.get<ApiResponse<Transaction>>(`/transactions/${id}`);
    return response.data.data!;
  }

  async transfer(data: TransferRequest): Promise<TransferResponse> {
    const response = await this.client.post<ApiResponse<TransferResponse>>('/transactions/transfer', data);
    return response.data.data!;
  }

  async getUsers(params?: {
    page?: number;
    limit?: number;
    search?: string;
    role?: string;
  }): Promise<PaginatedResponse<User>> {
    const response = await this.client.get<ApiResponse<PaginatedResponse<User>>>('/admin/users', { params });
    return response.data.data!;
  }

  async getAdminAccounts(): Promise<AdminAccount[]> {
    const response = await this.client.get<ApiResponse<AdminAccount[]>>('/admin/accounts');
    return response.data.data!;
  }

  async getTransactionPolicy(): Promise<TransactionPolicy> {
    const response = await this.client.get<ApiResponse<TransactionPolicy>>('/admin/transaction-policy');
    return response.data.data!;
  }

  async updateTransactionPolicy(policy: TransactionPolicy): Promise<TransactionPolicy> {
    const response = await this.client.put<ApiResponse<TransactionPolicy>>('/admin/transaction-policy', policy);
    return response.data.data!;
  }

  async getUser(id: number): Promise<{ user: User; accounts: Account[] }> {
    const response = await this.client.get<ApiResponse<{ user: User; accounts: Account[] }>>(`/admin/users/${id}`);
    return response.data.data!;
  }

  async createUser(data: AdminCreateUserRequest): Promise<User> {
    const response = await this.client.post<ApiResponse<User>>('/admin/users', data);
    return response.data.data!;
  }

  async updateUser(id: number, data: AdminUpdateUserRequest): Promise<User> {
    const response = await this.client.put<ApiResponse<User>>(`/admin/users/${id}`, data);
    return response.data.data!;
  }

  async updateUserTwoFactor(id: number, data: AdminUpdateTwoFactorRequest): Promise<{ otpEnabled: boolean }> {
    const response = await this.client.put<ApiResponse<{ otpEnabled: boolean }>>(`/admin/users/${id}/2fa`, data);
    return response.data.data!;
  }

  async deleteUser(id: number): Promise<{ message: string }> {
    const response = await this.client.delete<ApiResponse<{ message: string }>>(`/admin/users/${id}`);
    return response.data.data!;
  }

  async updateUserBalance(data: AdminUpdateBalanceRequest): Promise<Account> {
    const response = await this.client.put<ApiResponse<Account>>('/admin/users/balance', data);
    return response.data.data!;
  }

  async getAllTransactions(params?: {
    page?: number;
    limit?: number;
    userId?: number;
    accountId?: number;
    type?: string;
    status?: string;
  }): Promise<PaginatedResponse<Transaction & { username: string; firstName: string; lastName: string }>> {
    const response = await this.client.get<ApiResponse<PaginatedResponse<Transaction & { username: string; firstName: string; lastName: string }>>>('/admin/transactions', { params });
    return response.data.data!;
  }

  async createTransaction(userId: number, data: AdminCreateTransactionRequest): Promise<Transaction> {
    const response = await this.client.post<ApiResponse<Transaction>>(`/admin/users/${userId}/transactions`, data);
    return response.data.data!;
  }

  async updateTransaction(id: number, data: Partial<Transaction>): Promise<Transaction> {
    const response = await this.client.put<ApiResponse<Transaction>>(`/admin/transactions/${id}`, data);
    return response.data.data!;
  }

  async deleteTransaction(id: number): Promise<{ message: string }> {
    const response = await this.client.delete<ApiResponse<{ message: string }>>(`/admin/transactions/${id}`);
    return response.data.data!;
  }
}

export const api = new ApiService();