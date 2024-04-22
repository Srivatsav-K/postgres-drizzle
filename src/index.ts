import { db } from "./drizzle/db";
import { UserTable } from "./drizzle/schema";

async function fetchUsers() {
  await db.insert(UserTable).values({
    name: "user1",
  });

  const users = await db.query.UserTable.findMany();
  console.log("🚀 ~ fetchUsers ~ users:", users);
}

fetchUsers();
