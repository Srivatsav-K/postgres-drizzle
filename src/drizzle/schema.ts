import {
  unique,
  pgTable,
  serial,
  varchar,
  integer,
  pgEnum,
  index,
  uuid,
  boolean,
  timestamp,
  real,
  primaryKey,
} from "drizzle-orm/pg-core";

// NOTE : export everything from this file

export const UserRole = pgEnum("userRole", ["ADMIN", "BASIC"]);

export const UserTable = pgTable(
  "users",
  {
    id: serial("id").primaryKey(),
    // id2: uuid("id2").defaultRandom().primaryKey(),
    name: varchar("name", { length: 255 }).notNull(),
    age: integer("age").notNull(),
    email: varchar("email", { length: 255 }).notNull().unique(),
    role: UserRole("role").default("BASIC").notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().notNull(),
  },
  (table) => {
    return {
      emailIndex: index("emailIndex").on(table.email),
      //emailIndex: uniqueIndex("emailIndex").on(table.email), // we can remove .unique() definition in the table if this is added

      //If we want unique multiple fields (ex. a user should have unique name and age)
      uniqueNameAndAge: unique("uniqueNameAndAge").on(table.name, table.age),
    };
  }
);

export const UserPreferencesTable = pgTable("userPreferences", {
  id: uuid("id").primaryKey().defaultRandom(),
  emailUpdates: boolean("emailUpdates").notNull().default(false),
  userId: integer("userId")
    .references(() => UserTable.id, { onDelete: "cascade" })
    .notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export const PostTable = pgTable("posts", {
  id: uuid("id").primaryKey().defaultRandom(),
  title: varchar("title", { length: 255 }).notNull(),
  averageRating: real("averageRating").notNull().default(0), // float in sql; real in postgres
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
  authorId: integer("authorId")
    .references(() => UserTable.id, { onDelete: "cascade" })
    .notNull(),
});

export const CategoryTable = pgTable("categories", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 255 }).notNull(),
});

// Join table
// id is not requried here as a combination of postId and categoryId can act as an id
// We can use : composite primary key (primary key that uses multiple columns)
export const PostCategory = pgTable(
  "postCategory",
  {
    postId: uuid("postId")
      .references(() => PostTable.id, { onDelete: "cascade" })
      .notNull(),
    categoryId: uuid("categoryId")
      .references(() => CategoryTable.id, { onDelete: "cascade" })
      .notNull(),
  },
  (table) => {
    return {
      pk: primaryKey({ columns: [table.postId, table.categoryId] }),
    };
  }
);
