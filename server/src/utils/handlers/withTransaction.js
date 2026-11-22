import { pool } from "../../config/db.js";

// ==========================================
// * DB TRANSACTION HELPERS
// ==========================================
export const withTransaction = async (callback) => {
  const client = await pool.connect();
  // * A checked-out connection can also be reset; without a listener that would crash the server too
  const logClientError = (error) => console.error("Database client error:", error.code || error.message);
  client.on("error", logClientError);
  try {
    await client.query("BEGIN");
    const result = await callback(client);
    await client.query("COMMIT");
    return result;
  } catch (error) {
    await client.query("ROLLBACK").catch(() => {});
    throw error;
  } finally {
    client.off("error", logClientError);
    client.release();
  }
};

// * All games share the same stations, so there is ONE lock per date (the game id is ignored)
export const lockGameDate = (client, gameId, bookingDate) =>
  client.query("SELECT pg_advisory_xact_lock(hashtext($1))", [`date:${bookingDate}`]);




// import { pool } from "../../config/db.js";

// // ==========================================
// // * DB TRANSACTION HELPERS
// // ==========================================
// export const withTransaction = async (callback) => {
//   const client = await pool.connect();
//   try {
//     await client.query("BEGIN");
//     const result = await callback(client);
//     await client.query("COMMIT");
//     return result;
//   } catch (error) {
//     await client.query("ROLLBACK");
//     throw error;
//   } finally {
//     client.release();
//   }
// };

// // * All games share the same stations, so there is ONE lock per date (the game id is ignored)
// export const lockGameDate = (client, gameId, bookingDate) =>
//   client.query("SELECT pg_advisory_xact_lock(hashtext($1))", [`date:${bookingDate}`]);




// import { pool } from "../../config/db.js";

// // ==========================================
// // * DB TRANSACTION HELPERS
// // ==========================================
// export const withTransaction = async (callback) => {
//   const client = await pool.connect();
//   try {
//     await client.query("BEGIN");
//     const result = await callback(client);
//     await client.query("COMMIT");
//     return result;
//   } catch (error) {
//     await client.query("ROLLBACK");
//     throw error;
//   } finally {
//     client.release();
//   }
// };

// // * Only one booking per game per date can count seats at a time
// export const lockGameDate = (client, gameId, bookingDate) =>
//   client.query("SELECT pg_advisory_xact_lock(hashtext($1))", [`${gameId}:${bookingDate}`]);
