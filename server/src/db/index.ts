import initSqlJs, { Database, Statement } from 'sql.js';
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import bcrypt from 'bcryptjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const dbPath = resolve(__dirname, '../../data/chase.db');
const dataDir = resolve(__dirname, '../../data');
const wasmPath = resolve(__dirname, '../../sql-wasm.wasm');

let db: Database | null = null;
let dbReady: Promise<Database> = initializeDatabase();

// Initialize database asynchronously
async function initializeDatabase(): Promise<Database> {
  if (db) return db;

  console.log('Initializing database...');
  console.log('WASM path:', wasmPath);

  // Ensure data directory exists
  if (!existsSync(dataDir)) {
    mkdirSync(dataDir, { recursive: true });
  }

  // Load SQL.js
  const SQL = await initSqlJs({
    locateFile: () => wasmPath
  });

  // Try to load existing database
  if (existsSync(dbPath)) {
    console.log('Loading existing database...');
    const fileBuffer = readFileSync(dbPath);
    db = new SQL.Database(fileBuffer);
  } else {
    console.log('Creating new database...');
    db = new SQL.Database();
  }

  // Enable foreign keys
  db.exec('PRAGMA foreign_keys = ON;');

  // Create tables
  db.exec(`
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
  `);

  const userColumns = db.exec('PRAGMA table_info(users)');
  const hasTransactionBlockColumn = userColumns[0]?.values.some((column) => column[1] === 'transactions_blocked');
  if (!hasTransactionBlockColumn) {
    db.exec('ALTER TABLE users ADD COLUMN transactions_blocked BOOLEAN NOT NULL DEFAULT FALSE');
  }

  db.exec(`
    INSERT OR IGNORE INTO app_settings (setting_key, setting_value)
    VALUES ('transaction_block_message', 'Transactions are currently disabled for your account. Please contact support.')
  `);

  console.log('Database schema created successfully.');

  // Save database to file
  saveDatabase();

  return db;
}

// Start database initialization immediately
dbReady = initializeDatabase();

function saveDatabase(): void {
  if (!db) return;
  const data = db.export();
  writeFileSync(dbPath, Buffer.from(data));
  console.log('Database saved to:', dbPath);
}

async function seedDatabase(): Promise<void> {
  await dbReady;
  console.log('Seeding database...');

  const userCount = db!.exec('SELECT COUNT(*) as count FROM users');
  if (userCount[0]?.values[0][0] > 0) {
    console.log('Database already seeded, skipping...');
    return;
  }

  const passwordHash = bcrypt.hashSync('password123', 12);
  const adminPasswordHash = bcrypt.hashSync('admin123', 12);

  const insertUser = createStatement(`
    INSERT INTO users (username, email, password_hash, role, first_name, last_name, phone, otp_enabled)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const insertAccount = createStatement(`
    INSERT INTO accounts (user_id, account_type, account_number, routing_number, balance, available_balance, nickname)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

  const insertTransaction = createStatement(`
    INSERT INTO transactions (account_id, type, category, description, amount, balance_after, status, reference_number, counterparty_account_id, metadata)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  // Create admin user
  const adminResult = await wrapStatement(insertUser).run([
    'admin',
    'admin@chase.com',
    adminPasswordHash,
    'admin',
    'Admin',
    'User',
    '555-0100',
    0
  ]);
  const adminId = adminResult.lastInsertRowid;

  // Create demo user
  const userResult = await wrapStatement(insertUser).run([
    'johndoe',
    'john.doe@email.com',
    passwordHash,
    'user',
    'John',
    'Doe',
    '555-0199',
    0
  ]);
  const userId = userResult.lastInsertRowid;

  // Create accounts for admin
  const adminCheckingResult = await wrapStatement(insertAccount).run([adminId, 'checking', '0000000001', '021000021', 50000.00, 50000.00, 'Admin Checking']);
  const adminCheckingId = adminCheckingResult.lastInsertRowid;

  const adminSavingsResult = await wrapStatement(insertAccount).run([adminId, 'savings', '0000000002', '021000021', 100000.00, 100000.00, 'Admin Savings']);
  const adminSavingsId = adminSavingsResult.lastInsertRowid;

  // Create accounts for demo user
  const checkingResult = await wrapStatement(insertAccount).run([userId, 'checking', '1234567890', '021000021', 5432.18, 5432.18, 'Primary Checking']);
  const checkingId = checkingResult.lastInsertRowid;

  const savingsResult = await wrapStatement(insertAccount).run([userId, 'savings', '0987654321', '021000021', 12345.67, 12345.67, 'Emergency Savings']);
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
    await wrapStatement(insertTransaction).run([
      tx.accountId,
      tx.type,
      tx.category,
      tx.description,
      tx.amount,
      tx.balanceAfter,
      tx.status,
      tx.ref,
      tx.counterpartyId || null,
      '{}'
    ]);
  }

  // Seed transactions for demo user savings account
  const savingsTransactions = [
    { accountId: savingsId, type: 'credit', category: 'Interest', description: 'INTEREST PAYMENT', amount: 12.34, balanceAfter: 12358.01, status: 'completed', ref: generateRef() },
    { accountId: savingsId, type: 'credit', category: 'Transfer', description: 'Transfer from Checking ****7890', amount: 500.00, balanceAfter: 12858.01, status: 'completed', ref: generateRef(), counterpartyId: checkingId },
  ];

  for (const tx of savingsTransactions) {
    await wrapStatement(insertTransaction).run([
      tx.accountId,
      tx.type,
      tx.category,
      tx.description,
      tx.amount,
      tx.balanceAfter,
      tx.status,
      tx.ref,
      tx.counterpartyId || null,
      '{}'
    ]);
  }

  // Save database after seeding
  saveDatabase();

  console.log('Demo data seeded successfully.');
  console.log('Admin user: admin / admin123');
  console.log('Demo user: johndoe / password123');
}

function createStatement(sql: string): Statement {
  if (!db) throw new Error('Database not initialized');
  return db.prepare(sql);
}

function wrapStatement(stmt: Statement) {
  const originalGet = stmt.get.bind(stmt);
  const originalRun = stmt.run.bind(stmt);

  return {
    get: async (...params: any[]) => {
      await dbReady;
      // Handle both .get([a, b, c]) and .get(a, b, c) calling conventions
      const flatParams = params.length === 1 && Array.isArray(params[0]) ? params[0] : params;
      const result = originalGet(flatParams);
      if (!result || result.length === 0) return undefined;
      const columns = stmt.getColumnNames();
      const obj: Record<string, any> = {};
      columns.forEach((col, i) => {
        obj[col] = result[i];
      });
      return obj;
    },
    all: async (...params: any[]) => {
      await dbReady;
      // Handle both .all([a, b, c]) and .all(a, b, c) calling conventions
      const flatParams = params.length === 1 && Array.isArray(params[0]) ? params[0] : params;
      const results: any[] = [];
      // Bind parameters first
      if (flatParams.length > 0) {
        stmt.bind(flatParams);
      }
      while (stmt.step()) {
        const row = stmt.get();
        const columns = stmt.getColumnNames();
        const obj: Record<string, any> = {};
        columns.forEach((col, i) => {
          obj[col] = row[i];
        });
        results.push(obj);
      }
      stmt.reset();
      return results;
    },
    run: async (...params: any[]) => {
      await dbReady;
      // Handle both .run([a, b, c]) and .run(a, b, c) calling conventions
      const flatParams = params.length === 1 && Array.isArray(params[0]) ? params[0] : params;
      const result = originalRun(flatParams);
      const lastIdResult = db!.exec('SELECT last_insert_rowid() as id');
      return {
        lastInsertRowid: lastIdResult[0]?.values[0]?.[0] || 0,
        changes: result ? 1 : 0
      };
    },
  };
}

async function transaction<T>(fn: () => Promise<T>): Promise<T> {
  await dbReady;
  if (!db) throw new Error('Database not initialized');
  db.exec('BEGIN TRANSACTION');
  try {
    const result = await fn();
    db.exec('COMMIT');
    return result;
  } catch (error) {
    db.exec('ROLLBACK');
    throw error;
  }
}

// Export the database interface with async methods
export const database = {
  prepare: async (sql: string) => {
    await dbReady;
    const stmt = createStatement(sql);
    return wrapStatement(stmt);
  },
  exec: async (sql: string) => {
    await dbReady;
    return db!.exec(sql);
  },
  transaction,
  close: async () => {
    await dbReady;
    db?.close();
  }
};

export { initializeDatabase, seedDatabase, saveDatabase, createStatement, wrapStatement, transaction };
export default database;