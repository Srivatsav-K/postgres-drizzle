import { db } from "./drizzle/db";
import { UserTable } from "./drizzle/schema";

async function insertingData() {
  await db.delete(UserTable);

  // insert 1 record
  const user = await db
    .insert(UserTable)
    .values({
      name: "John",
      age: 29,
      email: "john@gmail.com",
    })
    .returning(); // returns all the columns
  console.log("🚀 ~ insertingData ~ user:", user);

  // insert multiple records
  const users = await db
    .insert(UserTable)
    .values([
      {
        name: "Peter",
        age: 28,
        email: "peter@gmail.com",
      },
      {
        name: "Sally",
        age: 29,
        email: "sally@gmail.com",
      },
    ])
    .returning({
      id: UserTable.id,
      userName: UserTable.name, // we can change the name of the column while returning
    });
  console.log("🚀 ~ insertingData ~ users:", users);

  // Upsert Record

  // const upsertedUser = await db
  //   .insert(UserTable)
  //   .values({
  //     name: "John",
  //     age: 29,
  //     email: "john@gmail.com",
  //   })
  //   .returning({
  //     id: UserTable.id,
  //     userName: UserTable.name,
  //   })
  //   .onConflictDoUpdate({
  //     // if there is a conflict on email set the name to Updated Name
  //     target: UserTable.email,
  //     set: { name: "Updated Name" },
  //   });
}

insertingData();
