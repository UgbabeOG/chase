export const TRANSACTION_CATEGORIES = [
    'Payroll',
    'Shopping',
    'Food & Dining',
    'Transportation',
    'Bills & Utilities',
    'Healthcare',
    'Entertainment',
    'Travel',
    'Education',
    'Personal Care',
    'Gifts & Donations',
    'Investments',
    'Transfer',
    'Interest',
    'Refund',
    'Fees',
    'Other',
];
export const TRANSACTION_TYPES = [
    { value: 'credit', label: 'Deposit' },
    { value: 'debit', label: 'Withdrawal' },
    { value: 'transfer_in', label: 'Transfer In' },
    { value: 'transfer_out', label: 'Transfer Out' },
];
export const TRANSACTION_STATUSES = [
    { value: 'pending', label: 'Pending' },
    { value: 'completed', label: 'Completed' },
    { value: 'failed', label: 'Failed' },
    { value: 'cancelled', label: 'Cancelled' },
];
export const ACCOUNT_TYPES = [
    { value: 'checking', label: 'Checking' },
    { value: 'savings', label: 'Savings' },
];
export const USER_ROLES = [
    { value: 'user', label: 'User' },
    { value: 'admin', label: 'Admin' },
];
export const PAGINATION_LIMITS = [10, 20, 50, 100];
export const DAILY_TRANSFER_LIMIT = 10000;
export const APP_NAME = 'Chase Bank';
export const ROUTES = {
    LOGIN: '/login',
    TWO_FACTOR: '/2fa',
    SETUP_2FA: '/setup-2fa',
    DASHBOARD: '/dashboard',
    ACCOUNTS: '/accounts',
    TRANSACTIONS: '/transactions',
    TRANSFER: '/transfer',
    ADMIN: '/admin',
    ADMIN_USERS: '/admin/users',
    ADMIN_TRANSACTIONS: '/admin/transactions',
};
