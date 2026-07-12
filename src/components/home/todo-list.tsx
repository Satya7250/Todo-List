"use client";

import { useEffect, useState, useTransition } from "react";
import { CalendarDays } from "lucide-react";

import { createTask, getTasks, toggleTask, type TaskRecord } from "@/actions/tasks";
import { TaskInput } from "@/components/home/task-input";
import { cn } from "@/lib/utils";

export function TodoList() {
  const [todos, setTodos] = useState<TaskRecord[]>([]);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    startTransition(async () => {
      const tasksFromDb = await getTasks();
      setTodos(tasksFromDb);
    });
  }, []);

  const handleAdd = async (title: string) => {
    const createdTask = await createTask(title);

    if (createdTask) {
      setTodos((currentTodos) => [createdTask, ...currentTodos]);
    }
  };

  const toggleTodo = async (id: string, completed: boolean) => {
    const updatedTask = await toggleTask(id, completed);

    if (updatedTask) {
      setTodos((currentTodos) =>
        currentTodos.map((todo) =>
          todo.id === id ? { ...todo, completed: updatedTask.completed } : todo
        )
      );
    }
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
                  onChange={() => toggleTodo(todo.id, !todo.completed)}
                  className="h-4 w-4 rounded border-border text-orange-500 focus:ring-orange-500"
                  aria-label={`Mark ${todo.title} as ${todo.completed ? "incomplete" : "complete"}`}
                />

                <div className="min-w-0 flex-1">
                  <p
                    className={cn(
                      "text-sm font-medium text-foreground",
                      todo.completed && "text-muted-foreground line-through"
                    )}
                  >
                    {todo.title}
                  </p>

                  {todo.dueDate ? (
                    <div className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                      <CalendarDays className="h-3.5 w-3.5" />
                      <span>{new Date(todo.dueDate).toLocaleDateString()}</span>
                    </div>
                  ) : null}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
