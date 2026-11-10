import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { database, saveDatabase } from '../db/index.js';
import { AuthRequest, User, Account, Transaction, ApiResponse, PaginatedResponse, AdminCreateUserRequest, AdminUpdateUserRequest, AdminUpdateBalanceRequest, AdminCreateTransactionRequest } from '../types/index.js';
import { AppError, asyncHandler } from '../middleware/index.js';

function generateReferenceNumber(): string {
  return 'REF' + Date.now().toString(36).toUpperCase() + Math.random().toString(36).substring(2, 8).toUpperCase();
}

export const getUsers = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = Math.min(parseInt(req.query.limit as string) || 20, 100);
  const search = req.query.search as string;
  const role = req.query.role as string;
  const offset = (page - 1) * limit;

  let whereClause = 'WHERE 1=1';
  const params: (string | number)[] = [];

  if (search) {
    whereClause += ' AND (username LIKE ? OR email LIKE ? OR first_name LIKE ? OR last_name LIKE ?)';
    const searchTerm = `%${search}%`;
    params.push(searchTerm, searchTerm, searchTerm, searchTerm);
  }

  if (role) {
    whereClause += ' AND role = ?';
    params.push(role);
  }

  const countStmt = await database.prepare(`SELECT COUNT(*) as total FROM users ${whereClause}`);
  const total = (await countStmt.get(...params) as { total: number }).total;

  const usersStmt = await database.prepare(`
    SELECT id, username, email, role, first_name, last_name, phone, otp_enabled, is_active, transactions_blocked, created_at, updated_at, last_login
    FROM users
    ${whereClause}
    ORDER BY created_at DESC
    LIMIT ? OFFSET ?
  `);
  const users = await usersStmt.all(...params, limit, offset) as User[];

  const response: ApiResponse<PaginatedResponse<User>> = {
    success: true,
    data: {
      data: users,
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    },
  };
  res.json(response);
});

export const getAllAccounts = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
  const accounts = await (await database.prepare(`
    SELECT a.*, u.username
    FROM accounts a
    JOIN users u ON u.id = a.user_id
    WHERE a.is_active = 1
    ORDER BY u.username, a.account_type
  `)).all();

  const response: ApiResponse<typeof accounts> = { success: true, data: accounts };
  res.json(response);
});

export const getTransactionPolicy = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
  const setting = await (await database.prepare(
    'SELECT setting_value FROM app_settings WHERE setting_key = ?'
  )).get('transaction_block_message') as { setting_value: string } | undefined;

  const response: ApiResponse<{ blockedMessage: string }> = {
    success: true,
    data: {
      blockedMessage: setting?.setting_value ?? 'Transactions are currently disabled for your account. Please contact support.',
    },
  };
  res.json(response);
});

export const updateTransactionPolicy = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
  const { blockedMessage } = req.body as { blockedMessage: string };
  await (await database.prepare(`
    INSERT INTO app_settings (setting_key, setting_value)
    VALUES (?, ?)
    ON CONFLICT(setting_key) DO UPDATE SET setting_value = excluded.setting_value
  `)).run('transaction_block_message', blockedMessage);
  saveDatabase();

  const response: ApiResponse<{ blockedMessage: string }> = {
    success: true,
    data: { blockedMessage },
  };
  res.json(response);
});

export const getUser = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
  const { id } = req.params;

  const user = await (await database.prepare(`
    SELECT id, username, email, role, first_name, last_name, phone, otp_enabled, is_active, transactions_blocked, created_at, updated_at, last_login
    FROM users WHERE id = ?
  `)).get(id) as User | undefined;

  if (!user) {
    throw new AppError('USER_NOT_FOUND', 'User not found', 404);
  }

  const accounts = await (await database.prepare('SELECT * FROM accounts WHERE user_id = ? AND is_active = 1')).all(id) as Account[];

  const response: ApiResponse<{ user: User; accounts: Account[] }> = {
    success: true,
    data: { user, accounts },
  };
  res.json(response);
});

export const createUser = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
  const { username, email, password, firstName, lastName, phone, role } = req.body as AdminCreateUserRequest;

  const existingUser = await (await database.prepare('SELECT id FROM users WHERE username = ? OR email = ?')).get(username, email);
  if (existingUser) {
    throw new AppError('USER_EXISTS', 'Username or email already exists', 409);
  }

  const passwordHash = await bcrypt.hash(password, 12);

  const result = await (await database.prepare(`
    INSERT INTO users (username, email, password_hash, role, first_name, last_name, phone)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `)).run(username, email, passwordHash, role || 'user', firstName, lastName, phone || null);

  const userId = result.lastInsertRowid as number;

  const checkingNumber = String(userId).padStart(10, '0');
  const savingsNumber = String(userId + 100000).padStart(10, '0');

  await (await database.prepare(`
    INSERT INTO accounts (user_id, account_type, account_number, routing_number, balance, available_balance, nickname)
    VALUES (?, 'checking', ?, '021000021', 0, 0, 'Checking'),
           (?, 'savings', ?, '021000021', 0, 0, 'Savings')
  `)).run(userId, checkingNumber, userId, savingsNumber);
  saveDatabase();

  const user = await (await database.prepare(`
    SELECT id, username, email, role, first_name, last_name, phone, otp_enabled, is_active, transactions_blocked, created_at, updated_at, last_login
    FROM users WHERE id = ?
  `)).get(userId) as User;

  const response: ApiResponse<User> = {
    success: true,
    data: user,
  };
  res.status(201).json(response);
});

export const updateUser = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
  const { id } = req.params;
  const { email, firstName, lastName, phone, role, isActive, transactionsBlocked } = req.body as AdminUpdateUserRequest;

  const user = await (await database.prepare('SELECT * FROM users WHERE id = ?')).get(id);
  if (!user) {
    throw new AppError('USER_NOT_FOUND', 'User not found', 404);
  }

  if (email) {
    const existingEmail = await (await database.prepare('SELECT id FROM users WHERE email = ? AND id != ?')).get(email, id);
    if (existingEmail) {
      throw new AppError('EMAIL_EXISTS', 'Email already in use', 409);
    }
  }

  const updates: string[] = [];
  const params: (string | number | boolean)[] = [];

  if (email !== undefined) { updates.push('email = ?'); params.push(email); }
  if (firstName !== undefined) { updates.push('first_name = ?'); params.push(firstName); }
  if (lastName !== undefined) { updates.push('last_name = ?'); params.push(lastName); }
  if (phone !== undefined) { updates.push('phone = ?'); params.push(phone); }
  if (role !== undefined) { updates.push('role = ?'); params.push(role); }
  if (isActive !== undefined) { updates.push('is_active = ?'); params.push(isActive ? 1 : 0); }
  if (transactionsBlocked !== undefined) { updates.push('transactions_blocked = ?'); params.push(transactionsBlocked ? 1 : 0); }

  if (updates.length > 0) {
    updates.push('updated_at = CURRENT_TIMESTAMP');
    params.push(id);
    await (await database.prepare(`UPDATE users SET ${updates.join(', ')} WHERE id = ?`)).run(...params);
    saveDatabase();
  }

  const updatedUser = await (await database.prepare(`
    SELECT id, username, email, role, first_name, last_name, phone, otp_enabled, is_active, transactions_blocked, created_at, updated_at, last_login
    FROM users WHERE id = ?
  `)).get(id) as User;

  const response: ApiResponse<User> = {
    success: true,
    data: updatedUser,
  };
  res.json(response);
});

export const updateUserTwoFactor = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const { enabled, secret } = req.body as { enabled: boolean; secret?: string };
  const user = await (await database.prepare('SELECT id, otp_secret FROM users WHERE id = ?')).get(id) as
    | { id: number; otp_secret: string | null }
    | undefined;

  if (!user) {
    throw new AppError('USER_NOT_FOUND', 'User not found', 404);
  }

  const nextSecret = secret ?? (enabled ? user.otp_secret : null);
  if (enabled && !nextSecret) {
    throw new AppError('2FA_SECRET_REQUIRED', 'Provide an authenticator secret before enabling two-factor authentication', 400);
  }

  await (await database.prepare(`
    UPDATE users
    SET otp_enabled = ?, otp_secret = ?, updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `)).run(enabled ? 1 : 0, nextSecret, id);
  saveDatabase();

  const response: ApiResponse<{ otpEnabled: boolean }> = {
    success: true,
    data: { otpEnabled: enabled },
  };
  res.json(response);
});

export const deleteUser = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
  const { id } = req.params;

  const user = await (await database.prepare('SELECT * FROM users WHERE id = ?')).get(id);
  if (!user) {
    throw new AppError('USER_NOT_FOUND', 'User not found', 404);
  }

  if ((user as User).role === 'admin') {
    const adminCount = await (await database.prepare('SELECT COUNT(*) as count FROM users WHERE role = "admin"')).get() as { count: number };
    if (adminCount.count <= 1) {
      throw new AppError('CANNOT_DELETE_LAST_ADMIN', 'Cannot delete the last admin user', 400);
    }
  }

  await (await database.prepare('DELETE FROM users WHERE id = ?')).run(id);
  saveDatabase();

  const response: ApiResponse<{ message: string }> = {
    success: true,
    data: { message: 'User deleted successfully' },
  };
  res.json(response);
});

export const updateUserBalance = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
  const { accountId, balance, availableBalance } = req.body as AdminUpdateBalanceRequest;

  const account = await (await database.prepare('SELECT * FROM accounts WHERE id = ?')).get(accountId) as Account | undefined;
  if (!account) {
    throw new AppError('ACCOUNT_NOT_FOUND', 'Account not found', 404);
  }

  const newBalance = balance;
  const newAvailableBalance = availableBalance !== undefined ? availableBalance : balance;

  await (await database.prepare('UPDATE accounts SET balance = ?, available_balance = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?'))
    .run(newBalance, newAvailableBalance, accountId);
  saveDatabase();

  const updatedAccount = await (await database.prepare('SELECT * FROM accounts WHERE id = ?')).get(accountId) as Account;

  const response: ApiResponse<Account> = {
    success: true,
    data: updatedAccount,
  };
  res.json(response);
});

export const createTransaction = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
  const { accountId, type, category, description, amount, status, counterpartyAccountId, metadata } = req.body as AdminCreateTransactionRequest;

  const account = await (await database.prepare('SELECT * FROM accounts WHERE id = ?')).get(accountId) as Account | undefined;
  if (!account) {
    throw new AppError('ACCOUNT_NOT_FOUND', 'Account not found', 404);
  }

  const newBalance = account.balance + amount;
  const newAvailableBalance = account.available_balance + amount;

  const referenceNumber = generateReferenceNumber();
  const transactionStatus = status || 'completed';

  await database.transaction(async () => {
    if (transactionStatus === 'completed') {
      await (await database.prepare('UPDATE accounts SET balance = ?, available_balance = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?'))
        .run(newBalance, newAvailableBalance, accountId);
    }

    await (await database.prepare(`
      INSERT INTO transactions (account_id, type, category, description, amount, balance_after, status, reference_number, counterparty_account_id, metadata)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `)).run(
      accountId,
      type,
      category || null,
      description,
      amount,
      transactionStatus === 'completed' ? newBalance : account.balance,
      transactionStatus,
      referenceNumber,
      counterpartyAccountId || null,
      JSON.stringify(metadata || {})
    );
  });
  saveDatabase();

  const newTransaction = await (await database.prepare(`
    SELECT t.*, a.account_type, a.nickname as account_nickname
    FROM transactions t
    JOIN accounts a ON t.account_id = a.id
    WHERE t.reference_number = ?
  `)).get(referenceNumber) as Transaction & { account_type: string; account_nickname: string | null };

  const response: ApiResponse<typeof newTransaction> = {
    success: true,
    data: newTransaction,
  };
  res.status(201).json(response);
});

export const getAllTransactions = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = Math.min(parseInt(req.query.limit as string) || 20, 100);
  const userId = req.query.userId as string;
  const accountId = req.query.accountId as string;
  const type = req.query.type as string;
  const status = req.query.status as string;
  const offset = (page - 1) * limit;

  let whereClause = 'WHERE 1=1';
  const params: (string | number)[] = [];

  if (userId) {
    whereClause += ' AND a.user_id = ?';
    params.push(userId);
  }

  if (accountId) {
    whereClause += ' AND t.account_id = ?';
    params.push(accountId);
  }

  if (type) {
    whereClause += ' AND t.type = ?';
    params.push(type);
  }

  if (status) {
    whereClause += ' AND t.status = ?';
    params.push(status);
  }

  const countStmt = await database.prepare(`
    SELECT COUNT(*) as total FROM transactions t
    JOIN accounts a ON t.account_id = a.id
    ${whereClause}
  `);
  const total = (await countStmt.get(...params) as { total: number }).total;

  const transactionsStmt = await database.prepare(`
    SELECT t.*, a.account_type, a.nickname as account_nickname, u.username, u.first_name, u.last_name
    FROM transactions t
    JOIN accounts a ON t.account_id = a.id
    JOIN users u ON a.user_id = u.id
    ${whereClause}
    ORDER BY t.created_at DESC
    LIMIT ? OFFSET ?
  `);
  const transactions = await transactionsStmt.all(...params, limit, offset) as (Transaction & { account_type: string; account_nickname: string | null; username: string; first_name: string; last_name: string })[];

  const response: ApiResponse<PaginatedResponse<typeof transactions[0]>> = {
    success: true,
    data: {
      data: transactions,
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    },
  };
  res.json(response);
});

export const updateTransaction = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
  const { id } = req.params;
  const { type, category, description, amount, status, counterpartyAccountId, metadata } = req.body;

  const transaction = await (await database.prepare('SELECT * FROM transactions WHERE id = ?')).get(id) as Transaction | undefined;
  if (!transaction) {
    throw new AppError('TRANSACTION_NOT_FOUND', 'Transaction not found', 404);
  }

  const updates: string[] = [];
  const params: (string | number | null)[] = [];

  if (type !== undefined) { updates.push('type = ?'); params.push(type); }
  if (category !== undefined) { updates.push('category = ?'); params.push(category); }
  if (description !== undefined) { updates.push('description = ?'); params.push(description); }
  if (amount !== undefined) { updates.push('amount = ?'); params.push(amount); }
  if (status !== undefined) { updates.push('status = ?'); params.push(status); }
  if (counterpartyAccountId !== undefined) { updates.push('counterparty_account_id = ?'); params.push(counterpartyAccountId); }
  if (metadata !== undefined) { updates.push('metadata = ?'); params.push(JSON.stringify(metadata)); }

  if (updates.length > 0) {
    params.push(id);
    await (await database.prepare(`UPDATE transactions SET ${updates.join(', ')} WHERE id = ?`)).run(...params);
    saveDatabase();
  }

  const updatedTransaction = await (await database.prepare(`
    SELECT t.*, a.account_type, a.nickname as account_nickname
    FROM transactions t
    JOIN accounts a ON t.account_id = a.id
    WHERE t.id = ?
  `)).get(id) as Transaction & { account_type: string; account_nickname: string | null };

  const response: ApiResponse<typeof updatedTransaction> = {
    success: true,
    data: updatedTransaction,
  };
  res.json(response);
});

export const deleteTransaction = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
  const { id } = req.params;

  const transaction = await (await database.prepare('SELECT * FROM transactions WHERE id = ?')).get(id) as Transaction | undefined;
  if (!transaction) {
    throw new AppError('TRANSACTION_NOT_FOUND', 'Transaction not found', 404);
  }

  await (await database.prepare('DELETE FROM transactions WHERE id = ?')).run(id);
  saveDatabase();

  const response: ApiResponse<{ message: string }> = {
    success: true,
    data: { message: 'Transaction deleted successfully' },
  };
  res.json(response);
});