import "dotenv/config";
import { defineConfig, env } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  datasource: {
    url: env("DATABASE_URL") || process.env.DATABASE_URL!, // uses connection pooling
    shadowDatabaseUrl:
      env("DATABASE_URL_UNPOOLED") || process.env.DATABASE_URL_UNPOOLED, // uses a direct connection for migrations
  },
});
