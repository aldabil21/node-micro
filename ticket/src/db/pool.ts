import mysql, { PoolOptions } from "mysql2";

const CONFIG: PoolOptions = {
  connectionLimit: 10,
  port: 3306,
  host: process.env.DB_HOST?.toString()!,
  user: process.env.DB_USER!,
  password: process.env.ROOT_PASSWORD!,
  database: process.env.DB_NAME!,
};

const db = mysql.createPool(CONFIG).promise();

export { db, CONFIG };
