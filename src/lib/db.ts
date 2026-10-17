import { neon } from "@neondatabase/serverless";

const databaseUrl = process.env.DATABASE_URL;

export const isDbConfigured = Boolean(
  databaseUrl && databaseUrl.trim().length > 0
);

export const sql = isDbConfigured
  ? neon(databaseUrl!)
  : (neon(
      "postgresql://postgres:postgres@localhost:5432/smartminds_placeholder"
    ) as ReturnType<typeof neon>);
