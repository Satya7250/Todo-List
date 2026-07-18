"use client";

import { type ReactNode } from "react";
import { Flag } from "lucide-react";

import { cn } from "@/lib/utils";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";

/* -------------------------------------------------
   Priority constants — single source of truth so
   TaskItem, TaskInput, etc. can't drift out of sync.
------------------------------------------------- */
export const PRIORITIES = [
  { value: 0, label: "None", color: "text-muted-foreground" },
  { value: 1, label: "Low", color: "text-blue-500" },
  { value: 2, label: "Medium", color: "text-amber-500" },
  { value: 3, label: "High", color: "text-orange-500" },
  { value: 4, label: "Urgent", color: "text-red-500" },
] as const;

const PRIORITY_BG: Record<number, string> = {
  0: "text-muted-foreground hover:text-foreground",
  1: "text-blue-500 bg-blue-500/10",
  2: "text-amber-500 bg-amber-500/10",
  3: "text-orange-500 bg-orange-500/10",
  4: "text-red-500 bg-red-500/10",
};

export function getPriorityClass(priority: number) {
  return PRIORITY_BG[priority] ?? PRIORITY_BG[0];
}

/* -------------------------------------------------
   PriorityPicker
   Callers own the trigger markup (so an icon-only
   toolbar button and a labeled Button can both use
   it) but share the popover + list rendering.
------------------------------------------------- */
export function PriorityPicker({
  priority,
  onChange,
  open,
  setOpen,
  trigger,
}: {
  priority: number;
  onChange: (p: number) => void;
  open: boolean;
  setOpen: (v: boolean) => void;
  trigger: ReactNode;
}) {
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>{trigger}</PopoverTrigger>
      <PopoverContent
        className="flex w-40 flex-col gap-0.5 p-1 animate-none"
        align="start"
        sideOffset={8}
      >
        {PRIORITIES.map((p) => (
          <button
            key={p.value}
            type="button"
            onClick={() => {
              onChange(p.value);
              setOpen(false);
            }}
            className={cn(
              "flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm transition-colors hover:bg-accent",
              priority === p.value ? "bg-accent/80 font-medium" : ""
            )}
          >
            <Flag className={cn("h-3.5 w-3.5", p.value > 0 && "fill-current", p.color)} />
            <span className="text-xs font-medium text-foreground">{p.label}</span>
          </button>
        ))}
      </PopoverContent>
    </Popover>
  );
}

/* -------------------------------------------------
   CalendarPicker
   Same idea: shared date-selection popover, with an
   optional "Clear date" footer for callers that want it.
------------------------------------------------- */
export function CalendarPicker({
  date,
  onChange,
  open,
  setOpen,
  trigger,
  clearable = false,
  contentClassName,
}: {
  date: Date | undefined;
  onChange: (d: Date | null) => void;
  open: boolean;
  setOpen: (v: boolean) => void;
  trigger: ReactNode;
  clearable?: boolean;
  contentClassName?: string;
}) {
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>{trigger}</PopoverTrigger>
      <PopoverContent
        className={cn("flex w-auto flex-col p-0 animate-none", contentClassName)}
        align="start"
        sideOffset={8}
      >
        <Calendar
          mode="single"
          selected={date}
          onSelect={(d) => {
            onChange(d ?? null);
            setOpen(false);
          }}
        />
        {clearable && date && (
          <button
            type="button"
            onClick={() => {
              onChange(null);
              setOpen(false);
            }}
            className="w-full rounded-b-md border-t border-border py-2 text-center text-xs font-medium text-red-500 transition-colors hover:bg-accent"
          >
            Clear date
          </button>
        )}
      </PopoverContent>
    </Popover>
  );
}