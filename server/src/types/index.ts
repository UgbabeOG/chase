export interface User {
  id: number;
  username: string;
  email: string;
  role: 'user' | 'admin';
  first_name: string;
  last_name: string;
  phone: string | null;
  otp_enabled: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  last_login: string | null;
}

export interface UserWithSecrets extends User {
  password_hash: string;
  otp_secret: string | null;
}

export interface Account {
  id: number;
  user_id: number;
  account_type: 'checking' | 'savings';
  account_number: string;
  routing_number: string;
  balance: number;
  available_balance: number;
  nickname: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Transaction {
  id: number;
  account_id: number;
  type: 'debit' | 'credit' | 'transfer_in' | 'transfer_out';
  category: string | null;
  description: string;
  amount: number;
  balance_after: number;
  status: 'pending' | 'completed' | 'failed' | 'cancelled';
  reference_number: string;
  counterparty_account_id: number | null;
  metadata: Record<string, unknown> | null;
  created_at: string;
}

export interface TransactionWithAccount extends Transaction {
  account_type?: string;
  account_nickname?: string;
}

export interface Session {
  id: number;
  user_id: number;
  token_hash: string;
  ip_address: string | null;
  user_agent: string | null;
  expires_at: string;
  created_at: string;
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

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface Setup2FAResponse {
  secret: string;
  qrCodeUrl: string;
  backupCodes: string[];
}

export interface Verify2FARequest {
  token: string;
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

export interface JWTPayload {
  userId: number;
  username: string;
  role: 'user' | 'admin';
  type: 'access' | 'refresh';
  iat?: number;
  exp?: number;
}

export interface AuthRequest extends Request {
  user?: JWTPayload;
}