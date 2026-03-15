import { PrismaClient } from "@/generated/prisma/client";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";

function buildPoolConfig() {
  const raw = process.env.DATABASE_URL!;
  // Parse mariadb:// URL manually so the mariadb npm package gets proper options
  const url = new URL(raw.replace(/^mariadb:\/\//, "mysql://"));
  return {
    host: url.hostname,
    port: Number(url.port) || 3306,
    user: decodeURIComponent(url.username),
    password: decodeURIComponent(url.password),
    database: url.pathname.replace(/^\//, ""),
    ssl: { rejectUnauthorized: false }, // Aiven requires SSL
    connectionLimit: 5,
  };
}

const adapter = new PrismaMariaDb(buildPoolConfig());

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient | undefined };
export const prisma = globalForPrisma.prisma ?? new PrismaClient({ adapter });
if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
