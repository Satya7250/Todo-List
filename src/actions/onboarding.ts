"use server";

import { auth, currentUser } from "@clerk/nextjs/server";
// import { db } from "@/db";
// import { users, projects } from "@/db/schema";
// import { eq } from "drizzle-orm";

export async function onBoardUser() {
//   const { userId } = await auth();

//   if (!userId) return null;

//   const clerkUser = await currentUser();

//   if (!clerkUser) return null;

//   const email =
//     clerkUser.primaryEmailAddress?.emailAddress ??
//     clerkUser.emailAddresses[0]?.emailAddress ??
//     "";

//   const name =
//     clerkUser.fullName ??
//     [clerkUser.firstName, clerkUser.lastName]
//       .filter(Boolean)
//       .join(" ");

//   const existingUser = await db.query.users.findFirst({
//     where: eq(users.clerkId, userId),
//   });

//   if (existingUser) {
//     return existingUser;
//   }

//   const [newUser] = await db
//     .insert(users)
//     .values({
//       clerkId: userId,
//       email,
//       name,
//       firstName: clerkUser.firstName,
//       lastName: clerkUser.lastName,
//       imageUrl: clerkUser.imageUrl,
//     })
//     .returning();

//   await db.insert(projects).values({
//     userId: newUser.id,
//     name: "Inbox",
//     icon: "inbox",
//     color: "#f97316",
//     isDefault: true,
//   });

//   return newUser;
}