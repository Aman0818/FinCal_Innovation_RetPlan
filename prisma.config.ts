import { defineConfig } from "prisma/config";
import { config } from "dotenv";
import { resolve } from "path";

// Prisma CLI doesn't auto-load .env — load it explicitly
config({ path: resolve(process.cwd(), ".env") });

export default defineConfig({
  schema: "prisma/schema.prisma",
  datasource: {
    url: process.env.DATABASE_URL!,
  },
});
