import "dotenv/config";
import { Pool } from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import * as schema from "./schema";

const client = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export const db = drizzle(client, { schema, logger: true }); // logger:true shows raw SQL during execution
