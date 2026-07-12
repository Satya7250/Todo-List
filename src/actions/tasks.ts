"use server";

import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { and, eq } from "drizzle-orm";

import { db } from "@/db";
import { projects, tasks, users } from "@/db/schema";

interface TaskRecordFromDb {
  id: string;
  userId: string;
  projectId: string;
  title: string;
  description: string | null;
  completed: boolean;
  priority: number;
  dueDate: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface TaskRecord {
  id: string;
  title: string;
  completed: boolean;
  dueDate?: string | null;
}

async function getCurrentUserData() {
  const { userId } = await auth();

  if (!userId) {
    return null;
  }

  const currentUser = await db.query.users.findFirst({
    where: eq(users.clerkId, userId),
  });

  return currentUser;
}

async function getInboxProjectId(userId: string) {
  const inboxProject = await db.query.projects.findFirst({
    where: and(eq(projects.userId, userId), eq(projects.isDefault, true)),
  });

  return inboxProject?.id ?? null;
}

function serializeTask(task: TaskRecordFromDb): TaskRecord {
  return {
    id: task.id,
    title: task.title,
    completed: task.completed,
    dueDate: task.dueDate ? task.dueDate.toISOString() : null,
  };
}

export async function getTasks(): Promise<TaskRecord[]> {
  const currentUser = await getCurrentUserData();

  if (!currentUser) {
    return [];
  }

  const userTasks = await db
    .select()
    .from(tasks)
    .where(eq(tasks.userId, currentUser.id));

  return userTasks
    .sort((firstTask, secondTask) => {
      return (
        new Date(secondTask.createdAt).getTime() -
        new Date(firstTask.createdAt).getTime()
      );
    })
    .map((task) => serializeTask(task as TaskRecordFromDb));
}

export async function createTask(title: string): Promise<TaskRecord | null> {
  const trimmedTitle = title.trim();

  if (!trimmedTitle) {
    return null;
  }

  const currentUser = await getCurrentUserData();

  if (!currentUser) {
    return null;
  }

  const inboxProjectId = await getInboxProjectId(currentUser.id);

  if (!inboxProjectId) {
    return null;
  }

  const [createdTask] = await db
    .insert(tasks)
    .values({
      userId: currentUser.id,
      projectId: inboxProjectId,
      title: trimmedTitle,
      completed: false,
    })
    .returning();

  revalidatePath("/");

  return createdTask ? serializeTask(createdTask as TaskRecordFromDb) : null;
}

export async function toggleTask(
  id: string,
  completed: boolean
): Promise<TaskRecord | null> {
  const currentUser = await getCurrentUserData();

  if (!currentUser) {
    return null;
  }

  const [updatedTask] = await db
    .update(tasks)
    .set({
      completed,
      updatedAt: new Date(),
    })
    .where(and(eq(tasks.id, id), eq(tasks.userId, currentUser.id)))
    .returning();

  revalidatePath("/");

  return updatedTask ? serializeTask(updatedTask as TaskRecordFromDb) : null;
}
