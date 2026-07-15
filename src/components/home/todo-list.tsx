"use client";

import { useEffect, useState, useTransition } from "react";
import { CalendarDays, Check, PencilLine, Trash2, X, Calendar as CalendarIcon, Flag as FlagIcon } from "lucide-react";

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
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";

const PRIORITIES = [
  { value: 0, label: "None", color: "text-muted-foreground" },
  { value: 1, label: "Low", color: "text-blue-500" },
  { value: 2, label: "Medium", color: "text-amber-500" },
  { value: 3, label: "High", color: "text-orange-500" },
  { value: 4, label: "Urgent", color: "text-red-500" },
] as const;

function getPriorityClass(priority: number) {
  switch (priority) {
    case 1:
      return "text-blue-500 bg-blue-500/10";
    case 2:
      return "text-amber-500 bg-amber-500/10";
    case 3:
      return "text-orange-500 bg-orange-500/10";
    case 4:
      return "text-red-500 bg-red-500/10";
    default:
      return "text-muted-foreground hover:text-foreground";
  }
}

interface TodoListProps {
  selectedProjectId: string | null;
}

export function TodoList({ selectedProjectId }: TodoListProps) {
  const [todos, setTodos] = useState<TaskRecord[]>([]);
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState("");
  const [editingDueDate, setEditingDueDate] = useState<Date | null>(null);
  const [editingPriority, setEditingPriority] = useState<number>(0);
  const [isEditCalendarOpen, setIsEditCalendarOpen] = useState(false);
  const [isEditPriorityOpen, setIsEditPriorityOpen] = useState(false);
  const [, startTransition] = useTransition();

  useEffect(() => {
    if (!selectedProjectId) return;

    startTransition(async () => {
      const response = await getTasks({ projectId: selectedProjectId });
      if (response.success && response.data) {
        setTodos(response.data);
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
    setEditingDueDate(todo.dueDate ? new Date(todo.dueDate) : null);
    setEditingPriority(todo.priority);
  };

  const saveEdit = async (id: string) => {
    const trimmedTitle = editingTitle.trim();

    if (!trimmedTitle) {
      setEditingTaskId(null);
      setEditingTitle("");
      setEditingDueDate(null);
      setEditingPriority(0);
      return;
    }

    const response = await updateTask(id, {
      title: trimmedTitle,
      dueDate: editingDueDate,
      priority: editingPriority,
    });

    if (response.success && response.data) {
      setTodos((currentTodos) =>
        currentTodos.map((todo) =>
          todo.id === id
            ? {
              ...todo,
              title: response.data!.title,
              dueDate: response.data!.dueDate,
              priority: response.data!.priority,
            }
            : todo
        )
      );
    }

    setEditingTaskId(null);
    setEditingTitle("");
    setEditingDueDate(null);
    setEditingPriority(0);
  };

  return (
    <div className="mx-auto mt-8 w-full max-w-5xl">
      <div className="mb-6 space-y-4">
        <div className="space-y-4">
          <TaskInput className="mx-auto" onAdd={handleAdd} />

          <div className="rounded-2xl border border-border/50 bg-background/70 p-4 shadow-sm shadow-black/5 backdrop-blur-xl dark:bg-zinc-900/80">
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
                    className="flex items-start gap-3 rounded-xl border border-border/50 bg-background/50 px-4 py-3 transition-colors hover:bg-accent/50"
                  >
                    <input
                      type="checkbox"
                      checked={todo.completed}
                      onChange={() => {
                        void toggleTodo(todo.id, !todo.completed);
                      }}
                      className="mt-2.5 h-4 w-4 shrink-0 rounded border-border text-orange-500 focus:ring-orange-500"
                      aria-label={`Mark ${todo.title} as ${todo.completed ? "incomplete" : "complete"}`}
                    />

                    <div className="min-w-0 flex-1">
                      {editingTaskId === todo.id ? (
                        <div className="flex w-full min-w-0 flex-col gap-2">
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
                                setEditingDueDate(null);
                                setEditingPriority(0);
                              }
                            }}
                            autoFocus
                            className="w-full min-w-0 rounded-lg border border-border/60 bg-background/80 px-3 py-2 text-sm text-foreground outline-none focus:border-orange-500"
                          />

                          <div className="flex min-w-0 items-center justify-between gap-1">
                            <div className="flex min-w-0 items-center gap-1">
                              <Popover open={isEditCalendarOpen} onOpenChange={setIsEditCalendarOpen}>
                                <PopoverTrigger asChild>
                                  <button
                                    type="button"
                                    className={cn(
                                      "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl transition-colors hover:bg-accent",
                                      editingDueDate
                                        ? "bg-orange-500/10 text-orange-500 hover:text-orange-600"
                                        : "text-muted-foreground hover:text-foreground"
                                    )}
                                    aria-label="Set due date"
                                  >
                                    <CalendarIcon className="h-4 w-4" />
                                  </button>
                                </PopoverTrigger>
                                <PopoverContent
                                  className="flex w-[min(90vw,20rem)] flex-col p-0 animate-none"
                                  align="start"
                                  sideOffset={8}
                                  avoidCollisions={false}
                                >
                                  <Calendar
                                    mode="single"
                                    selected={editingDueDate || undefined}
                                    onSelect={(date) => {
                                      setEditingDueDate(date || null);
                                      setIsEditCalendarOpen(false);
                                    }}
                                  />
                                  {editingDueDate && (
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setEditingDueDate(null);
                                        setIsEditCalendarOpen(false);
                                      }}
                                      className="w-full text-center text-xs py-2 font-medium hover:bg-accent transition-colors rounded-b-md text-red-500 border-t border-border"
                                    >
                                      Clear date
                                    </button>
                                  )}
                                </PopoverContent>
                              </Popover>

                              <Popover open={isEditPriorityOpen} onOpenChange={setIsEditPriorityOpen}>
                                <PopoverTrigger asChild>
                                  <button
                                    type="button"
                                    className={cn(
                                      "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl transition-colors hover:bg-accent",
                                      getPriorityClass(editingPriority)
                                    )}
                                    aria-label="Set priority"
                                  >
                                    <FlagIcon className={cn("h-4 w-4", editingPriority > 0 && "fill-current")} />
                                  </button>
                                </PopoverTrigger>
                                <PopoverContent
                                  className="flex w-40 flex-col gap-0.5 p-1 animate-none"
                                  align="start"
                                  sideOffset={8}
                                  avoidCollisions={false}
                                >
                                  {PRIORITIES.map((p) => (
                                    <button
                                      key={p.value}
                                      type="button"
                                      onClick={() => {
                                        setEditingPriority(p.value);
                                        setIsEditPriorityOpen(false);
                                      }}
                                      className={cn(
                                        "flex items-center gap-2 w-full text-left px-2 py-1.5 text-sm rounded-md transition-colors hover:bg-accent",
                                        editingPriority === p.value ? "bg-accent/80 font-medium" : ""
                                      )}
                                    >
                                      <FlagIcon className={cn("h-3.5 w-3.5", p.value > 0 && "fill-current", p.color)} />
                                      <span className="text-xs text-foreground font-medium">{p.label}</span>
                                    </button>
                                  ))}
                                </PopoverContent>
                              </Popover>
                            </div>

                            <div className="flex shrink-0 items-center gap-1">
                              <button
                                type="button"
                                onClick={() => {
                                  void saveEdit(todo.id);
                                }}
                                className="rounded-lg p-2 text-green-600 transition-colors hover:bg-accent shrink-0"
                                aria-label={`Save ${todo.title}`}
                              >
                                <Check className="h-4 w-4" />
                              </button>

                              <button
                                type="button"
                                onClick={() => {
                                  setEditingTaskId(null);
                                  setEditingTitle("");
                                  setEditingDueDate(null);
                                  setEditingPriority(0);
                                }}
                                className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-accent shrink-0"
                                aria-label={`Cancel editing ${todo.title}`}
                              >
                                <X className="h-4 w-4" />
                              </button>
                            </div>
                          </div>
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

                      {(todo.dueDate || todo.priority > 0) && (
                        <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                          {todo.dueDate ? (
                            <div className="flex items-center gap-1">
                              <CalendarDays className="h-3.5 w-3.5" />
                              <span>{new Date(todo.dueDate).toLocaleDateString()}</span>
                            </div>
                          ) : null}
                          {todo.priority > 0 ? (
                            <div className="flex items-center gap-1">
                              <FlagIcon className={cn("h-3.5 w-3.5 fill-current", getPriorityClass(todo.priority).split(" ")[0])} />
                              <span>{PRIORITIES.find((p) => p.value === todo.priority)?.label} Priority</span>
                            </div>
                          ) : null}
                        </div>
                      )}
                    </div>

                    {editingTaskId !== todo.id && (
                      <button
                        type="button"
                        onClick={() => {
                          void handleDelete(todo.id);
                        }}
                        className="mt-1 shrink-0 rounded-lg p-2 text-muted-foreground transition-colors hover:bg-accent hover:text-red-600"
                        aria-label={`Delete ${todo.title}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}