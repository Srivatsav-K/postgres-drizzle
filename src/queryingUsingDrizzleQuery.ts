import { desc, sql } from "drizzle-orm";
import { db } from "./drizzle/db";
import { UserTable } from "./drizzle/schema";

async function main() {
  // Get all columns of all users
  const allUsers = await db.query.UserTable.findMany();
  console.log("🚀 ~ main ~ allUsers:", allUsers);

  // Get only selected columns
  const selectedColumns = await db.query.UserTable.findMany({
    columns: { email: true },
  });
  console.log("🚀 ~ main ~ selectedColumns:", selectedColumns);

  // Exclude selected columns
  const excludeSelectedColumns = await db.query.UserTable.findMany({
    columns: { email: false, role: false },
  });
  console.log("🚀 ~ main ~ excludeSelectedColumns:", excludeSelectedColumns);

  // Extras : run raw sql
  const lowerCasedUsernames = await db.query.UserTable.findMany({
    columns: { name: true },
    extras: {
      lowerCaseName: sql<string>`lower(${UserTable.name})`.as("lowerCaseName"),
    },
  });
  console.log("🚀 ~ main ~ lowerCasedUsernames:", lowerCasedUsernames);

  // Limit no.of records returned
  const limitedUsers = await db.query.UserTable.findMany({
    limit: 1,
    columns: { name: true },
  });
  console.log("🚀 ~ main ~ limitedUsers:", limitedUsers);

  // Offset : skip a certain specified no.of records initially
  const offsetUsers = await db.query.UserTable.findMany({
    offset: 1, // skip the first record
    columns: { name: true },
  });
  console.log("🚀 ~ main ~ offsetUsers:", offsetUsers);

  // Selecting data with relationships
  const usersWithUserPreferences = await db.query.UserTable.findMany({
    columns: { name: true },
    with: { preferences: true },
  });
  console.log(
    "🚀 ~ main ~ usersWithUserPreferences:",
    usersWithUserPreferences
  );
  // OUTPUT
  /* 
    [
      {
        name: 'John',
        preferences: {
          id: '449884b5-3224-47aa-bbc2-8f41ef9a95b3',
          emailUpdates: true,
          userId: 15,
          createdAt: 2024-04-27T16:08:09.379Z,
          updatedAt: 2024-04-27T16:08:09.379Z
        }
      },
      { name: 'Peter', preferences: null },
      { name: 'Sally', preferences: null }
    ]
  */

  // Selecting data with relationships with only selected columns
  const usersWithUserPreferencesSelectedColums =
    await db.query.UserTable.findMany({
      columns: { name: true },
      with: { preferences: { columns: { emailUpdates: true } }, posts: true },
    });
  console.log(
    "🚀 ~ main ~ usersWithUserPreferencesSelectedColums:",
    usersWithUserPreferencesSelectedColums
  );
  // OUTPUT
  /* 
    [
      { name: 'John', preferences: { emailUpdates: true }, posts: [] },
      { name: 'Peter', preferences: null, posts: [] },
      { name: 'Sally', preferences: null, posts: [] }
    ]
  */

  // Nested query : get all users with posts and post categories
  const nestedOperation = await db.query.UserTable.findMany({
    columns: { name: true, id: true },
    with: { posts: { with: { postCategories: true } } },
  });
  console.log("🚀 ~ main ~ nestedOperation:", nestedOperation);

  // orderBy
  const sortedUsers = await db.query.UserTable.findMany({
    columns: { name: true, age: true },
    orderBy: desc(UserTable.age),
  });
  console.log("🚀 ~ main ~ sortedUsers:", sortedUsers);

  // orderBy function version
  const sortedUsersFuncVersion = await db.query.UserTable.findMany({
    columns: { name: true, age: true },
    orderBy: (
      table,
      {
        asc,
        // ... other funcs like:
        // desc,
        // sql,
      }
    ) => asc(table.name),
  });
  console.log("🚀 ~ main ~ sortedUsersFuncVersion:", sortedUsersFuncVersion);

  // where
  const usersOlderThan28 = await db.query.UserTable.findMany({
    columns: { name: true, age: true },
    //@ts-expect-error false error
    where: (userTable, operators) => {
      //@ts-expect-error false error
      return operators.gt(userTable.age, 28);
    },
  });
  console.log("🚀 ~ main ~ usersOlderThan28:", usersOlderThan28);
}

main();
