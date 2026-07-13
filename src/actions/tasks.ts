"use server";

import { auth } from "@clerk/nextjs/server";
import { and, desc, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

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

interface TaskQueryOptions {
  projectId?: string | null;
}

export interface TaskActionResult<T> {
  success: boolean;
  data: T | null;
  error?: string;
  message?: string;
}

export interface TaskRecord {
  id: string;
  title: string;
  description?: string | null;
  completed: boolean;
  priority: number;
  dueDate?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

interface TaskUpdatePayload {
  title?: string;
  description?: string | null;
  completed?: boolean;
  priority?: number;
  dueDate?: string | Date | null;
}

function createErrorResult<T>(error: string): TaskActionResult<T> {
  return {
    success: false,
    data: null,
    error,
  };
}

async function getCurrentUserData() {
  const { userId } = await auth();

  if (!userId) {
    return null;
  }

  return db.query.users.findFirst({
    where: eq(users.clerkId, userId),
  });
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
    description: task.description,
    completed: task.completed,
    priority: task.priority,
    dueDate: task.dueDate ? task.dueDate.toISOString() : null,
    createdAt: task.createdAt ? task.createdAt.toISOString() : undefined,
    updatedAt: task.updatedAt ? task.updatedAt.toISOString() : undefined,
  };
}

function normalizeDueDate(value: string | Date | null | undefined) {
  if (value === undefined || value === null || value === "") {
    return null;
  }

  const parsedDate = value instanceof Date ? value : new Date(value);

  if (Number.isNaN(parsedDate.getTime())) {
    return null;
  }

  return parsedDate;
}

export async function getTasks(
  options: TaskQueryOptions = {}
): Promise<TaskActionResult<TaskRecord[]>> {
  const currentUser = await getCurrentUserData();

  if (!currentUser) {
    return createErrorResult<TaskRecord[]>("You must be signed in to view tasks.");
  }

  const whereClauses = [eq(tasks.userId, currentUser.id)];
  const targetProjectId =
    options.projectId === undefined || options.projectId === null
      ? await getInboxProjectId(currentUser.id)
      : options.projectId;

  if (targetProjectId) {
    whereClauses.push(eq(tasks.projectId, targetProjectId));
  }

  const userTasks = await db
    .select()
    .from(tasks)
    .where(and(...whereClauses))
    .orderBy(desc(tasks.createdAt));

  return {
    success: true,
    data: userTasks.map((task) => serializeTask(task as TaskRecordFromDb)),
    message: "Tasks loaded successfully.",
  };
}

export async function createTask(
  title: string,
  dueDate?: Date | string | null,
  priority?: number,
  projectId?: string | null
): Promise<TaskActionResult<TaskRecord | null>> {
  const trimmedTitle = title.trim();

  if (!trimmedTitle) {
    return createErrorResult<TaskRecord | null>("Task title is required.");
  }

  if (trimmedTitle.length > 200) {
    return createErrorResult<TaskRecord | null>(
      "Task title must be 200 characters or less."
    );
  }

  const currentUser = await getCurrentUserData();

  if (!currentUser) {
    return createErrorResult<TaskRecord | null>(
      "You must be signed in to create tasks."
    );
  }

  const targetProjectId = projectId ?? (await getInboxProjectId(currentUser.id));

  if (!targetProjectId) {
    return createErrorResult<TaskRecord | null>(
      "Could not find a valid project for your account."
    );
  }

  const priorityValue = priority !== undefined ? Number(priority) : 0;
  if (!Number.isInteger(priorityValue) || priorityValue < 0 || priorityValue > 4) {
    return createErrorResult<TaskRecord | null>(
      "Task priority must be a whole number between 0 and 4."
    );
  }

  const parsedDueDate = dueDate ? normalizeDueDate(dueDate) : null;
  if (dueDate !== undefined && dueDate !== null && dueDate !== "" && !parsedDueDate) {
    return createErrorResult<TaskRecord | null>(
      "Task due date must be a valid date."
    );
  }

  const [createdTask] = await db
    .insert(tasks)
    .values({
      userId: currentUser.id,
      projectId: targetProjectId,
      title: trimmedTitle,
      completed: false,
      priority: priorityValue,
      dueDate: parsedDueDate,
    })
    .returning();

  revalidatePath("/");

  return {
    success: true,
    data: createdTask ? serializeTask(createdTask as TaskRecordFromDb) : null,
    message: "Task created successfully.",
  };
}

export async function updateTask(
  id: string,
  updates: TaskUpdatePayload
): Promise<TaskActionResult<TaskRecord | null>> {
  const currentUser = await getCurrentUserData();

  if (!currentUser) {
    return createErrorResult<TaskRecord | null>(
      "You must be signed in to update tasks."
    );
  }

  const nextValues: Record<string, unknown> = {};

  if (updates.title !== undefined) {
    const trimmedTitle = updates.title.trim();

    if (!trimmedTitle) {
      return createErrorResult<TaskRecord | null>("Task title is required.");
    }

    if (trimmedTitle.length > 200) {
      return createErrorResult<TaskRecord | null>(
        "Task title must be 200 characters or less."
      );
    }

    nextValues.title = trimmedTitle;
  }

  if (updates.description !== undefined) {
    nextValues.description = updates.description?.trim() || null;
  }

  if (updates.completed !== undefined) {
    nextValues.completed = updates.completed;
  }

  if (updates.priority !== undefined) {
    const priorityValue = Number(updates.priority);

    if (!Number.isInteger(priorityValue) || priorityValue < 0 || priorityValue > 4) {
      return createErrorResult<TaskRecord | null>(
        "Task priority must be a whole number between 0 and 4."
      );
    }

    nextValues.priority = priorityValue;
  }

  if (updates.dueDate !== undefined) {
    const parsedDueDate = normalizeDueDate(updates.dueDate);

    if (updates.dueDate !== null && updates.dueDate !== "" && !parsedDueDate) {
      return createErrorResult<TaskRecord | null>(
        "Task due date must be a valid date."
      );
    }

    nextValues.dueDate = parsedDueDate;
  }

  if (Object.keys(nextValues).length === 0) {
    return createErrorResult<TaskRecord | null>("No supported fields were provided.");
  }

  const [updatedTask] = await db
    .update(tasks)
    .set({
      ...nextValues,
      updatedAt: new Date(),
    })
    .where(and(eq(tasks.id, id), eq(tasks.userId, currentUser.id)))
    .returning();

  revalidatePath("/");

  return {
    success: true,
    data: updatedTask ? serializeTask(updatedTask as TaskRecordFromDb) : null,
    message: "Task updated successfully.",
  };
}

export async function toggleTask(
  id: string,
  completed: boolean
): Promise<TaskActionResult<TaskRecord | null>> {
  const currentUser = await getCurrentUserData();

  if (!currentUser) {
    return createErrorResult<TaskRecord | null>(
      "You must be signed in to update tasks."
    );
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

  return {
    success: true,
    data: updatedTask ? serializeTask(updatedTask as TaskRecordFromDb) : null,
    message: "Task updated successfully.",
  };
}

export async function deleteTask(
  id: string
): Promise<TaskActionResult<null>> {
  const currentUser = await getCurrentUserData();

  if (!currentUser) {
    return createErrorResult<null>("You must be signed in to delete tasks.");
  }

  await db
    .delete(tasks)
    .where(and(eq(tasks.id, id), eq(tasks.userId, currentUser.id)));

  revalidatePath("/");

  return {
    success: true,
    data: null,
    message: "Task deleted successfully.",
  };
}
