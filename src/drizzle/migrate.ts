import "dotenv/config";

import { Pool } from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import { migrate } from "drizzle-orm/node-postgres/migrator";

const migrationClient = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 1,
});

async function syncMigrationsWithDb() {
  const db = drizzle(migrationClient);

  await migrate(db, {
    migrationsFolder: "./src/drizzle/migrations",
  });

  await migrationClient.end();
}

syncMigrationsWithDb();
