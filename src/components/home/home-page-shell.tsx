"use client";

import { useEffect, useState } from "react";

import { getProjects, type ProjectRecord } from "@/actions/projects";
import { GlassNavbar } from "@/components/home/glass-navbar";
import { TodoList } from "@/components/home/todo-list";

interface HomePageShellProps {
  caveatClassName?: string;
}

export function HomePageShell({ caveatClassName }: HomePageShellProps) {
  const [projects, setProjects] = useState<ProjectRecord[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    void (async () => {
      const projResponse = await getProjects();
      if (!isMounted) {
        return;
      }

      if (projResponse.success && projResponse.data) {
        setProjects(projResponse.data);
        const inbox = projResponse.data.find((project) => project.isDefault);
        setSelectedProjectId(inbox?.id ?? null);
      }
    })();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <>
      <GlassNavbar
        projects={projects}
        selectedProjectId={selectedProjectId}
        onSelectProject={setSelectedProjectId}
        onProjectsChange={setProjects}
      />

      <section className="relative z-10 flex min-h-screen items-center justify-center px-6 pb-60 sm:pb-60">
        <div className="w-full max-w-2xl text-center">
          <p className={`${caveatClassName ?? ""} mt-4 text-2xl text-muted-foreground`}>
            Turn ideas into completed tasks.
          </p>

          <div className="mt-10">
            <TodoList selectedProjectId={selectedProjectId} />
          </div>
        </div>
      </section>
    </>
  );
}
