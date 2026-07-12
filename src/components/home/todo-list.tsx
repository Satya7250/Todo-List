"use client";

import { useEffect, useState, useTransition } from "react";
import { CalendarDays, Check, PencilLine, Trash2, X } from "lucide-react";

import {
  createTask,
  deleteTask,
  getTasks,
  toggleTask,
  updateTask,
  type TaskRecord,
} from "@/actions/tasks";
import { TaskInput } from "@/components/home/task-input";
import { cn } from "@/lib/utils";

export function TodoList() {
  const [todos, setTodos] = useState<TaskRecord[]>([]);
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState("");
  const [, startTransition] = useTransition();

  useEffect(() => {
    startTransition(async () => {
      const response = await getTasks();

      if (response.success && response.data) {
        setTodos(response.data);
      }
    });
  }, []);

  const handleAdd = async (title: string) => {
    const response = await createTask(title);

    if (response.success && response.data) {
      setTodos((currentTodos) => [response.data as TaskRecord, ...currentTodos]);
    }
  };

  const toggleTodo = async (id: string, completed: boolean) => {
    const response = await toggleTask(id, completed);

    if (response.success && response.data) {
      setTodos((currentTodos) =>
        currentTodos.map((todo) =>
          todo.id === id ? { ...todo, completed: response.data!.completed } : todo
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

  const startEditing = (todo: TaskRecord) => {
    setEditingTaskId(todo.id);
    setEditingTitle(todo.title);
  };

  const saveEdit = async (id: string) => {
    const trimmedTitle = editingTitle.trim();

    if (!trimmedTitle) {
      setEditingTaskId(null);
      setEditingTitle("");
      return;
    }

    const response = await updateTask(id, { title: trimmedTitle });

    if (response.success && response.data) {
      setTodos((currentTodos) =>
        currentTodos.map((todo) =>
          todo.id === id ? { ...todo, title: response.data!.title } : todo
        )
      );
    }

    setEditingTaskId(null);
    setEditingTitle("");
  };

  return (
    <div className="mx-auto mt-8 w-full max-w-2xl">
      <TaskInput className="mx-auto" onAdd={handleAdd} />

      <div className="mt-6 rounded-2xl border border-border/50 bg-background/70 p-4 shadow-sm shadow-black/5 backdrop-blur-xl dark:bg-zinc-900/80">
        {todos.length === 0 ? (
          <div className="flex min-h-28 items-center justify-center rounded-2xl border border-dashed border-border/60 bg-background/40 px-6 py-10 text-center">
            <p className="text-sm text-muted-foreground">
              No tasks yet. Add your first task above.
            </p>
          </div>
        ) : (
          <ul className="space-y-3">
            {todos.map((todo) => (
              <li
                key={todo.id}
                className="flex items-center gap-3 rounded-xl border border-border/50 bg-background/50 px-4 py-3 transition-colors hover:bg-accent/50"
              >
                <input
                  type="checkbox"
                  checked={todo.completed}
                  onChange={() => {
                    void toggleTodo(todo.id, !todo.completed);
                  }}
                  className="h-4 w-4 rounded border-border text-orange-500 focus:ring-orange-500"
                  aria-label={`Mark ${todo.title} as ${todo.completed ? "incomplete" : "complete"}`}
                />

                <div className="min-w-0 flex-1">
                  {editingTaskId === todo.id ? (
                    <div className="flex items-center gap-2">
                      <input
                        value={editingTitle}
                        onChange={(event) => setEditingTitle(event.target.value)}
                        onKeyDown={(event) => {
                          if (event.key === "Enter") {
                            void saveEdit(todo.id);
                          }

                          if (event.key === "Escape") {
                            setEditingTaskId(null);
                            setEditingTitle("");
                          }
                        }}
                        autoFocus
                        className="w-full rounded-lg border border-border/60 bg-background/80 px-3 py-2 text-sm text-foreground outline-none focus:border-orange-500"
                      />

                      <button
                        type="button"
                        onClick={() => {
                          void saveEdit(todo.id);
                        }}
                        className="rounded-lg p-2 text-green-600 transition-colors hover:bg-accent"
                        aria-label={`Save ${todo.title}`}
                      >
                        <Check className="h-4 w-4" />
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setEditingTaskId(null);
                          setEditingTitle("");
                        }}
                        className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-accent"
                        aria-label={`Cancel editing ${todo.title}`}
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <p
                        className={cn(
                          "text-sm font-medium text-foreground",
                          todo.completed && "text-muted-foreground line-through"
                        )}
                      >
                        {todo.title}
                      </p>

                      <button
                        type="button"
                        onClick={() => startEditing(todo)}
                        className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                        aria-label={`Edit ${todo.title}`}
                      >
                        <PencilLine className="h-4 w-4" />
                      </button>
                    </div>
                  )}

                  {todo.dueDate ? (
                    <div className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                      <CalendarDays className="h-3.5 w-3.5" />
                      <span>{new Date(todo.dueDate).toLocaleDateString()}</span>
                    </div>
                  ) : null}
                </div>

                <button
                  type="button"
                  onClick={() => {
                    void handleDelete(todo.id);
                  }}
                  className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-accent hover:text-red-600"
                  aria-label={`Delete ${todo.title}`}
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
