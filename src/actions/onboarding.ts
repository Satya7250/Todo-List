"use server";

import { auth, currentUser } from "@clerk/nextjs/server";
import { and, eq } from "drizzle-orm";

import { db } from "@/db";
import { users, projects } from "@/db/schema";

async function ensureInboxProject(userId: string) {
  const inboxProject = await db.query.projects.findFirst({
    where: and(eq(projects.userId, userId), eq(projects.isDefault, true)),
  });

  if (inboxProject) {
    return inboxProject;
  }

  const [createdProject] = await db
    .insert(projects)
    .values({
      userId,
      name: "Inbox",
      color: "#f97316",
      icon: "inbox",
      isDefault: true,
    })
    .returning();

  return createdProject;
}

export async function onBoardUser() {
  const { userId } = await auth();

  if (!userId) {
    return null;
  }

  const clerkUser = await currentUser();

  if (!clerkUser) {
    return null;
  }

  const email =
    clerkUser.primaryEmailAddress?.emailAddress ??
    clerkUser.emailAddresses[0]?.emailAddress ??
    "";

  const name =
    clerkUser.fullName ??
    [clerkUser.firstName, clerkUser.lastName]
      .filter(Boolean)
      .join(" ");

  // -------------------------------------------------------
  // 1. Check by Clerk ID
  // -------------------------------------------------------
  let existingUser = await db.query.users.findFirst({
    where: eq(users.clerkId, userId),
  });

  if (existingUser) {
    await ensureInboxProject(existingUser.id);
    return existingUser;
  }

  // -------------------------------------------------------
  // 2. Check by Email (handles duplicate email issue)
  // -------------------------------------------------------
  existingUser = await db.query.users.findFirst({
    where: eq(users.email, email),
  });

  if (existingUser) {
    const [updatedUser] = await db
      .update(users)
      .set({
        clerkId: userId,
        name,
        imageUrl: clerkUser.imageUrl,
        updatedAt: new Date(),
      })
      .where(eq(users.id, existingUser.id))
      .returning();

    await ensureInboxProject(updatedUser.id);

    return updatedUser;
  }

  // -------------------------------------------------------
  // 3. Create New User
  // -------------------------------------------------------
  const [newUser] = await db
    .insert(users)
    .values({
      clerkId: userId,
      email,
      name,
      imageUrl: clerkUser.imageUrl,
    })
    .returning();

  await ensureInboxProject(newUser.id);

  return newUser;
}

export async function getCurrentUser() {
  const { userId } = await auth();

  if (!userId) {
    return null;
  }

  return await db.query.users.findFirst({
    where: eq(users.clerkId, userId),
  });
}

export async function getInboxProject(userId: string) {
  return await db.query.projects.findFirst({
    where: and(
      eq(projects.userId, userId),
      eq(projects.isDefault, true)
    ),
  });
}