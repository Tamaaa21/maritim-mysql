import { drizzle } from "drizzle-orm/mysql2";
import { createPool } from "mysql2/promise";
import * as schema from "./schema";

const pool = createPool({
  host: process.env.MYSQL_HOST || "localhost",
  port: Number(process.env.MYSQL_PORT) || 3306,
  user: process.env.MYSQL_USER || "root",
  password: process.env.MYSQL_PASSWORD || "",
  database: process.env.MYSQL_DATABASE || "bmkg_tegal",
  waitForConnections: true,
  connectionLimit: 10,
  connectTimeout: 10000,
});

export const db = drizzle(pool, { schema, mode: "default" });
export { schema };
export default db;
