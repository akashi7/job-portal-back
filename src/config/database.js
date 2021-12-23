import { createPool } from "mysql";
import { config } from 'dotenv';
config();

const db = createPool({
  database: process.env.DATABASE,
  host: process.env.HOST,
  user: process.env.USER,
  password: process.env.PASSWORD
});

export { db };