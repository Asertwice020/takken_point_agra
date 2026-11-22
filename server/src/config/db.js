import pg from "pg";
import { env } from "./env.js";

// * Keep DATE columns as "YYYY-MM-DD" strings (no JS Date timezone shifts)
pg.types.setTypeParser(1082, (value) => value);

export const pool = new pg.Pool({
  connectionString: env.databaseUrl,
  ssl: env.dbSsl ? { rejectUnauthorized: false } : false,
  max: 10,
  idleTimeoutMillis: 10000, // close idle connections ourselves, before the network does
  connectionTimeoutMillis: 10000, // never hang forever when the database is unreachable
  keepAlive: true, // keeps the TCP connection alive so routers and NAT do not silently drop it
  keepAliveInitialDelayMillis: 10000,
});

// * ROOT-CAUSE FIX. A network or the Supabase pooler can reset an IDLE connection at any moment.
// * The pool reports that as an 'error' event; with no listener Node treats it as unhandled and crashes the whole server.
// * With this listener the dead connection is simply dropped and the pool opens a fresh one.
pool.on("error", (error) => console.error("Database connection dropped (the pool reconnects by itself):", error.code || error.message));
