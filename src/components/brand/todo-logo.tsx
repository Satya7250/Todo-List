import { cn } from "@/lib/utils";

type TodoLogoProps = {
  className?: string;
  showWordmark?: boolean;
};

function TodoMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      className={cn("shrink-0", className)}
    >
      <rect
        x="3"
        y="3"
        width="18"
        height="18"
        rx="2"
        stroke="currentColor"
        strokeWidth="2"
      />
      <path
        d="m9 12 2 2 4-4"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function TodoLogo({
  className,
  showWordmark = true,
}: TodoLogoProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-2.5 text-foreground",
        className
      )}
    >
      <TodoMark className="h-7 w-7" />

      {showWordmark && (
        <span className="text-base font-semibold tracking-tight">
          Todo
        </span>
      )}
    </span>
  );
}

export { TodoMark };