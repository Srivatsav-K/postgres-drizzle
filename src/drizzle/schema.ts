import { pgTable, serial, varchar } from "drizzle-orm/pg-core";

// NOTE : export everything from this file

export const UserTable = pgTable("users", {
  id: serial("id").primaryKey(),
  // id2: uuid("id2").defaultRandom().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
});
