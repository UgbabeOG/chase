import { Response } from 'express';
import { database } from '../db/index.js';
import { Account, AuthRequest, Transaction, TransactionWithAccount, ApiResponse, PaginatedResponse, TransferRequest, TransferResponse } from '../types/index.js';
import { AppError, asyncHandler } from '../middleware/index.js';

function generateReferenceNumber(): string {
  return 'REF' + Date.now().toString(36).toUpperCase() + Math.random().toString(36).substring(2, 8).toUpperCase();
}

export const getTransactions = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
  if (!req.user) {
    throw new AppError('UNAUTHORIZED', 'Not authenticated', 401);
  }

  const page = parseInt(req.query.page as string) || 1;
  const limit = Math.min(parseInt(req.query.limit as string) || 20, 100);
  const accountId = req.query.accountId as string;
  const type = req.query.type as string;
  const startDate = req.query.startDate as string;
  const endDate = req.query.endDate as string;
  const offset = (page - 1) * limit;

  let whereClause = 'WHERE t.account_id IN (SELECT id FROM accounts WHERE user_id = ? AND is_active = 1)';
  const params: (string | number)[] = [req.user.userId];

  if (accountId) {
    whereClause += ' AND t.account_id = ?';
    params.push(accountId);
  }

  if (type) {
    whereClause += ' AND t.type = ?';
    params.push(type);
  }

  if (startDate) {
    whereClause += ' AND t.created_at >= ?';
    params.push(startDate);
  }

  if (endDate) {
    whereClause += ' AND t.created_at <= ?';
    params.push(endDate);
  }

  const countStmt = await database.prepare(`SELECT COUNT(*) as total FROM transactions t ${whereClause}`);
  const total = (await countStmt.get(...params) as { total: number }).total;

  const transactionsStmt = await database.prepare(`
    SELECT t.*, a.account_type, a.nickname as account_nickname
    FROM transactions t
    JOIN accounts a ON t.account_id = a.id
    ${whereClause}
    ORDER BY t.created_at DESC
    LIMIT ? OFFSET ?
  `);
  const transactions = await transactionsStmt.all(...params, limit, offset) as TransactionWithAccount[];

  const response: ApiResponse<PaginatedResponse<TransactionWithAccount>> = {
    success: true,
    data: {
      data: transactions,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    },
  };
  res.json(response);
});

export const getTransaction = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
  if (!req.user) {
    throw new AppError('UNAUTHORIZED', 'Not authenticated', 401);
  }

  const { id } = req.params;

  const transaction = await (await database.prepare(`
    SELECT t.*, a.account_type, a.nickname as account_nickname
    FROM transactions t
    JOIN accounts a ON t.account_id = a.id
    WHERE t.id = ? AND a.user_id = ?
  `)).get(id, req.user.userId) as TransactionWithAccount | undefined;

  if (!transaction) {
    throw new AppError('TRANSACTION_NOT_FOUND', 'Transaction not found', 404);
  }

  const response: ApiResponse<TransactionWithAccount> = {
    success: true,
    data: transaction,
  };
  res.json(response);
});

export const transfer = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
  if (!req.user) {
    throw new AppError('UNAUTHORIZED', 'Not authenticated', 401);
  }

  const { fromAccountId, toAccountNumber, amount, description } = req.body as TransferRequest;

  const user = await (await database.prepare(
    'SELECT transactions_blocked FROM users WHERE id = ?'
  )).get(req.user.userId) as { transactions_blocked: number } | undefined;

  if (user?.transactions_blocked) {
    const setting = await (await database.prepare(
      'SELECT setting_value FROM app_settings WHERE setting_key = ?'
    )).get('transaction_block_message') as { setting_value: string } | undefined;
    throw new AppError(
      'TRANSACTIONS_BLOCKED',
      setting?.setting_value ?? 'Transactions are currently disabled for your account. Please contact support.',
      403,
    );
  }

  if (amount <= 0) {
    throw new AppError('INVALID_AMOUNT', 'Transfer amount must be positive', 400);
  }

  if (amount > 10000) {
    throw new AppError('AMOUNT_EXCEEDED', 'Transfer amount exceeds daily limit of $10,000', 400);
  }

  const fromAccount = await (await database.prepare('SELECT * FROM accounts WHERE id = ? AND user_id = ? AND is_active = 1')).get(fromAccountId, req.user.userId) as
    | (Account & { balance: number; available_balance: number })
    | undefined;

  if (!fromAccount) {
    throw new AppError('FROM_ACCOUNT_NOT_FOUND', 'Source account not found', 404);
  }

  if (fromAccount.available_balance < amount) {
    throw new AppError('INSUFFICIENT_FUNDS', 'Insufficient available balance', 400);
  }

  const toAccount = await (await database.prepare('SELECT * FROM accounts WHERE account_number = ? AND is_active = 1')).get(toAccountNumber) as
    | (Account & { balance: number; available_balance: number })
    | undefined;

  if (!toAccount) {
    throw new AppError('TO_ACCOUNT_NOT_FOUND', 'Destination account not found', 404);
  }

  if (toAccount.id === fromAccount.id) {
    throw new AppError('SAME_ACCOUNT', 'Cannot transfer to the same account', 400);
  }

  const referenceNumber = generateReferenceNumber();
  const timestamp = new Date().toISOString();

  const newFromBalance = fromAccount.balance - amount;
  const newFromAvailable = fromAccount.available_balance - amount;
  const newToBalance = toAccount.balance + amount;
  const newToAvailable = toAccount.available_balance + amount;

  await database.transaction(async (transaction) => {
    await (await transaction.prepare('UPDATE accounts SET balance = ?, available_balance = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?'))
      .run(newFromBalance, newFromAvailable, fromAccount.id);

    await (await transaction.prepare('UPDATE accounts SET balance = ?, available_balance = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?'))
      .run(newToBalance, newToAvailable, toAccount.id);

    await (await transaction.prepare(`
      INSERT INTO transactions (account_id, type, category, description, amount, balance_after, status, reference_number, counterparty_account_id, metadata)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `)).run(
      fromAccount.id,
      'transfer_out',
      'Transfer',
      description || `Transfer to ${toAccount.nickname || 'Account'} ****${toAccount.account_number.slice(-4)}`,
      -amount,
      newFromBalance,
      'completed',
      referenceNumber,
      toAccount.id,
      JSON.stringify({ toAccountId: toAccount.id, toAccountNumber: toAccount.account_number })
    );

    await (await transaction.prepare(`
      INSERT INTO transactions (account_id, type, category, description, amount, balance_after, status, reference_number, counterparty_account_id, metadata)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `)).run(
      toAccount.id,
      'transfer_in',
      'Transfer',
      description || `Transfer from ${fromAccount.nickname || 'Account'} ****${fromAccount.account_number.slice(-4)}`,
      amount,
      newToBalance,
      'completed',
      referenceNumber,
      fromAccount.id,
      JSON.stringify({ fromAccountId: fromAccount.id, fromAccountNumber: fromAccount.account_number })
    );
  });
  const outTransaction = await (await database.prepare(`
    SELECT t.*, a.account_type, a.nickname as account_nickname
    FROM transactions t
    JOIN accounts a ON t.account_id = a.id
    WHERE t.reference_number = ? AND t.account_id = ?
    ORDER BY t.created_at DESC
    LIMIT 1
  `)).get(referenceNumber, fromAccount.id) as TransactionWithAccount;

  const response: ApiResponse<TransferResponse> = {
    success: true,
    data: {
      transaction: outTransaction!,
      fromAccount: { ...fromAccount, balance: newFromBalance, available_balance: newFromAvailable },
      toAccount: { ...toAccount, balance: newToBalance, available_balance: newToAvailable },
    },
  };
  res.json(response);
});