import * as mariadb from "mariadb";
import { config } from "dotenv";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
config({ path: resolve(__dirname, "../.env") });

const raw = process.env.DATABASE_URL;
const url = new URL(raw.replace(/^mysql:\/\//, "http://"));

const pool = mariadb.createPool({
  host: url.hostname,
  port: Number(url.port) || 3306,
  user: decodeURIComponent(url.username),
  password: decodeURIComponent(url.password),
  database: url.pathname.replace(/^\//, ""),
  ssl: { rejectUnauthorized: false },
  connectionLimit: 2,
});

const conn = await pool.getConnection();
try {
  await conn.query(
    "INSERT IGNORE INTO `users` (id, email, name, password_hash, created_at, updated_at) VALUES (UUID(), ?, ?, ?, NOW(), NOW())",
    ["demo@hdfcretirement.com", "Demo User", "$2b$12$qNS.LZRtdswKdOE5ArtgRe/4l9mJEHDRPU16rKPb6AdlWsJNASO0a"]
  );
  console.log("✓ Demo user seeded — demo@hdfcretirement.com / Demo@12345");
} finally {
  conn.end();
  await pool.end();
}
