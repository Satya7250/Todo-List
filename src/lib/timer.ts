export const MAX_MS = 24 * 60 * 60 * 1000;

export interface TimerTaskInput {
  totalTrackedMs: number;
  isTimerRunning: boolean;
  timerStartedAt?: string | Date | null;
}

export function getElapsedMs(task: TimerTaskInput): number {
  if (!task.isTimerRunning || !task.timerStartedAt) {
    return 0;
  }
  const startTime = typeof task.timerStartedAt === 'string'
    ? new Date(task.timerStartedAt).getTime()
    : task.timerStartedAt.getTime();

  if (Number.isNaN(startTime)) {
    return 0;
  }

  return Math.min(Date.now() - startTime, MAX_MS);
}

export function getDisplayMs(task: TimerTaskInput): number {
  return (task.totalTrackedMs || 0) + getElapsedMs(task);
}

export function formatMs(ms: number): string {
  const totalSec = Math.floor(ms / 1000);
  const h = String(Math.floor(totalSec / 3600)).padStart(2, '0');
  const m = String(Math.floor((totalSec % 3600) / 60)).padStart(2, '0');
  const s = String(totalSec % 60).padStart(2, '0');
  return `${h}:${m}:${s}`;
}
