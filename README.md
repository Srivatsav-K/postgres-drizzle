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

## Apply migrations to db (sync with db)

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

## Selecting data with relationships using `db.query`

- If we want to fetch data along with it's relationships while using drizzle's `db.query`(`db.query` is a higher level abstraction that drizzle offers for querying data)
- for ex. fetch all users but populate userPreferences also for each user.
- We already have these relations defined in our database (while creating tables using foreign keys). But drizzle's `db.query` doesn't know this. Hence we have define a drizzle level reference explicitly under `./src/drizzle/schema.ts`
- We have to setup relations on both sides of the tables for ex. on users and userPreferences
- No need to run a db migration as this is only used by drizzle that only when using `db.query`

```ts
// DRIZZLE RELATIONS (Map relations for drizzle so that it can be used in db.query with clause)
export const UserTableRelations = relations(UserTable, ({ one, many }) => {
  return {
    preferences: one(UserPreferencesTable), // user table has one user preference from userPreferences table
    posts: many(PostTable),
  };
});

export const UserPreferencesTableRelations = relations(
  UserPreferencesTable,
  ({ one }) => {
    return {
      user: one(UserTable, {
        fields: [UserPreferencesTable.userId], // foreign key
        references: [UserTable.id], // what it references
      }), // When we are doing one to one mapping the table that has the id(foreign key), we also need to pass a second argument
    };
  }
);

export const PostTableRelations = relations(PostTable, ({ one, many }) => {
  return {
    author: one(UserTable, {
      fields: [PostTable.authorId], // foreign key
      references: [UserTable.id], // what it references
    }), // When we are doing one to many mapping the table that has the id(foreign key), we also need to pass a second argument
    postCategories: many(PostCategory), // No need to pas second arg for many to many relations
  };
});

export const CategoryTableRelations = relations(CategoryTable, ({ many }) => {
  return {
    postCategory: many(PostCategory),
  };
});

export const PostCategoryTableRelations = relations(PostCategory, ({ one }) => {
  return {
    post: one(PostTable, {
      fields: [PostCategory.postId],
      references: [PostTable.id],
    }),
    category: one(CategoryTable, {
      fields: [PostCategory.categoryId],
      references: [CategoryTable.id],
    }),
  };
});
```
