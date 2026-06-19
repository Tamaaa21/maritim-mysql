import mysql, { Pool, PoolConnection, RowDataPacket, ResultSetHeader } from "mysql2/promise";

let pool: Pool | null = null;

function getPool(): Pool {
  if (pool) return pool;

  const host = process.env.MYSQL_HOST || "localhost";
  const port = parseInt(process.env.MYSQL_PORT || "3306", 10);
  const user = process.env.MYSQL_USER || "root";
  const password = process.env.MYSQL_PASSWORD || "";
  const database = process.env.MYSQL_DATABASE || "bmkg_maritim";

  if (!user || !database) {
    throw new Error("MySQL credentials must be configured in environment variables (MYSQL_HOST, MYSQL_USER, MYSQL_PASSWORD, MYSQL_DATABASE)");
  }

  pool = mysql.createPool({
    host,
    port,
    user,
    password,
    database,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    timezone: "+00:00",
  });

  return pool;
}

export async function query<T extends RowDataPacket[] = any>(
  sql: string,
  params?: any
): Promise<T> {
  const pool = getPool();
  const [rows] = await pool.execute<T>(sql, params || []);
  return rows;
}

export async function execute(
  sql: string,
  params?: any
): Promise<ResultSetHeader> {
  const pool = getPool();
  const [result] = await pool.execute<ResultSetHeader>(sql, params || []);
  return result;
}

export async function getConnection(): Promise<PoolConnection> {
  const pool = getPool();
  return pool.getConnection();
}

export async function getDb() {
  return { query, execute, getConnection };
}

export default getDb;
