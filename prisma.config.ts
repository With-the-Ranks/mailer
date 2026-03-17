import { config } from "dotenv";
import { defineConfig } from "prisma/config";

config({ path: ".env" });
config({ path: ".env.local", override: true });

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL environment variable is required");
}

const datasource: {
  url: string;
  shadowDatabaseUrl?: string;
} = {
  url: process.env.DATABASE_URL, // uses connection pooling
};

if (
  process.env.DATABASE_URL_UNPOOLED &&
  process.env.DATABASE_URL_UNPOOLED !== process.env.DATABASE_URL
) {
  datasource.shadowDatabaseUrl = process.env.DATABASE_URL_UNPOOLED;
}

export default defineConfig({
  schema: "prisma/schema.prisma",
  datasource,
});
