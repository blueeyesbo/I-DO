import { neon } from "@neondatabase/serverless";
import { ENV } from "./env.js";
import * as schema from "../db/schema.js";
import { drizzle } from "drizzle-orm/neon-http";

const sql = neon(ENV.DATABASE_URL);
const db = drizzle(sql, { schema });

export { db, sql };