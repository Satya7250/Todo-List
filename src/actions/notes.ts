"use server";

import { auth } from "@clerk/nextjs/server";
// Correct imports for Drizzle ORM
import { and, desc, eq } from "drizzle-orm";

import { revalidatePath } from "next/cache";

import { db } from "@/db";
import { notes, users } from "@/db/schema";

export interface NoteRecord {
    id: string;
    title: string;
    content: string;
    createdAt: string;
    updatedAt?: string;
}

export interface NoteActionResult<T> {
    success: boolean;
    data: T | null;
    error?: string;
    message?: string;
}

function createErrorResult<T>(error: string): NoteActionResult<T> {
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

function serializeNote(note: typeof notes.$inferSelect): NoteRecord {
    return {
        id: note.id,
        title: note.title,
        content: note.content,
        createdAt: note.createdAt.toISOString(),
        updatedAt: note.updatedAt.toISOString(),
    };
}

export async function getNotes(): Promise<NoteActionResult<NoteRecord[]>> {
    const currentUser = await getCurrentUserData();

    if (!currentUser) {
        return createErrorResult("You must be signed in to view notes.");
    }

    const userNotes = await db
        .select()
        .from(notes)
        .where(eq(notes.userId, currentUser.id))
        .orderBy(desc(notes.updatedAt));

    return {
        success: true,
        data: userNotes.map(serializeNote),
        message: "Notes loaded successfully.",
    };
}

export async function createNote(
    title: string,
    content: string
): Promise<NoteActionResult<NoteRecord>> {
    const currentUser = await getCurrentUserData();

    if (!currentUser) {
        return createErrorResult("You must be signed in to create notes.");
    }

    const [createdNote] = await db
        .insert(notes)
        .values({
            userId: currentUser.id,
            title: title.trim() || "Untitled",
            content,
        })
        .returning();

    revalidatePath("/");

    return {
        success: true,
        data: serializeNote(createdNote),
        message: "Note created successfully.",
    };
}

export async function updateNote(
    id: string,
    updates: {
        title: string;
        content: string;
    }
): Promise<NoteActionResult<NoteRecord>> {
    const currentUser = await getCurrentUserData();

    if (!currentUser) {
        return createErrorResult("You must be signed in to update notes.");
    }

    const [updatedNote] = await db
        .update(notes)
        .set({
            title: updates.title.trim() || "Untitled",
            content: updates.content,
            updatedAt: new Date(),
        })
        .where(
            and(
                eq(notes.id, id),
                eq(notes.userId, currentUser.id)
            )
        )
        .returning();

    if (!updatedNote) {
        return createErrorResult("Note not found.");
    }

    revalidatePath("/");

    return {
        success: true,
        data: serializeNote(updatedNote),
        message: "Note updated successfully.",
    };
}

export async function deleteNote(
    id: string
): Promise<NoteActionResult<null>> {
    const currentUser = await getCurrentUserData();

    if (!currentUser) {
        return createErrorResult("You must be signed in to delete notes.");
    }

    await db
        .delete(notes)
        .where(
            and(
                eq(notes.id, id),
                eq(notes.userId, currentUser.id)
            )
        );

    revalidatePath("/");

    return {
        success: true,
        data: null,
        message: "Note deleted successfully.",
    };
}