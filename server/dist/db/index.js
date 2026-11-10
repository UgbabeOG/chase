import { createClient } from '@libsql/client';
import { existsSync, mkdirSync } from 'fs';
import { dirname, resolve } from 'path';
import { fileURLToPath } from 'url';
import bcrypt from 'bcryptjs';
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const dbPath = resolve(__dirname, '../../data/chase.db');
const dataDir = resolve(__dirname, '../../data');
let initialization = null;
const schema = `
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username VARCHAR(50) UNIQUE NOT NULL,
      email VARCHAR(100) UNIQUE NOT NULL,
      password_hash VARCHAR(255) NOT NULL,
      otp_secret VARCHAR(32),
      otp_enabled BOOLEAN DEFAULT FALSE,
      role VARCHAR(20) DEFAULT 'user' CHECK (role IN ('user', 'admin')),
      first_name VARCHAR(50) NOT NULL,
      last_name VARCHAR(50) NOT NULL,
      phone VARCHAR(20),
      transactions_blocked BOOLEAN NOT NULL DEFAULT FALSE,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      last_login DATETIME,
      is_active BOOLEAN DEFAULT TRUE
    );

    CREATE TABLE IF NOT EXISTS accounts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      account_type VARCHAR(20) NOT NULL CHECK (account_type IN ('checking', 'savings')),
      account_number VARCHAR(20) UNIQUE NOT NULL,
      routing_number VARCHAR(9) NOT NULL,
      balance DECIMAL(12, 2) DEFAULT 0.00,
      available_balance DECIMAL(12, 2) DEFAULT 0.00,
      nickname VARCHAR(50),
      is_active BOOLEAN DEFAULT TRUE,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS transactions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      account_id INTEGER NOT NULL,
      type VARCHAR(20) NOT NULL CHECK (type IN ('debit', 'credit', 'transfer_in', 'transfer_out')),
      category VARCHAR(50),
      description VARCHAR(255) NOT NULL,
      amount DECIMAL(12, 2) NOT NULL,
      balance_after DECIMAL(12, 2) NOT NULL,
      status VARCHAR(20) DEFAULT 'completed' CHECK (status IN ('pending', 'completed', 'failed', 'cancelled')),
      reference_number VARCHAR(30) NOT NULL,
      counterparty_account_id INTEGER,
      metadata JSON,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (account_id) REFERENCES accounts(id) ON DELETE CASCADE,
      FOREIGN KEY (counterparty_account_id) REFERENCES accounts(id) ON DELETE SET NULL
    );

    CREATE TABLE IF NOT EXISTS sessions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      token_hash VARCHAR(255) NOT NULL,
      ip_address VARCHAR(45),
      user_agent TEXT,
      expires_at DATETIME NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS app_settings (
      setting_key VARCHAR(100) PRIMARY KEY,
      setting_value TEXT NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_transactions_account_id ON transactions(account_id);
    CREATE INDEX IF NOT EXISTS idx_transactions_created_at ON transactions(created_at DESC);
    CREATE INDEX IF NOT EXISTS idx_accounts_user_id ON accounts(user_id);
    CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id);
    CREATE INDEX IF NOT EXISTS idx_sessions_token_hash ON sessions(token_hash);
  `;
export async function initializeDatabase() {
    if (!initialization) {
        initialization = initializeClient().catch((error) => {
            initialization = null;
            throw error;
        });
    }
    return initialization;
}
async function initializeClient() {
    const url = process.env.TURSO_DATABASE_URL;
    const authToken = process.env.TURSO_AUTH_TOKEN;
    if (process.env.VERCEL && !url) {
        throw new Error('TURSO_DATABASE_URL must be configured for Vercel deployments.');
    }
    if (url?.startsWith('libsql://') && !authToken) {
        throw new Error('TURSO_AUTH_TOKEN must be configured for a remote Turso database.');
    }
    if (!url && !existsSync(dataDir)) {
        mkdirSync(dataDir, { recursive: true });
    }
    const client = createClient({
        url: url || `file:${dbPath}`,
        ...(authToken ? { authToken } : {}),
        intMode: 'number',
    });
    try {
        await client.executeMultiple(schema);
        const userColumns = await client.execute('PRAGMA table_info(users)');
        if (!userColumns.rows.some((column) => column.name === 'transactions_blocked')) {
            await client.execute('ALTER TABLE users ADD COLUMN transactions_blocked BOOLEAN NOT NULL DEFAULT FALSE');
        }
        await client.execute(`
      INSERT OR IGNORE INTO app_settings (setting_key, setting_value)
      VALUES ('transaction_block_message', 'Transactions are currently disabled for your account. Please contact support.')
    `);
        return client;
    }
    catch (error) {
        client.close();
        throw error;
    }
}
async function seedDatabase() {
    console.log('Seeding database...');
    const userCount = await (await database.prepare('SELECT COUNT(*) as count FROM users')).get();
    if (userCount.count > 0) {
        console.log('Database already seeded, skipping...');
        return;
    }
    const passwordHash = bcrypt.hashSync('password123', 12);
    const adminPasswordHash = bcrypt.hashSync('admin123', 12);
    const insertUser = `
    INSERT INTO users (username, email, password_hash, role, first_name, last_name, phone, otp_enabled)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `;
    const insertAccount = `
    INSERT INTO accounts (user_id, account_type, account_number, routing_number, balance, available_balance, nickname)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `;
    const insertTransaction = `
    INSERT INTO transactions (account_id, type, category, description, amount, balance_after, status, reference_number, counterparty_account_id, metadata)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;
    // Create admin user
    const adminResult = await (await database.prepare(insertUser)).run('admin', 'admin@chase.com', adminPasswordHash, 'admin', 'Admin', 'User', '555-0100', 0);
    const adminId = adminResult.lastInsertRowid;
    // Create demo user
    const userResult = await (await database.prepare(insertUser)).run('johndoe', 'john.doe@email.com', passwordHash, 'user', 'John', 'Doe', '555-0199', 0);
    const userId = userResult.lastInsertRowid;
    // Create accounts for admin
    const adminCheckingResult = await (await database.prepare(insertAccount)).run(adminId, 'checking', '0000000001', '021000021', 50000.00, 50000.00, 'Admin Checking');
    const adminCheckingId = adminCheckingResult.lastInsertRowid;
    const adminSavingsResult = await (await database.prepare(insertAccount)).run(adminId, 'savings', '0000000002', '021000021', 100000.00, 100000.00, 'Admin Savings');
    const adminSavingsId = adminSavingsResult.lastInsertRowid;
    // Create accounts for demo user
    const checkingResult = await (await database.prepare(insertAccount)).run(userId, 'checking', '1234567890', '021000021', 5432.18, 5432.18, 'Primary Checking');
    const checkingId = checkingResult.lastInsertRowid;
    const savingsResult = await (await database.prepare(insertAccount)).run(userId, 'savings', '0987654321', '021000021', 12345.67, 12345.67, 'Emergency Savings');
    const savingsId = savingsResult.lastInsertRowid;
    // Generate reference number
    const generateRef = () => 'REF' + Date.now().toString(36).toUpperCase() + Math.random().toString(36).substring(2, 8).toUpperCase();
    // Seed transactions for demo user checking account
    const transactions = [
        { accountId: checkingId, type: 'credit', category: 'Payroll', description: 'DIRECT DEPOSIT - ACME CORP', amount: 3500.00, balanceAfter: 5432.18, status: 'completed', ref: generateRef() },
        { accountId: checkingId, type: 'debit', category: 'Shopping', description: 'AMAZON.COM *AMZN.COM/BILL', amount: -89.99, balanceAfter: 5342.19, status: 'completed', ref: generateRef() },
        { accountId: checkingId, type: 'debit', category: 'Food & Dining', description: 'STARBUCKS STORE #12345', amount: -12.50, balanceAfter: 5329.69, status: 'completed', ref: generateRef() },
        { accountId: checkingId, type: 'debit', category: 'Transportation', description: 'UBER *TRIP', amount: -24.75, balanceAfter: 5304.94, status: 'completed', ref: generateRef() },
        { accountId: checkingId, type: 'debit', category: 'Bills & Utilities', description: 'NETFLIX.COM', amount: -15.99, balanceAfter: 5288.95, status: 'completed', ref: generateRef() },
        { accountId: checkingId, type: 'transfer_out', category: 'Transfer', description: 'Transfer to Savings ****4321', amount: -500.00, balanceAfter: 4788.95, status: 'completed', ref: generateRef(), counterpartyId: savingsId },
        { accountId: savingsId, type: 'transfer_in', category: 'Transfer', description: 'Transfer from Checking ****7890', amount: 500.00, balanceAfter: 12845.67, status: 'completed', ref: generateRef(), counterpartyId: checkingId },
        { accountId: checkingId, type: 'debit', category: 'Shopping', description: 'TARGET.COM', amount: -127.43, balanceAfter: 4661.52, status: 'completed', ref: generateRef() },
        { accountId: checkingId, type: 'credit', category: 'Refund', description: 'REFUND - BEST BUY', amount: 49.99, balanceAfter: 4711.51, status: 'completed', ref: generateRef() },
        { accountId: checkingId, type: 'debit', category: 'Food & Dining', description: 'DOORDASH *ORDER', amount: -42.30, balanceAfter: 4669.21, status: 'completed', ref: generateRef() },
        { accountId: checkingId, type: 'debit', category: 'Healthcare', description: 'CVS PHARMACY #1234', amount: -35.00, balanceAfter: 4634.21, status: 'completed', ref: generateRef() },
        { accountId: checkingId, type: 'credit', category: 'Interest', description: 'INTEREST PAYMENT', amount: 2.45, balanceAfter: 4636.66, status: 'completed', ref: generateRef() },
        { accountId: checkingId, type: 'debit', category: 'Entertainment', description: 'SPOTIFY USA', amount: -10.99, balanceAfter: 4625.67, status: 'completed', ref: generateRef() },
        { accountId: checkingId, type: 'debit', category: 'Transportation', description: 'SHELL OIL 12345678', amount: -65.00, balanceAfter: 4560.67, status: 'completed', ref: generateRef() },
        { accountId: checkingId, type: 'credit', category: 'Payroll', description: 'DIRECT DEPOSIT - ACME CORP', amount: 3500.00, balanceAfter: 8060.67, status: 'completed', ref: generateRef() },
    ];
    for (const tx of transactions) {
        await (await database.prepare(insertTransaction)).run(tx.accountId, tx.type, tx.category, tx.description, tx.amount, tx.balanceAfter, tx.status, tx.ref, tx.counterpartyId || null, '{}');
    }
    // Seed transactions for demo user savings account
    const savingsTransactions = [
        { accountId: savingsId, type: 'credit', category: 'Interest', description: 'INTEREST PAYMENT', amount: 12.34, balanceAfter: 12358.01, status: 'completed', ref: generateRef() },
        { accountId: savingsId, type: 'credit', category: 'Transfer', description: 'Transfer from Checking ****7890', amount: 500.00, balanceAfter: 12858.01, status: 'completed', ref: generateRef(), counterpartyId: checkingId },
    ];
    for (const tx of savingsTransactions) {
        await (await database.prepare(insertTransaction)).run(tx.accountId, tx.type, tx.category, tx.description, tx.amount, tx.balanceAfter, tx.status, tx.ref, tx.counterpartyId || null, '{}');
    }
    console.log('Demo data seeded successfully.');
    console.log('Admin user: admin / admin123');
    console.log('Demo user: johndoe / password123');
}
function toArgs(params) {
    const values = params.length === 1 && Array.isArray(params[0]) ? params[0] : params;
    return values.map((value) => {
        if (value === null ||
            typeof value === 'string' ||
            typeof value === 'number' ||
            typeof value === 'bigint' ||
            typeof value === 'boolean' ||
            value instanceof Date ||
            value instanceof Uint8Array) {
            return value;
        }
        throw new TypeError(`Unsupported database parameter type: ${typeof value}`);
    });
}
function rowToObject(columns, row) {
    return Object.fromEntries(columns.map((column, index) => [column, row[index]]));
}
function statementFor(execute, sql) {
    const executeWithParams = (params) => execute({ sql, args: toArgs(params) });
    return {
        get: async (...params) => {
            const result = await executeWithParams(params);
            return result.rows[0] ? rowToObject(result.columns, result.rows[0]) : undefined;
        },
        all: async (...params) => {
            const result = await executeWithParams(params);
            return result.rows.map((row) => rowToObject(result.columns, row));
        },
        run: async (...params) => {
            const result = await executeWithParams(params);
            return {
                lastInsertRowid: Number(result.lastInsertRowid ?? 0),
                changes: result.rowsAffected,
            };
        },
    };
}
async function prepareOn(execute, sql) {
    return statementFor(execute, sql);
}
const databaseSession = (execute) => ({
    prepare: async (sql) => prepareOn(execute, sql),
});
export const database = {
    prepare: async (sql) => {
        const client = await initializeDatabase();
        return prepareOn((statement) => client.execute(statement), sql);
    },
    transaction: async (fn) => {
        const client = await initializeDatabase();
        const transaction = await client.transaction('write');
        try {
            const result = await fn(databaseSession((statement) => transaction.execute(statement)));
            await transaction.commit();
            return result;
        }
        catch (error) {
            await transaction.rollback();
            throw error;
        }
        finally {
            transaction.close();
        }
    },
    exec: async (sql) => {
        const client = await initializeDatabase();
        await client.executeMultiple(sql);
    },
    close: async () => {
        if (initialization) {
            const client = await initialization;
            client.close();
            initialization = null;
        }
    },
};
export { seedDatabase };
export default database;
