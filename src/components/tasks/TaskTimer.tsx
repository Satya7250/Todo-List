import { useEffect, useRef, useState } from "react";
import { Clock3, Play, Pause, RefreshCw, Loader2 } from "lucide-react";

import { formatMs, getDisplayMs } from "../../lib/timer";
import { type TaskRecord } from "@/actions/tasks";

type TimerAction = "start" | "pause" | "resume" | "restart";

export default function TaskTimer({ task }: { task: TaskRecord }) {
  const [currentTask, setCurrentTask] = useState(task);
  const [displayMs, setDisplayMs] = useState(() => getDisplayMs(task));
  const [pendingAction, setPendingAction] = useState<TimerAction | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Keep a ref in sync so the ticking interval doesn't need to be
  // torn down and recreated every time currentTask changes.
  const currentTaskRef = useRef(currentTask);
  currentTaskRef.current = currentTask;

  useEffect(() => {
    setCurrentTask(task);
    setDisplayMs(getDisplayMs(task));
  }, [task]);

  // Single stable interval for the whole component lifetime.
  useEffect(() => {
    const interval = setInterval(() => {
      setDisplayMs(getDisplayMs(currentTaskRef.current));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const refreshTask = async (signal?: AbortSignal) => {
    const res = await fetch(`/api/tasks/${currentTask.id}`, { signal });
    if (!res.ok) throw new Error(`Failed to refresh task (${res.status})`);
    const updated: TaskRecord = await res.json();
    setCurrentTask(updated);
    setDisplayMs(getDisplayMs(updated));
  };

  const handleAction = async (action: TimerAction) => {
    if (pendingAction || currentTask.completed) return; // guard against double-clicks / overlapping requests / completed tasks
    setPendingAction(action);
    setError(null);

    const controller = new AbortController();
    try {
      const res = await fetch(`/api/tasks/${currentTask.id}/timer/${action}`, {
        method: "POST",
        signal: controller.signal,
      });
      if (!res.ok) throw new Error(`Action "${action}" failed (${res.status})`);
      await refreshTask(controller.signal);
    } catch (err) {
      if ((err as { name?: string }).name !== "AbortError") {
        setError(`Couldn't ${action} the timer. Try again.`);
      }
    } finally {
      setPendingAction(null);
    }
  };

  const iconButton = (
    action: TimerAction,
    icon: React.ReactNode,
    title: string,
    colorClasses: string
  ) => {
    const locked = currentTask.completed;
    return (
      <button
        onClick={() => void handleAction(action)}
        disabled={pendingAction !== null || locked}
        title={locked ? "Task is completed" : title}
        aria-label={locked ? "Task is completed" : title}
        className={`flex h-9 w-9 items-center justify-center rounded-full border transition disabled:cursor-not-allowed disabled:opacity-50 ${
          locked ? "border-border/50 bg-accent/40 text-muted-foreground" : colorClasses
        }`}
      >
        {pendingAction === action ? (
          <Loader2 size={16} className="animate-spin" />
        ) : (
          icon
        )}
      </button>
    );
  };

  const renderButtons = () => {
    const notStarted = !currentTask.isTimerRunning && currentTask.totalTrackedMs === 0;

    if (notStarted) {
      return iconButton(
        "start",
        <Play size={16} fill="currentColor" />,
        "Start",
        "border-green-500/30 bg-green-500/10 text-green-500 hover:bg-green-500/20"
      );
    }

    if (currentTask.isTimerRunning) {
      return (
        <div className="flex items-center gap-2">
          {iconButton(
            "pause",
            <Pause size={16} fill="currentColor" />,
            "Pause",
            "border-yellow-500/30 bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20"
          )}
          {iconButton(
            "restart",
            <RefreshCw size={16} />,
            "Restart",
            "border-blue-500/30 bg-blue-500/10 text-blue-500 hover:bg-blue-500/20"
          )}
        </div>
      );
    }

    // Paused
    return (
      <div className="flex items-center gap-2">
        {iconButton(
          "resume",
          <Play size={16} fill="currentColor" />,
          "Resume",
          "border-green-500/30 bg-green-500/10 text-green-500 hover:bg-green-500/20"
        )}
        {iconButton(
          "restart",
          <RefreshCw size={16} />,
          "Restart",
          "border-blue-500/30 bg-blue-500/10 text-blue-500 hover:bg-blue-500/20"
        )}
      </div>
    );
  };

  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center gap-4">
        {/* Status + Timer */}
        <div className="flex items-center gap-2">
          <span
            className={`h-2 w-2 rounded-full ${
              currentTask.isTimerRunning
                ? "bg-green-500"
                : currentTask.totalTrackedMs > 0
                  ? "bg-yellow-500"
                  : "bg-gray-400"
            }`}
          />
          <Clock3 className="h-4 w-4 text-muted-foreground" />
          <span
            className={`font-mono text-sm font-semibold ${
              currentTask.isTimerRunning ? "text-green-500" : "text-muted-foreground"
            }`}
          >
            {formatMs(displayMs)}
          </span>
        </div>

        {/* Buttons */}
        {renderButtons()}
      </div>

      {error && (
        <p role="alert" className="text-xs text-red-500">
          {error}
        </p>
      )}
    </div>
  );
}