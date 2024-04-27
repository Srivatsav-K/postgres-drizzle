import { relations } from "drizzle-orm";
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

// one to one mapping (one user has one preference)
export const UserPreferencesTable = pgTable("userPreferences", {
  id: uuid("id").primaryKey().defaultRandom(),
  emailUpdates: boolean("emailUpdates").notNull().default(false),
  userId: integer("userId")
    .references(() => UserTable.id, { onDelete: "cascade" })
    .notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

// one to many mapping (one user can have multiple posts)
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

// many to many mapping each post can have multiple categories and each category can have multiple posts
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
