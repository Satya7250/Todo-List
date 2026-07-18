import { NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { tasks } from "@/db/schema";
import {
  getCurrentUserData,
  checkAndEnforce24HourLimit,
} from "@/actions/tasks";
import {
  serializeTask,
  type TaskRecordFromDb,
} from "@/lib/tasks";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const currentUser = await getCurrentUserData();

    if (!currentUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const [dbTask] = await db
      .select()
      .from(tasks)
      .where(and(eq(tasks.id, id), eq(tasks.userId, currentUser.id)))
      .limit(1);

    if (!dbTask) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    const validatedTask = await checkAndEnforce24HourLimit(dbTask as TaskRecordFromDb);

    return NextResponse.json(serializeTask(validatedTask));
  } catch (error: any) {
    console.error("GET Task API Error:", error);
    return NextResponse.json({ error: error.message || "Server Error" }, { status: 500 });
  }
}
