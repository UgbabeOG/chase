export interface User {
  id: number;
  username: string;
  email: string;
  role: 'user' | 'admin';
  firstName: string;
  lastName: string;
  phone: string | null;
  otpEnabled: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  lastLogin: string | null;
}

export interface Account {
  id: number;
  userId: number;
  accountType: 'checking' | 'savings';
  accountNumber: string;
  routingNumber: string;
  balance: number;
  availableBalance: number;
  nickname: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Transaction {
  id: number;
  accountId: number;
  type: 'debit' | 'credit' | 'transfer_in' | 'transfer_out';
  category: string | null;
  description: string;
  amount: number;
  balanceAfter: number;
  status: 'pending' | 'completed' | 'failed' | 'cancelled';
  referenceNumber: string;
  counterpartyAccountId: number | null;
  metadata: Record<string, unknown> | null;
  createdAt: string;
  accountType?: string;
  accountNickname?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: Record<string, unknown>;
  };
  meta?: Record<string, unknown>;
}

export interface LoginRequest {
  username: string;
  password: string;
  otp?: string;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
  requires2FA?: boolean;
}

export interface TransferRequest {
  fromAccountId: number;
  toAccountNumber: string;
  amount: number;
  description?: string;
}

export interface TransferResponse {
  transaction: Transaction;
  fromAccount: Account;
  toAccount: Account;
}

export interface AdminCreateUserRequest {
  username: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
  role?: 'user' | 'admin';
}

export interface AdminUpdateUserRequest {
  email?: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  role?: 'user' | 'admin';
  isActive?: boolean;
}

export interface AdminUpdateBalanceRequest {
  accountId: number;
  balance: number;
  availableBalance?: number;
}

export interface AdminCreateTransactionRequest {
  accountId: number;
  type: 'debit' | 'credit' | 'transfer_in' | 'transfer_out';
  category?: string;
  description: string;
  amount: number;
  status?: 'pending' | 'completed' | 'failed' | 'cancelled';
  counterpartyAccountId?: number;
  metadata?: Record<string, unknown>;
}

export interface Setup2FAResponse {
  secret: string;
  qrCodeUrl: string;
  backupCodes: string[];
}