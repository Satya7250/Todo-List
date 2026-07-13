"use client";

import { useState, useRef } from "react";
import { Plus, Loader2, Calendar as CalendarIcon, Flag } from "lucide-react";
import { taskSuggestions } from "@/components/home/task-templates";

import { cn } from "@/lib/utils";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";

interface TaskInputProps {
  onAdd: (title: string, dueDate: Date | null, priority: number) => void | Promise<void>;
  placeholder?: string;
  className?: string;
}

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

export function TaskInput({
  onAdd,
  placeholder = "Add a new task...",
  className,
}: TaskInputProps) {
  const [value, setValue] = useState("");
  const [dueDate, setDueDate] = useState<Date | null>(null);
  const [priority, setPriority] = useState<number>(0);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [isPriorityOpen, setIsPriorityOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const title = value.trim();
    if (!title || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await onAdd(title, dueDate, priority);
      setValue("");
      setDueDate(null);
      setPriority(0);
      inputRef.current?.focus();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSuggestionClick = (title: string) => {
    setValue(title);

    requestAnimationFrame(() => {
      inputRef.current?.focus();
      inputRef.current?.setSelectionRange(title.length, title.length);
    });
  };

  return (
    <div className={className}>
      <form
        onSubmit={handleSubmit}
        className={cn(
          "relative flex items-center gap-2 overflow-hidden rounded-2xl border p-2 backdrop-blur-xl transition-all duration-200",
          "border-border/50 bg-background/70",
          "focus-within:border-orange-500/50 focus-within:shadow-lg focus-within:shadow-orange-500/10",
          "dark:border-white/10 dark:bg-zinc-900/80 dark:focus-within:border-orange-500/40"
        )}
      >
        {/* Ambient glow on focus */}
        <div className="pointer-events-none absolute inset-y-0 left-0 w-32 bg-linear-to-r from-orange-500/5 to-transparent" />

        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder={placeholder}
          disabled={isSubmitting}
          className={cn(
            "relative z-10 h-10 flex-1 bg-transparent px-3 text-sm text-foreground outline-none",
            "placeholder:text-muted-foreground disabled:opacity-50"
          )}
        />

        <div className="relative z-10 flex items-center gap-1">
          <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
            <PopoverTrigger asChild>
              <button
                type="button"
                className={cn(
                  "flex h-9 w-9 items-center justify-center rounded-xl transition-colors hover:bg-accent",
                  dueDate 
                    ? "bg-orange-500/10 text-orange-500 hover:text-orange-600" 
                    : "text-muted-foreground hover:text-foreground"
                )}
                aria-label="Set due date"
              >
                <CalendarIcon className="h-4 w-4" />
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0 flex flex-col animate-none" align="end">
              <Calendar
                mode="single"
                selected={dueDate || undefined}
                onSelect={(date) => {
                  setDueDate(date || null);
                  setIsCalendarOpen(false);
                }}
              />
              {dueDate && (
                <button
                  type="button"
                  onClick={() => {
                    setDueDate(null);
                    setIsCalendarOpen(false);
                  }}
                  className="w-full text-center text-xs py-2 font-medium hover:bg-accent transition-colors rounded-b-md text-red-500 border-t border-border"
                >
                  Clear date
                </button>
              )}
            </PopoverContent>
          </Popover>

          <Popover open={isPriorityOpen} onOpenChange={setIsPriorityOpen}>
            <PopoverTrigger asChild>
              <button
                type="button"
                className={cn(
                  "flex h-9 w-9 items-center justify-center rounded-xl transition-colors hover:bg-accent",
                  getPriorityClass(priority)
                )}
                aria-label="Set priority"
              >
                <Flag className={cn("h-4 w-4", priority > 0 && "fill-current")} />
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-40 p-1 flex flex-col gap-0.5 animate-none" align="end">
              {PRIORITIES.map((p) => (
                <button
                  key={p.value}
                  type="button"
                  onClick={() => {
                    setPriority(p.value);
                    setIsPriorityOpen(false);
                  }}
                  className={cn(
                    "flex items-center gap-2 w-full text-left px-2 py-1.5 text-sm rounded-md transition-colors hover:bg-accent",
                    priority === p.value ? "bg-accent/80 font-medium" : ""
                  )}
                >
                  <Flag className={cn("h-3.5 w-3.5", p.value > 0 && "fill-current", p.color)} />
                  <span className="text-xs text-foreground font-medium">{p.label}</span>
                </button>
              ))}
            </PopoverContent>
          </Popover>

          <button
            type="submit"
            disabled={!value.trim() || isSubmitting}
            className={cn(
              "flex h-9 items-center gap-1.5 rounded-xl px-4 text-sm font-medium transition-all duration-200",
              value.trim() && !isSubmitting
                ? "bg-orange-500 text-white shadow-lg shadow-orange-500/20 hover:bg-orange-600"
                : "cursor-not-allowed bg-accent text-muted-foreground"
            )}
          >
            {isSubmitting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Plus className="h-4 w-4" />
            )}

            <span className="hidden sm:inline">Add</span>
          </button>
        </div>
      </form>

      {/* Suggestions */}
      <div className="mt-5 flex flex-wrap justify-center gap-2">
        {taskSuggestions.map((task) => {
          const Icon = task.icon;

          return (
            <button
              key={task.label}
              type="button"
              onClick={() => handleSuggestionClick(task.title)}
              className="flex items-center gap-2 rounded-full border border-border/50 bg-background/70 px-4 py-2 text-sm text-muted-foreground transition-all hover:border-orange-500/30 hover:bg-accent hover:text-foreground"
            >
              <Icon className="h-4 w-4" />
              {task.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}