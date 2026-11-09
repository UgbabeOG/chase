import { Response } from 'express';
import { database } from '../db/index.js';
import { AuthRequest, Account, ApiResponse, PaginatedResponse } from '../types/index.js';
import { AppError, asyncHandler } from '../middleware/index.js';

export const getAccounts = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
  if (!req.user) {
    throw new AppError('UNAUTHORIZED', 'Not authenticated', 401);
  }

  const accounts = await (await database.prepare('SELECT * FROM accounts WHERE user_id = ? AND is_active = 1 ORDER BY account_type, created_at')).all(req.user.userId) as Account[];

  const response: ApiResponse<Account[]> = {
    success: true,
    data: accounts,
  };
  res.json(response);
});

export const getAccount = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
  if (!req.user) {
    throw new AppError('UNAUTHORIZED', 'Not authenticated', 401);
  }

  const { id } = req.params;

  const account = await (await database.prepare('SELECT * FROM accounts WHERE id = ? AND user_id = ? AND is_active = 1')).get(id, req.user.userId) as Account | undefined;

  if (!account) {
    throw new AppError('ACCOUNT_NOT_FOUND', 'Account not found', 404);
  }

  const response: ApiResponse<Account> = {
    success: true,
    data: account,
  };
  res.json(response);
});

export const getAccountBalance = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
  if (!req.user) {
    throw new AppError('UNAUTHORIZED', 'Not authenticated', 401);
  }

  const { id } = req.params;

  const account = await (await database.prepare('SELECT id, balance, available_balance, account_type, account_number FROM accounts WHERE id = ? AND user_id = ? AND is_active = 1')).get(id, req.user.userId) as
    | Pick<Account, 'id' | 'balance' | 'available_balance' | 'account_type' | 'account_number'>
    | undefined;

  if (!account) {
    throw new AppError('ACCOUNT_NOT_FOUND', 'Account not found', 404);
  }

  const response: ApiResponse<typeof account> = {
    success: true,
    data: account,
  };
  res.json(response);
});