import fs from "fs/promises";
import { RowDataPacket } from "mysql2";
import path from "path";
import mysql from "mysql2/promise";
import { CONFIG } from "./pool";

const connection = mysql
  .createConnection({
    ...CONFIG,
    database: "",
    multipleStatements: true,
  })
  .catch((err) => {
    throw err;
  });

export const db_seed = async (end: boolean) => {
  const sql = await fs.readFile(path.join(__dirname, "tickets.sql"), {
    encoding: "utf8",
  });
  const db = await connection;
  await db.query(sql);
  if (end) {
    await db.end();
  }
};
export const db_clear = async () => {
  interface Query extends RowDataPacket {
    query: string;
  }
  const db = await connection;
  const [result, _] = await db.query<Query[]>(`
    SELECT CONCAT('Truncate TABLE ' , table_name, '; ') AS query
    FROM information_schema.tables
    WHERE table_schema = 'tickets';
  `);

  let sql = "";
  for (const q of result) {
    sql += q.query;
  }

  await db.query(sql);
};

export const db_drop = async () => {
  const db = await connection;
  await db.query(`DROP SCHEMA IF EXISTS tickets`);
  await db.end();
};

// db_seed(true);
