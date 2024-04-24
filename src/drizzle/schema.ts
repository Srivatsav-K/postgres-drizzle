import {
  unique,
  pgTable,
  serial,
  varchar,
  integer,
  pgEnum,
  index,
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
