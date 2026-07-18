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
import { MAX_MS } from "@/lib/timer";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string; action: string }> }
) {
  try {
    const { id, action } = await params;
    const currentUser = await getCurrentUserData();

    if (!currentUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!["start", "pause", "resume", "complete", "restart"].includes(action)) {
      return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }

    // Run inside database transaction
    const resultTask = await db.transaction(async (tx) => {
      // 1. Fetch task and check ownership
      const [dbTask] = await tx
        .select()
        .from(tasks)
        .where(and(eq(tasks.id, id), eq(tasks.userId, currentUser.id)))
        .limit(1);

      if (!dbTask) {
        throw new Error("Task not found or unauthorized");
      }

      let currentTask = dbTask as TaskRecordFromDb;

      // 2. If timer is running, enforce the 24-hour limit before applying action
      if (currentTask.isTimerRunning && currentTask.timerStartedAt) {
        const elapsed = Date.now() - new Date(currentTask.timerStartedAt).getTime();
        if (elapsed >= MAX_MS) {
          const [updated] = await tx
            .update(tasks)
            .set({
              totalTrackedMs: currentTask.totalTrackedMs + MAX_MS,
              isTimerRunning: false,
              timerStartedAt: null,
              updatedAt: new Date(),
            })
            .where(eq(tasks.id, id))
            .returning();
          if (updated) {
            currentTask = updated as TaskRecordFromDb;
          }
        }
      }

      // 3. Perform the requested action
      let updateValues: Record<string, any> = {
        updatedAt: new Date(),
      };

      if (action === "start" || action === "resume") {
        if (!currentTask.isTimerRunning) {
          updateValues.isTimerRunning = true;
          updateValues.timerStartedAt = new Date();
        }
      } else if (action === "restart") {
        updateValues.totalTrackedMs = 0;
        updateValues.isTimerRunning = true;
        updateValues.timerStartedAt = new Date();
      } else if (action === "pause") {
        if (currentTask.isTimerRunning && currentTask.timerStartedAt) {
          const elapsed = Date.now() - new Date(currentTask.timerStartedAt).getTime();
          const cappedElapsed = Math.min(elapsed, MAX_MS);
          updateValues.totalTrackedMs = currentTask.totalTrackedMs + cappedElapsed;
          updateValues.isTimerRunning = false;
          updateValues.timerStartedAt = null;
        }
      } else if (action === "complete") {
        if (currentTask.isTimerRunning && currentTask.timerStartedAt) {
          const elapsed = Date.now() - new Date(currentTask.timerStartedAt).getTime();
          const cappedElapsed = Math.min(elapsed, MAX_MS);
          updateValues.totalTrackedMs = currentTask.totalTrackedMs + cappedElapsed;
        }
        updateValues.isTimerRunning = false;
        updateValues.timerStartedAt = null;
        updateValues.completed = true;
      }

      if (Object.keys(updateValues).length > 1) {
        const [updated] = await tx
          .update(tasks)
          .set(updateValues)
          .where(eq(tasks.id, id))
          .returning();
        return updated as TaskRecordFromDb;
      }

      return currentTask;
    });

    return NextResponse.json(serializeTask(resultTask));
  } catch (error: any) {
    console.error("Timer Action Error:", error);
    const status = error.message.includes("not found") ? 404 : 500;
    return NextResponse.json({ error: error.message || "Server Error" }, { status });
  }
}
