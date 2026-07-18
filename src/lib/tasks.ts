export interface TaskRecordFromDb {
  id: string;
  userId: string;
  projectId: string;
  title: string;
  description: string | null;
  completed: boolean;
  priority: number;
  dueDate: Date | null;
  totalTrackedMs: number;
  isTimerRunning: boolean;
  timerStartedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface TaskRecord {
  id: string;
  title: string;
  description?: string | null;
  completed: boolean;
  priority: number;
  dueDate?: string | null;
  totalTrackedMs: number;
  isTimerRunning: boolean;
  timerStartedAt?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export function serializeTask(task: TaskRecordFromDb): TaskRecord {
  return {
    id: task.id,
    title: task.title,
    description: task.description,
    completed: task.completed,
    priority: task.priority,
    dueDate: task.dueDate ? task.dueDate.toISOString() : null,
    totalTrackedMs: task.totalTrackedMs,
    isTimerRunning: task.isTimerRunning,
    timerStartedAt: task.timerStartedAt ? task.timerStartedAt.toISOString() : null,
    createdAt: task.createdAt ? task.createdAt.toISOString() : undefined,
    updatedAt: task.updatedAt ? task.updatedAt.toISOString() : undefined,
  };
}
