// db.ts
import { Pool } from "pg";

const pool = new Pool({
  host: process.env.DB_HOST, // e.g., 'localhost'
  port: Number(process.env.DB_PORT), // e.g., 5432
  user: process.env.DB_USER, // e.g., 'postgres'
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

export default pool;
