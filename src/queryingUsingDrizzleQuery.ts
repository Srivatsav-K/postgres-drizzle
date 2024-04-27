import { sql } from "drizzle-orm";
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
}

main();
