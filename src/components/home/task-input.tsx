"use client";

import { useState, useRef } from "react";
import { Plus, Loader2, Calendar, Flag } from "lucide-react";
import { taskSuggestions } from "@/components/home/task-templates";

import { cn } from "@/lib/utils";

interface TaskInputProps {
  onAdd: (title: string) => void | Promise<void>;
  placeholder?: string;
  className?: string;
}

export function TaskInput({
  onAdd,
  placeholder = "Add a new task...",
  className,
}: TaskInputProps) {
  const [value, setValue] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const title = value.trim();
    if (!title || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await onAdd(title);
      setValue("");
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
          <button
            type="button"
            className="flex h-9 w-9 items-center justify-center rounded-xl text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
            aria-label="Set due date"
          >
            <Calendar className="h-4 w-4" />
          </button>

          <button
            type="button"
            className="flex h-9 w-9 items-center justify-center rounded-xl text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
            aria-label="Set priority"
          >
            <Flag className="h-4 w-4" />
          </button>

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