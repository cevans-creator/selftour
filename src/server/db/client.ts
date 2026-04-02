import "server-only";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

// Prevent multiple connections in development (Next.js hot reload)
declare global {
  // eslint-disable-next-line no-var
  var __pgClient: postgres.Sql | undefined;
}

function createClient() {
  const connectionString = process.env.DATABASE_URL ?? "postgresql://placeholder:placeholder@localhost:5432/placeholder";

  return postgres(connectionString, {
    prepare: false, // Required for Supabase transaction pooler
    max: 1,
    idle_timeout: 20,
    connect_timeout: 10,
  });
}

const pgClient = globalThis.__pgClient ?? createClient();

if (process.env.NODE_ENV !== "production") {
  globalThis.__pgClient = pgClient;
}

export const db = drizzle(pgClient, { schema });

export type DB = typeof db;
