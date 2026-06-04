import "dotenv/config";
import { defineConfig } from "prisma/config";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL environment variable is required");
}

export default defineConfig({
  schema: "prisma/schema.prisma",
  datasource: {
    url: process.env.DATABASE_URL, // uses connection pooling
    shadowDatabaseUrl: process.env.DATABASE_URL_UNPOOLED, // uses a direct connection for migrations
  },
});
