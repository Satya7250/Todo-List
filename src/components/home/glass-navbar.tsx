"use client";

import { useState, type Dispatch, type SetStateAction } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserButton } from "@clerk/nextjs";
import { Menu, X } from "lucide-react";

import { type ProjectRecord } from "@/actions/projects";
import { TodoLogo } from "@/components/brand/todo-logo";
import { ProjectSwitcher } from "@/components/home/project-switcher";
import { ModeToggle } from "@/components/ui/mode-toggle";
import { cn } from "@/lib/utils";

const navigation = [
  { title: "About", href: "/about" },
  { title: "Notes", href: "/notes" },
];

interface GlassNavbarProps {
  projects: ProjectRecord[];
  selectedProjectId: string | null;
  onSelectProject: (projectId: string | null) => void;
  onProjectsChange: Dispatch<SetStateAction<ProjectRecord[]>>;
  showProjectSwitcher?: boolean;
}

export function GlassNavbar({
  projects,
  selectedProjectId,
  onSelectProject,
  onProjectsChange,
  showProjectSwitcher = true,
}: GlassNavbarProps) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="fixed inset-x-0 top-5 z-50 flex justify-center px-4 sm:px-6">
      <nav
        className={cn(
          "relative flex w-full max-w-7xl flex-col overflow-hidden rounded-2xl border backdrop-blur-xl",
          "border-border/50 bg-background/70",
          "dark:border-white/10 dark:bg-zinc-900/80 dark:shadow-[0_8px_32px_rgba(0,0,0,0.5)]"
        )}
      >
        {/* Ambient glow */}
        <div className="pointer-events-none absolute inset-y-0 left-0 w-64 bg-linear-to-r from-orange-500/10 to-transparent" />

        <div className="pointer-events-none absolute inset-y-0 right-0 w-64 bg-linear-to-l from-orange-500/10 to-transparent" />
        {/* Glass highlight */}
        <div className="pointer-events-none absolute inset-0 rounded-2xl ring-1 ring-white/5 dark:ring-white/15" />

        {/* Top row */}
        <div className="relative z-10 flex h-14 items-center justify-between px-4 sm:px-6">
          <Link
            href="/"
            className="flex items-center transition-opacity hover:opacity-80"
          >
            <TodoLogo />
          </Link>

          {/* Desktop nav */}
          <div className="absolute left-1/2 hidden -translate-x-1/2 items-center gap-1 md:flex">
            {navigation.map((item) => {
              const isActive =
                pathname === item.href || pathname?.startsWith(item.href + "/");

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "rounded-xl px-5 py-2 text-sm font-medium transition-all duration-200",
                    isActive
                      ? "bg-orange-500 text-white shadow-lg shadow-orange-500/20"
                      : "text-muted-foreground hover:bg-accent hover:text-foreground"
                  )}
                >
                  {item.title}
                </Link>
              );
            })}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 sm:gap-4">
            {showProjectSwitcher && (
  <ProjectSwitcher
    projects={projects}
    selectedProjectId={selectedProjectId}
    onSelectProject={onSelectProject}
    onProjectsChange={onProjectsChange}
  />
)}
            <ModeToggle />
            <UserButton />

            {/* Mobile menu toggle */}
            <button
              type="button"
              onClick={() => setMobileOpen((v) => !v)}
              className="ml-1 flex h-9 w-9 items-center justify-center rounded-lg border border-border/50 bg-background/70 text-muted-foreground transition-colors hover:text-foreground dark:border-white/10 dark:bg-zinc-800/80 dark:text-zinc-300 dark:hover:text-white md:hidden"
              aria-label="Toggle navigation menu"
              aria-expanded={mobileOpen}
            >
              {mobileOpen ? (
                <X className="h-4 w-4" />
              ) : (
                <Menu className="h-4 w-4" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile nav panel */}
        <div
          className={cn(
            "relative z-10 grid transition-all duration-200 md:hidden",
            mobileOpen
              ? "grid-rows-[1fr] opacity-100"
              : "grid-rows-[0fr] opacity-0"
          )}
        >
          <div className="overflow-hidden">
            <div className="flex flex-col gap-1 border-t border-border/50 px-4 py-3 dark:border-white/10">
              {navigation.map((item) => {
                const isActive =
                  pathname === item.href ||
                  pathname?.startsWith(item.href + "/");

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    className={cn(
                      "rounded-xl px-4 py-2.5 text-sm font-medium transition-all duration-200",
                      isActive
                        ? "bg-orange-500 text-white shadow-lg shadow-orange-500/20"
                        : "text-muted-foreground hover:bg-accent hover:text-foreground"
                    )}
                  >
                    {item.title}
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </nav>
    </header>
  );
}