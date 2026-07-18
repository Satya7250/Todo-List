import { useMemo, useState } from "react";
import {
  CalendarDays,
  Check,
  Flag as FlagIcon,
  Loader2,
  MoreVertical,
  PencilLine,
  Trash2,
  X,
} from "lucide-react";

import { type TaskRecord } from "@/actions/tasks";
import { cn } from "@/lib/utils";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

import TaskTimer from "@/components/tasks/TaskTimer";
import {
  PRIORITIES,
  getPriorityClass,
  PriorityPicker,
  CalendarPicker,
} from "@/components/tasks/task-controls";

function sameDay(a: Date | null, b: Date | null) {
  if (a === b) return true;
  if (!a || !b) return false;
  return a.getTime() === b.getTime();
}

/* -------------------------------------------------
   Main component
------------------------------------------------- */
interface TaskItemProps {
  todo: TaskRecord;
  toggleTodo: (id: string, completed: boolean) => Promise<void>;
  handleDelete: (id: string) => Promise<void>;
  onUpdate: (
    id: string,
    updates: { title: string; dueDate: Date | null; priority: number }
  ) => Promise<void>;
}

export function TaskItem({
  todo,
  toggleTodo,
  handleDelete,
  onUpdate,
}: TaskItemProps) {
  /* ---------- editing state ---------- */
  const [isEditing, setIsEditing] = useState(false);
  const [editingTitle, setEditingTitle] = useState(todo.title);
  const [editingDueDate, setEditingDueDate] = useState<Date | null>(
    todo.dueDate ? new Date(todo.dueDate) : null
  );
  const [editingPriority, setEditingPriority] = useState(todo.priority);

  const [calendarOpen, setCalendarOpen] = useState(false);
  const [priorityOpen, setPriorityOpen] = useState(false);

  /* ---------- async status ---------- */
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isToggling, setIsToggling] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const busy = isSaving || isDeleting || isToggling;

  const currentDueDate = todo.dueDate ? new Date(todo.dueDate) : null;
  const isDirty = useMemo(
    () =>
      editingTitle.trim() !== todo.title ||
      !sameDay(editingDueDate, currentDueDate) ||
      editingPriority !== todo.priority,
    // currentDueDate is derived fresh each render from todo.dueDate, safe to include via todo.dueDate
    [editingTitle, editingDueDate, editingPriority, todo.title, todo.dueDate, todo.priority]
  );

  /* ---------- helpers ---------- */
  const startEditing = () => {
    setError(null);
    setEditingTitle(todo.title);
    setEditingDueDate(todo.dueDate ? new Date(todo.dueDate) : null);
    setEditingPriority(todo.priority);
    setIsEditing(true);
  };

  const cancelEdit = () => {
    setError(null);
    setIsEditing(false);
  };

  const saveEdit = async () => {
    const trimmed = editingTitle.trim();
    if (!trimmed) {
      setError("Title can't be empty.");
      return;
    }
    if (!isDirty) {
      setIsEditing(false);
      return;
    }

    setIsSaving(true);
    setError(null);
    try {
      await onUpdate(todo.id, {
        title: trimmed,
        dueDate: editingDueDate,
        priority: editingPriority,
      });
      setIsEditing(false);
    } catch {
      setError("Couldn't save changes. Try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const onTitleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      void saveEdit();
    } else if (e.key === "Escape") {
      e.preventDefault();
      cancelEdit();
    }
  };

  const onToggle = async () => {
    if (isToggling) return;
    setIsToggling(true);
    setError(null);
    try {
      await toggleTodo(todo.id, !todo.completed);
    } catch {
      setError("Couldn't update task status.");
    } finally {
      setIsToggling(false);
    }
  };

  const onDelete = async () => {
    if (isDeleting) return;
    if (!window.confirm(`Delete "${todo.title}"? This can't be undone.`)) return;

    setIsDeleting(true);
    setError(null);
    try {
      await handleDelete(todo.id);
    } catch {
      setError("Couldn't delete task.");
      setIsDeleting(false);
    }
    // On success the item is expected to unmount via parent state update,
    // so we intentionally don't reset isDeleting there.
  };

  /* ---------- UI ---------- */
  return (
    <li
      className={cn(
        "flex flex-col gap-2 rounded-xl border border-gray-200 bg-white p-4 transition-colors hover:bg-gray-100 dark:border-orange-500/30 dark:bg-gray-900/30 dark:hover:bg-gray-800/30",
        isDeleting && "opacity-50 pointer-events-none"
      )}
      aria-busy={busy}
    >
      {/* Row 1 – Checkbox, Title / Editing, More menu */}
      <div className="flex w-full items-start justify-between gap-2">
        <div className="flex min-w-0 flex-1 items-start gap-2">
          <span className="mt-1.5 flex h-4 w-4 shrink-0 items-center justify-center">
            {isToggling ? (
              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
            ) : (
              <input
                type="checkbox"
                checked={todo.completed}
                onChange={() => void onToggle()}
                disabled={isToggling}
                className="h-4 w-4 rounded border-gray-600 text-orange-500 focus:ring-orange-500"
                aria-label={`Mark ${todo.title} as ${todo.completed ? "incomplete" : "complete"}`}
              />
            )}
          </span>

          {isEditing ? (
            <div className="flex min-w-0 flex-1 flex-col gap-2">
              <input
                value={editingTitle}
                onChange={(e) => setEditingTitle(e.target.value)}
                onKeyDown={onTitleKeyDown}
                disabled={isSaving}
                className="w-full min-w-0 rounded border border-gray-300 bg-gray-50 p-1.5 text-sm disabled:opacity-60 dark:bg-gray-800"
                autoFocus
              />

              {/* Toolbar row — stays horizontal at every width so it
                  never turns into a stack of full-width buttons */}
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-1">
                  <CalendarPicker
                    date={editingDueDate ?? undefined}
                    onChange={(d) => setEditingDueDate(d ?? null)}
                    open={calendarOpen}
                    setOpen={setCalendarOpen}
                    trigger={
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={isSaving}
                        className="flex h-9 items-center gap-1 px-2 sm:px-3"
                      >
                        <CalendarDays className="h-4 w-4" />
                        <span className="hidden sm:inline">
                          {editingDueDate ? editingDueDate.toLocaleDateString() : "Set date"}
                        </span>
                      </Button>
                    }
                  />
                  <PriorityPicker
                    priority={editingPriority}
                    onChange={setEditingPriority}
                    open={priorityOpen}
                    setOpen={setPriorityOpen}
                    trigger={
                      <Button
                        variant="ghost"
                        size="sm"
                        disabled={isSaving}
                        className={cn(
                          "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl transition-colors hover:bg-accent",
                          getPriorityClass(editingPriority)
                        )}
                        aria-label="Set priority"
                      >
                        <FlagIcon
                          className={cn("h-4 w-4", editingPriority > 0 && "fill-current")}
                        />
                      </Button>
                    }
                  />
                </div>

                <div className="flex items-center gap-1.5">
                  <Button
                    size="sm"
                    onClick={saveEdit}
                    disabled={isSaving}
                    className="flex h-9 items-center gap-1 bg-green-500/15 px-3 text-green-500 hover:bg-green-500/25"
                  >
                    {isSaving ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Check className="h-4 w-4" />
                    )}
                    <span className="hidden sm:inline">Save</span>
                  </Button>
                  <Button
                    size="sm"
                    onClick={cancelEdit}
                    disabled={isSaving}
                    className="flex h-9 items-center gap-1 bg-red-500/15 px-3 text-red-500 hover:bg-red-500/25"
                  >
                    <X className="h-4 w-4" />
                    <span className="hidden sm:inline">Cancel</span>
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <span
              className={cn(
                "min-w-0 flex-1 break-words pt-0.5 text-foreground cursor-pointer",
                todo.completed && "text-muted-foreground line-through"
              )}
              onClick={startEditing}
            >
              {todo.title}
            </span>
          )}
        </div>

        {/* Three-dot menu – hidden while editing */}
        {!isEditing && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                disabled={isDeleting}
                className="h-9 w-9 shrink-0 rounded-full border border-border/50 bg-background/60 p-0 text-muted-foreground hover:bg-accent hover:text-foreground"
              >
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              side="bottom"
              align="end"
              className="bg-gray-800 border border-orange-500 rounded-md shadow-lg"
            >
              <DropdownMenuItem
                onSelect={startEditing}
                className="flex items-center text-foreground hover:bg-orange-500/15"
              >
                <PencilLine className="mr-2 h-4 w-4" /> Edit Task
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onSelect={() => void onDelete()}
                className="flex items-center text-foreground hover:bg-red-500/15"
              >
                <Trash2 className="mr-2 h-4 w-4" /> Delete Task
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>

      {error && (
        <p role="alert" className="text-xs text-red-500">
          {error}
        </p>
      )}

      {/* Footer – due date, priority, timer */}
      <div className="mt-2 flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
        <TaskTimer task={todo} />
        <div className="flex flex-wrap items-center gap-2">
          {todo.dueDate && (
            <div className="flex items-center gap-1">
              <CalendarDays className="h-3.5 w-3.5" />
              <span>{new Date(todo.dueDate).toLocaleDateString()}</span>
            </div>
          )}
          {todo.priority > 0 && (
            <div className="flex items-center gap-1">
              <span>
                {PRIORITIES.find((p) => p.value === todo.priority)?.label} Priority
              </span>
            </div>
          )}
        </div>
      </div>
    </li>
  );
}