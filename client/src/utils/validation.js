import { z } from 'zod';
export const loginSchema = z.object({
    username: z.string().min(1, 'Username is required'),
    password: z.string().min(1, 'Password is required'),
    otp: z.string().length(6, 'Code must be 6 digits').optional(),
});
export const transferSchema = z.object({
    fromAccountId: z.number().int().positive('Please select an account'),
    toAccountNumber: z.string().length(10, 'Account number must be 10 digits'),
    amount: z.number().positive('Amount must be positive').max(10000, 'Maximum transfer amount is $10,000'),
    description: z.string().max(255).optional(),
});
export const createUserSchema = z.object({
    username: z.string().min(3, 'Username must be at least 3 characters').max(50),
    email: z.string().email('Invalid email address'),
    password: z.string().min(8, 'Password must be at least 8 characters').max(100),
    firstName: z.string().min(1, 'First name is required').max(50),
    lastName: z.string().min(1, 'Last name is required').max(50),
    phone: z.string().max(20).optional(),
    role: z.enum(['user', 'admin']).optional(),
});
export const updateUserSchema = z.object({
    email: z.string().email('Invalid email address').optional(),
    firstName: z.string().min(1).max(50).optional(),
    lastName: z.string().min(1).max(50).optional(),
    phone: z.string().max(20).optional(),
    role: z.enum(['user', 'admin']).optional(),
    isActive: z.boolean().optional(),
});
export const updateBalanceSchema = z.object({
    accountId: z.number().int().positive(),
    balance: z.number(),
    availableBalance: z.number().optional(),
});
export const createTransactionSchema = z.object({
    accountId: z.number().int().positive(),
    type: z.enum(['debit', 'credit', 'transfer_in', 'transfer_out']),
    category: z.string().max(50).optional(),
    description: z.string().min(1, 'Description is required').max(255),
    amount: z.number(),
    status: z.enum(['pending', 'completed', 'failed', 'cancelled']).optional(),
    counterpartyAccountId: z.number().int().positive().optional(),
    metadata: z.record(z.unknown()).optional(),
});
export const setup2FASchema = z.object({});
export const verify2FASchema = z.object({
    token: z.string().length(6, 'Code must be 6 digits'),
});
export const disable2FASchema = z.object({
    password: z.string().min(1, 'Password is required'),
});
