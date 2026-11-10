import 'dotenv/config';
import { createClient, type InValue } from '@libsql/client';
import initSqlJs from 'sql.js';
import { existsSync, readFileSync } from 'fs';
import { dirname, resolve } from 'path';
import { fileURLToPath } from 'url';
import { database, initializeDatabase } from './index.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const sourcePath = process.env.SQLITE_MIGRATION_SOURCE || resolve(__dirname, '../../data/chase.db');
const wasmPath = resolve(__dirname, '../../sql-wasm.wasm');
const tables = ['users', 'accounts', 'transactions', 'sessions', 'app_settings'] as const;
const protectedTables = ['users', 'accounts', 'transactions', 'sessions'] as const;

async function migrate(): Promise<void> {
  const url = process.env.TURSO_DATABASE_URL;
  const authToken = process.env.TURSO_AUTH_TOKEN;
  if (!url) {
    throw new Error('Set TURSO_DATABASE_URL before running this migration.');
  }
  if (url.startsWith('libsql://') && !authToken) {
    throw new Error('TURSO_AUTH_TOKEN is required for a remote Turso database.');
  }
  if (!existsSync(sourcePath)) {
    throw new Error(`SQLite source database not found: ${sourcePath}`);
  }

  const SQL = await initSqlJs({ locateFile: () => wasmPath });
  const sourceDb = new SQL.Database(readFileSync(sourcePath));
  const client = createClient({
    url,
    ...(authToken ? { authToken } : {}),
    intMode: 'number',
  });

  try {
    await initializeDatabase();

    for (const table of protectedTables) {
      const result = await client.execute(`SELECT COUNT(*) AS count FROM ${table}`);
      if (Number(result.rows[0]?.count ?? 0) > 0) {
        throw new Error(`Target table "${table}" is not empty. Refusing to overwrite or merge existing production records.`);
      }
    }

    const transaction = await client.transaction('write');
    try {
      for (const table of tables) {
        const tableExists = sourceDb.exec(
          `SELECT name FROM sqlite_master WHERE type = 'table' AND name = '${table}'`,
        ).length > 0;
        if (!tableExists) continue;

        const sourceResult = sourceDb.exec(`SELECT * FROM ${table}`);
        const result = sourceResult[0];
        if (!result || result.values.length === 0) continue;

        const targetColumnsResult = await transaction.execute(`PRAGMA table_info(${table})`);
        const targetColumns = targetColumnsResult.rows.map((row) => String(row.name));
        const columns = targetColumns.filter((column) =>
          result.columns.includes(column) || (table === 'users' && column === 'transactions_blocked'),
        );
        if (columns.length === 0) continue;

        const placeholders = columns.map(() => '?').join(', ');
        const columnList = columns.map((column) => `"${column}"`).join(', ');
        const insertSql = table === 'app_settings'
          ? `INSERT INTO ${table} (${columnList}) VALUES (${placeholders}) ON CONFLICT(setting_key) DO UPDATE SET setting_value = excluded.setting_value`
          : `INSERT INTO ${table} (${columnList}) VALUES (${placeholders})`;

        for (const sourceRow of result.values) {
          const values = columns.map((column) => {
            const sourceIndex = result.columns.indexOf(column);
            return sourceIndex === -1 && table === 'users' && column === 'transactions_blocked'
              ? 0
              : sourceRow[sourceIndex] as InValue;
          });
          await transaction.execute({ sql: insertSql, args: values });
        }
      }
      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      throw error;
    } finally {
      transaction.close();
    }
    console.log('SQLite records imported into Turso successfully.');
  } finally {
    sourceDb.close();
    client.close();
    await database.close();
  }
}

migrate().catch((error: unknown) => {
  console.error('Turso database migration failed:', error);
  process.exitCode = 1;
});
