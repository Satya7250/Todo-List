"use server";

import { auth } from "@clerk/nextjs/server";
import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

import { db } from "@/db";
import { projects, tasks, users } from "@/db/schema";

export interface ProjectActionResult<T> {
  success: boolean;
  data: T | null;
  error?: string;
  message?: string;
}

export interface ProjectRecord {
  id: string;
  name: string;
  color: string;
  icon: string;
  isDefault: boolean;
  createdAt?: string;
}

interface ProjectRecordFromDb {
  id: string;
  userId: string;
  name: string;
  color: string;
  icon: string;
  isDefault: boolean;
  createdAt: Date;
}

interface ProjectUpdatePayload {
  name?: string;
  color?: string;
  icon?: string;
}

function createErrorResult<T>(error: string): ProjectActionResult<T> {
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

function serializeProject(project: ProjectRecordFromDb): ProjectRecord {
  return {
    id: project.id,
    name: project.name,
    color: project.color,
    icon: project.icon,
    isDefault: project.isDefault,
    createdAt: project.createdAt?.toISOString(),
  };
}

export async function getProjects(): Promise<ProjectActionResult<ProjectRecord[]>> {
  const currentUser = await getCurrentUserData();

  if (!currentUser) {
    return createErrorResult<ProjectRecord[]>("You must be signed in to view projects.");
  }

  const userProjects = await db
    .select()
    .from(projects)
    .where(eq(projects.userId, currentUser.id))
    .orderBy(projects.createdAt);

  const visibleProjects = userProjects
    .map((project) => serializeProject(project as ProjectRecordFromDb));

  return {
    success: true,
    data: visibleProjects,
    message: "Projects loaded successfully.",
  };
}

export async function createProject(
  name: string,
  color?: string,
  icon?: string
): Promise<ProjectActionResult<ProjectRecord | null>> {
  const trimmedName = name.trim();

  if (!trimmedName) {
    return createErrorResult<ProjectRecord | null>("Project name is required.");
  }

  if (trimmedName.length > 120) {
    return createErrorResult<ProjectRecord | null>(
      "Project name must be 120 characters or less."
    );
  }

  const currentUser = await getCurrentUserData();

  if (!currentUser) {
    return createErrorResult<ProjectRecord | null>(
      "You must be signed in to create projects."
    );
  }

  const [createdProject] = await db
    .insert(projects)
    .values({
      userId: currentUser.id,
      name: trimmedName,
      color: color?.trim() || "#f97316",
      icon: icon?.trim() || "folder",
      isDefault: false,
    })
    .returning();

  revalidatePath("/");

  return {
    success: true,
    data: createdProject ? serializeProject(createdProject as ProjectRecordFromDb) : null,
    message: "Project created successfully.",
  };
}

export async function updateProject(
  id: string,
  updates: ProjectUpdatePayload
): Promise<ProjectActionResult<ProjectRecord | null>> {
  const currentUser = await getCurrentUserData();

  if (!currentUser) {
    return createErrorResult<ProjectRecord | null>(
      "You must be signed in to update projects."
    );
  }

  const projectToUpdate = await db.query.projects.findFirst({
    where: and(eq(projects.id, id), eq(projects.userId, currentUser.id)),
  });

  if (!projectToUpdate) {
    return createErrorResult<ProjectRecord | null>("Project not found.");
  }

  if (projectToUpdate.isDefault && updates.name !== undefined) {
    return createErrorResult<ProjectRecord | null>("The Inbox project cannot be renamed.");
  }

  const nextValues: Record<string, unknown> = {};

  if (updates.name !== undefined) {
    const trimmedName = updates.name.trim();

    if (!trimmedName) {
      return createErrorResult<ProjectRecord | null>("Project name is required.");
    }

    if (trimmedName.length > 120) {
      return createErrorResult<ProjectRecord | null>(
        "Project name must be 120 characters or less."
      );
    }

    nextValues.name = trimmedName;
  }

  if (updates.color !== undefined) {
    nextValues.color = updates.color?.trim() || "#f97316";
  }

  if (updates.icon !== undefined) {
    nextValues.icon = updates.icon?.trim() || "folder";
  }

  if (Object.keys(nextValues).length === 0) {
    return createErrorResult<ProjectRecord | null>("No supported fields were provided.");
  }

  const [updatedProject] = await db
    .update(projects)
    .set(nextValues)
    .where(and(eq(projects.id, id), eq(projects.userId, currentUser.id)))
    .returning();

  revalidatePath("/");

  return {
    success: true,
    data: updatedProject ? serializeProject(updatedProject as ProjectRecordFromDb) : null,
    message: "Project updated successfully.",
  };
}

export async function deleteProject(
  id: string
): Promise<ProjectActionResult<null>> {
  const currentUser = await getCurrentUserData();

  if (!currentUser) {
    return createErrorResult<null>("You must be signed in to delete projects.");
  }

  const projectToDelete = await db.query.projects.findFirst({
    where: and(eq(projects.id, id), eq(projects.userId, currentUser.id)),
  });

  if (!projectToDelete) {
    return createErrorResult<null>("Project not found.");
  }

  if (projectToDelete.isDefault) {
    return createErrorResult<null>("The Inbox project cannot be deleted.");
  }

  const inboxProject = await db.query.projects.findFirst({
    where: and(eq(projects.userId, currentUser.id), eq(projects.isDefault, true)),
  });

  if (!inboxProject) {
    return createErrorResult<null>("Could not find the Inbox project for your account.");
  }

  await db
    .update(tasks)
    .set({ projectId: inboxProject.id })
    .where(and(eq(tasks.projectId, id), eq(tasks.userId, currentUser.id)));

  await db.delete(projects).where(and(eq(projects.id, id), eq(projects.userId, currentUser.id)));

  revalidatePath("/");

  return {
    success: true,
    data: null,
    message: "Project deleted successfully."
  };
}
