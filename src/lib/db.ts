import { createRequire } from 'module';

// mssql is CJS-only; use createRequire so Turbopack doesn't wrap/transform the exports
const require = createRequire(import.meta.url);
// eslint-disable-next-line @typescript-eslint/no-require-imports
const sql = require('mssql') as typeof import('mssql');

const config: import('mssql').config = {
  server:   process.env.DB_SERVER   ?? 'localhost',
  database: process.env.DB_DATABASE ?? 'EcoShop',
  user:     process.env.DB_USER     ?? 'ecoshop_app',
  password: process.env.DB_PASSWORD ?? 'EcoShop2024#Secure!',
  options:  { trustServerCertificate: true, encrypt: false },
  pool: { max: 10, min: 0, idleTimeoutMillis: 30000 },
};

declare global {
  // eslint-disable-next-line no-var
  var _mssqlPool: import('mssql').ConnectionPool | undefined;
}

async function getPool(): Promise<import('mssql').ConnectionPool> {
  if (global._mssqlPool?.connected) return global._mssqlPool;
  const pool = new sql.ConnectionPool(config);
  await pool.connect();
  global._mssqlPool = pool;
  return pool;
}

export { getPool, sql };
