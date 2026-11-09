import { Router } from 'express';
import { z } from 'zod';
import * as authController from '../controllers/authController.js';
import * as accountsController from '../controllers/accountsController.js';
import * as transactionsController from '../controllers/transactionsController.js';
import * as adminController from '../controllers/adminController.js';
import { authenticateToken, requireAdmin, validateBody, validateQuery, validateParams, asyncHandler } from '../middleware/index.js';
import { AuthRequest, Response } from '../types/index.js';

const router = Router();

const loginSchema = z.object({
  username: z.string().min(1),
  password: z.string().min(1),
  otp: z.string().optional(),
});

const refreshSchema = z.object({
  refreshToken: z.string().min(1),
});

const setup2FASchema = z.object({});

const verify2FASchema = z.object({
  token: z.string().length(6),
});

const disable2FASchema = z.object({
  password: z.string().min(1),
});

// Auth routes
const authRouter = Router();

authRouter.post('/login', validateBody(loginSchema), asyncHandler(authController.login));
authRouter.post('/login/2fa', validateBody(loginSchema), asyncHandler(authController.login2FA));
authRouter.post('/logout', authenticateToken, asyncHandler(authController.logout));
authRouter.post('/refresh', validateBody(refreshSchema), asyncHandler(authController.refresh));
authRouter.get('/me', authenticateToken, asyncHandler(authController.getMe));
authRouter.post('/setup-2fa', authenticateToken, validateBody(setup2FASchema), asyncHandler(authController.setup2FA));
authRouter.post('/verify-2fa', authenticateToken, validateBody(verify2FASchema), asyncHandler(authController.verify2FA));
authRouter.post('/disable-2fa', authenticateToken, validateBody(disable2FASchema), asyncHandler(authController.disable2FA));

router.use('/auth', authRouter);

const accountsRouter = Router();
accountsRouter.use(authenticateToken);

accountsRouter.get('/', asyncHandler(accountsController.getAccounts));
accountsRouter.get('/:id', validateParams(z.object({ id: z.string().uuid().or(z.coerce.number()) })), asyncHandler(accountsController.getAccount));
accountsRouter.get('/:id/balance', validateParams(z.object({ id: z.string().uuid().or(z.coerce.number()) })), asyncHandler(accountsController.getAccountBalance));

router.use('/accounts', accountsRouter);

const transactionsRouter = Router();
transactionsRouter.use(authenticateToken);

const transactionQuerySchema = z.object({
  page: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().positive().max(100).optional(),
  accountId: z.coerce.number().int().positive().optional(),
  type: z.enum(['debit', 'credit', 'transfer_in', 'transfer_out']).optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
});

transactionsRouter.get('/', validateQuery(transactionQuerySchema), asyncHandler(transactionsController.getTransactions));
transactionsRouter.get('/:id', validateParams(z.object({ id: z.string().uuid().or(z.coerce.number()) })), asyncHandler(transactionsController.getTransaction));

const transferSchema = z.object({
  fromAccountId: z.number().int().positive(),
  toAccountNumber: z.string().length(10),
  amount: z.number().positive().max(10000),
  description: z.string().max(255).optional(),
});

transactionsRouter.post('/transfer', validateBody(transferSchema), asyncHandler(transactionsController.transfer));

router.use('/transactions', transactionsRouter);

const adminRouter = Router();
adminRouter.use(authenticateToken, requireAdmin);

const adminUserQuerySchema = z.object({
  page: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().positive().max(100).optional(),
  search: z.string().optional(),
  role: z.enum(['user', 'admin']).optional(),
});

adminRouter.get('/users', validateQuery(adminUserQuerySchema), asyncHandler(adminController.getUsers));
adminRouter.get('/users/:id', validateParams(z.object({ id: z.string().uuid().or(z.coerce.number()) })), asyncHandler(adminController.getUser));

const adminCreateUserSchema = z.object({
  username: z.string().min(3).max(50),
  email: z.string().email(),
  password: z.string().min(8).max(100),
  firstName: z.string().min(1).max(50),
  lastName: z.string().min(1).max(50),
  phone: z.string().max(20).optional(),
  role: z.enum(['user', 'admin']).optional(),
});

adminRouter.post('/users', validateBody(adminCreateUserSchema), asyncHandler(adminController.createUser));

const adminUpdateUserSchema = z.object({
  email: z.string().email().optional(),
  firstName: z.string().min(1).max(50).optional(),
  lastName: z.string().min(1).max(50).optional(),
  phone: z.string().max(20).optional(),
  role: z.enum(['user', 'admin']).optional(),
  isActive: z.boolean().optional(),
});

adminRouter.put('/users/:id', validateParams(z.object({ id: z.string().uuid().or(z.coerce.number()) })), validateBody(adminUpdateUserSchema), asyncHandler(adminController.updateUser));
adminRouter.delete('/users/:id', validateParams(z.object({ id: z.string().uuid().or(z.coerce.number()) })), asyncHandler(adminController.deleteUser));

const adminUpdateBalanceSchema = z.object({
  accountId: z.number().int().positive(),
  balance: z.number(),
  availableBalance: z.number().optional(),
});

adminRouter.put('/users/:id/balance', validateParams(z.object({ id: z.string().uuid().or(z.coerce.number()) })), validateBody(adminUpdateBalanceSchema), asyncHandler(adminController.updateUserBalance));

const adminTransactionQuerySchema = z.object({
  page: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().positive().max(100).optional(),
  userId: z.coerce.number().int().positive().optional(),
  accountId: z.coerce.number().int().positive().optional(),
  type: z.enum(['debit', 'credit', 'transfer_in', 'transfer_out']).optional(),
  status: z.enum(['pending', 'completed', 'failed', 'cancelled']).optional(),
});

adminRouter.get('/transactions', validateQuery(adminTransactionQuerySchema), asyncHandler(adminController.getAllTransactions));

const adminCreateTransactionSchema = z.object({
  accountId: z.number().int().positive(),
  type: z.enum(['debit', 'credit', 'transfer_in', 'transfer_out']),
  category: z.string().max(50).optional(),
  description: z.string().min(1).max(255),
  amount: z.number(),
  status: z.enum(['pending', 'completed', 'failed', 'cancelled']).optional(),
  counterpartyAccountId: z.number().int().positive().optional(),
  metadata: z.record(z.unknown()).optional(),
});

adminRouter.post('/users/:id/transactions', validateParams(z.object({ id: z.string().uuid().or(z.coerce.number()) })), validateBody(adminCreateTransactionSchema), asyncHandler(adminController.createTransaction));
adminRouter.put('/transactions/:id', validateParams(z.object({ id: z.string().uuid().or(z.coerce.number()) })), validateBody(z.object({}).passthrough()), asyncHandler(adminController.updateTransaction));
adminRouter.delete('/transactions/:id', validateParams(z.object({ id: z.string().uuid().or(z.coerce.number()) })), asyncHandler(adminController.deleteTransaction));

router.use('/admin', adminRouter);

router.get('/health', (req: AuthRequest, res: Response) => {
  res.json({ success: true, data: { status: 'ok', timestamp: new Date().toISOString() } });
});

export default router;