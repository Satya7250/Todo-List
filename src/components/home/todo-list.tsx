"use client";

import { useEffect, useState, useTransition } from "react";
import { ChevronDown, ChevronUp, ListChecks, Loader2 } from "lucide-react";

import {
  createTask,
  deleteTask,
  getTasks,
  toggleTask,
  updateTask,
  type TaskRecord,
} from "@/actions/tasks";
import { TaskInput } from "@/components/home/task-input";
import { TaskItem } from "@/components/tasks/TaskItem";
import { cn } from "@/lib/utils";

interface TodoListProps {
  selectedProjectId: string | null;
}

export function TodoList({ selectedProjectId }: TodoListProps) {
  const [todos, setTodos] = useState<TaskRecord[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [showCompleted, setShowCompleted] = useState(false);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    setShowCompleted(false);

    if (!selectedProjectId) {
      setTodos([]);
      return;
    }

    startTransition(async () => {
      const response = await getTasks({ projectId: selectedProjectId });
      if (response.success && response.data) {
        setTodos(response.data);
        setError(null);
      } else {
        setError("Couldn't load tasks. Try refreshing.");
      }
    });
  }, [selectedProjectId]);

  const handleAdd = async (title: string, dueDate: Date | null, priority: number) => {
    const response = await createTask(title, dueDate, priority, selectedProjectId);
    if (response.success && response.data) {
      setTodos((currentTodos) => [response.data as TaskRecord, ...currentTodos]);
    }
  };

  const toggleTodo = async (id: string, completed: boolean) => {
    const response = await toggleTask(id, completed);

    if (response.success && response.data) {
      setTodos((currentTodos) =>
        currentTodos.map((todo) =>
          todo.id === id ? (response.data as TaskRecord) : todo
        )
      );
    }
  };

  const handleDelete = async (id: string) => {
    const response = await deleteTask(id);

    if (response.success) {
      setTodos((currentTodos) => currentTodos.filter((todo) => todo.id !== id));
    }
  };

  const handleUpdate = async (
    id: string,
    updates: { title: string; dueDate: Date | null; priority: number }
  ) => {
    const response = await updateTask(id, updates);

    if (response.success && response.data) {
      setTodos((currentTodos) =>
        currentTodos.map((todo) =>
          todo.id === id ? (response.data as TaskRecord) : todo
        )
      );
    }
  };

  const activeTodos = todos.filter((t) => !t.completed);
  const completedTodos = todos.filter((t) => t.completed);
  const total = todos.length;
  const doneCount = completedTodos.length;

  const renderItem = (todo: TaskRecord) => (
    <TaskItem
      key={todo.id}
      todo={todo}
      toggleTodo={toggleTodo}
      handleDelete={handleDelete}
      onUpdate={handleUpdate}
    />
  );

  return (
    <div className="mx-auto mt-8 w-full max-w-5xl">
      <div className="mb-6 space-y-4">
        <TaskInput className="mx-auto" onAdd={handleAdd} />

        <div className="rounded-2xl border border-border/50 bg-background/70 p-4 shadow-sm shadow-black/5 backdrop-blur-xl dark:bg-zinc-900/80">
          {/* Header: progress summary */}
          {total > 0 && (
            <div className="mb-4 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <ListChecks className="h-4 w-4" />
                <span>
                  {doneCount} of {total} done
                </span>
              </div>
              <div className="h-1.5 w-28 overflow-hidden rounded-full bg-accent">
                <div
                  className="h-full rounded-full bg-orange-500 transition-all duration-300"
                  style={{ width: total ? `${(doneCount / total) * 100}%` : "0%" }}
                />
              </div>
            </div>
          )}

          {error && (
            <p role="alert" className="mb-3 text-xs text-red-500">
              {error}
            </p>
          )}

          {/* Loading state (first fetch, nothing to show yet) */}
          {isPending && todos.length === 0 && !error ? (
            <div className="space-y-2">
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className="h-14 animate-pulse rounded-xl bg-accent/60"
                  style={{ animationDelay: `${i * 80}ms` }}
                />
              ))}
            </div>
          ) : !selectedProjectId ? (
            <div className="flex min-h-28 items-center justify-center rounded-2xl border border-dashed border-border/60 bg-background/40 px-6 py-10 text-center">
              <p className="text-sm text-muted-foreground">
                Select a project to see its tasks.
              </p>
            </div>
          ) : total === 0 ? (
            <div className="flex min-h-28 items-center justify-center rounded-2xl border border-dashed border-border/60 bg-background/40 px-6 py-10 text-center">
              <p className="text-sm text-muted-foreground">
                No tasks yet. Add your first task above.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {activeTodos.length > 0 ? (
                <ul className="space-y-3">{activeTodos.map(renderItem)}</ul>
              ) : (
                <div className="flex min-h-20 items-center justify-center rounded-2xl border border-dashed border-border/60 bg-background/40 px-6 py-8 text-center">
                  <p className="text-sm text-muted-foreground">
                    All caught up. Nice work!
                  </p>
                </div>
              )}

              {completedTodos.length > 0 && (
                <div className={cn(activeTodos.length > 0 && "pt-1")}>
                  <button
                    type="button"
                    onClick={() => setShowCompleted((v) => !v)}
                    className="flex w-full items-center justify-between rounded-xl px-2 py-2 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                  >
                    <span>Completed ({completedTodos.length})</span>
                    {showCompleted ? (
                      <ChevronUp className="h-4 w-4" />
                    ) : (
                      <ChevronDown className="h-4 w-4" />
                    )}
                  </button>

                  {showCompleted && (
                    <ul className="mt-2 space-y-3">{completedTodos.map(renderItem)}</ul>
                  )}
                </div>
              )}
            </div>
          )}

          {isPending && todos.length > 0 && (
            <div className="mt-3 flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
              <Loader2 className="h-3 w-3 animate-spin" />
              <span>Refreshing…</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}