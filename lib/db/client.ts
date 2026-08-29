import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is not set — see .env.example");
}

// Dev-mode HMR re-evaluates this module on every file save without tearing down the
// old postgres.js client, leaking one connection per reload until the pool is
// exhausted (EMAXCONN). Caching on globalThis survives HMR the same way the common
// Prisma/Next.js singleton pattern does — production still gets one client per process.
const globalForDb = globalThis as unknown as { __mtiPgClient?: ReturnType<typeof postgres> };

const client = globalForDb.__mtiPgClient ?? postgres(process.env.DATABASE_URL, { prepare: false, max: 10 });
if (process.env.NODE_ENV !== "production") globalForDb.__mtiPgClient = client;

export const db = drizzle(client, { schema });
