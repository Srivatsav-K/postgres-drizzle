import { pgTable, serial, varchar, integer, pgEnum } from "drizzle-orm/pg-core";

// NOTE : export everything from this file

export const UserRole = pgEnum("userRole", ["ADMIN", "BASIC"]);

export const UserTable = pgTable("users", {
  id: serial("id").primaryKey(),
  // id2: uuid("id2").defaultRandom().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  age: integer("age").notNull(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  role: UserRole("role").default("BASIC").notNull(),
});
