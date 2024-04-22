# Drizzle ORM with postgres

## Setup

- Getting started : <https://orm.drizzle.team/docs/get-started-postgresql#node-postgres>

- Installation

  ```sh
    pnpm add drizzle-orm pg
    pnpm add -D drizzle-kit @types/pg
  ```

- Create `drizzle.config.ts` file at the root

  ```ts
  import { defineConfig } from "drizzle-kit";

  export default defineConfig({
    schema: "./src/drizzle/schema.ts",
    out: "./src/drizzle/migrations", // migrations output directory
    driver: "pg",
    dbCredentials: {
      connectionString: process.env.DATABASE_URL as string,
    },
    verbose: true, // during migrations will tell us exactly what all things are changing
    strict: true,
  });
  ```

- Create `schema.ts` file under `./src/drizzle/schema.ts`

- Create your table

  ```ts
  import { pgTable, serial, varchar } from "drizzle-orm/pg-core";

  // NOTE : export everything from this file

  export const UserTable = pgTable("users", {
    id: serial("id").primaryKey(),
    name: varchar("name", { length: 255 }).notNull(),
  });
  ```

## Genrate migration files

- Add a migration script to package.json : `"db:generate-migration":"drizzle-kit generate:pg"`

  ```json
    "scripts": {
      "db:generate-migration": "drizzle-kit generate:pg",
      "db:drop-migration": "drizzle-kit drop" // deletes migrations
    }
  ```

- Run `pnpm run db:generate-migration`
- Migrations are created under `./src/drizzle/migrations`

## Apply migrations to db

- Create a `migrate.ts` file under `/src/drizzle/migrate.ts`

  ```ts
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
  ```

- Run this file by adding a script in package.json `"db:migrate": "ts-node ./src/drizzle/migrate.ts"`

- `pnpm run db:migrate`

## Drizzle studio

- <https://orm.drizzle.team/drizzle-studio/overview>

- Visualise your DB by running `pnpm drizzle-kit studio`

## Connecting to db

- Create a `db.ts` file under `/src/drizzle/db.ts`

  ```ts
  import "dotenv/config";
  import { Pool } from "pg";
  import { drizzle } from "drizzle-orm/node-postgres";
  import * as schema from "./schema";

  const client = new Pool({
    connectionString: process.env.DATABASE_URL,
  });

  export const db = drizzle(client, { schema, logger: true }); // logger:true shows raw SQL during execution
  ```

- Export and use this `db` for queries across the app.
