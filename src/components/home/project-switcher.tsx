"use client";

import { useMemo, useState, type Dispatch, type SetStateAction } from "react";
import { ChevronDown, FolderKanban, Inbox, PencilLine, Plus, Trash2 } from "lucide-react";

import { createProject, deleteProject, updateProject, type ProjectRecord } from "@/actions/projects";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface ProjectSwitcherProps {
  projects: ProjectRecord[];
  selectedProjectId: string | null;
  onSelectProject: (projectId: string | null) => void;
  onProjectsChange: Dispatch<SetStateAction<ProjectRecord[]>>;
  className?: string;
}

interface ProjectListProps {
  projects: ProjectRecord[];
  selectedProjectId: string | null;
  onSelectProject: (projectId: string | null) => void;
  onRenameProject: (project: ProjectRecord, name: string) => void;
  onDeleteProject: (project: ProjectRecord) => void;
  onRequestClose: () => void;
}

interface ProjectItemProps {
  project: ProjectRecord;
  isSelected: boolean;
  onSelectProject: (projectId: string | null) => void;
  onRenameProject: (project: ProjectRecord, name: string) => void;
  onDeleteProject: (project: ProjectRecord) => void;
  onRequestClose: () => void;
}

export function ProjectSwitcher({
  projects,
  selectedProjectId,
  onSelectProject,
  onProjectsChange,
  className,
}: ProjectSwitcherProps) {
  const [open, setOpen] = useState(false);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [createName, setCreateName] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  const orderedProjects = useMemo(() => {
    const defaultProject = projects.find((project) => project.isDefault);
    const customProjects = projects.filter((project) => !project.isDefault);

    return defaultProject ? [defaultProject, ...customProjects] : customProjects;
  }, [projects]);

  const selectedProject = useMemo(() => {
    return orderedProjects.find((project) => project.id === selectedProjectId) ?? null;
  }, [orderedProjects, selectedProjectId]);

  const handleCreateProject = async (event: React.FormEvent) => {
    event.preventDefault();
    const trimmedName = createName.trim();

    if (!trimmedName) {
      return;
    }

    setIsCreating(true);
    const response = await createProject(trimmedName);
    setIsCreating(false);

    if (response.success && response.data) {
      onProjectsChange((currentProjects) => [...currentProjects, response.data as ProjectRecord]);
      onSelectProject(response.data.id);
      setCreateDialogOpen(false);
      setCreateName("");
      setOpen(false);
    } else if (response.error) {
      window.alert(response.error);
    }
  };

  const handleRenameProject = async (project: ProjectRecord, nextName: string) => {
    const trimmedName = nextName.trim();

    if (!trimmedName || trimmedName === project.name) {
      return;
    }

    const response = await updateProject(project.id, { name: trimmedName });

    if (response.success && response.data) {
      onProjectsChange((currentProjects) =>
        currentProjects.map((currentProject) =>
          currentProject.id === project.id
            ? { ...currentProject, name: response.data!.name }
            : currentProject
        )
      );
    } else if (response.error) {
      window.alert(response.error);
    }
  };

  const handleDeleteProject = async (project: ProjectRecord) => {
    if (project.isDefault) {
      return;
    }

    const confirmed = window.confirm(
      `Delete project “${project.name}”? Its tasks will move to Inbox.`
    );

    if (!confirmed) {
      return;
    }

    const response = await deleteProject(project.id);

    if (response.success) {
      onProjectsChange((currentProjects) =>
        currentProjects.filter((currentProject) => currentProject.id !== project.id)
      );

      if (selectedProjectId === project.id) {
        const inboxProject = projects.find((currentProject) => currentProject.isDefault);
        onSelectProject(inboxProject?.id ?? null);
      }
    } else if (response.error) {
      window.alert(response.error);
    }
  };

  return (
    <div className={cn("flex items-center", className)}>
      <DropdownMenu open={open} onOpenChange={setOpen}>
        <DropdownMenuTrigger asChild>
          <Button
            type="button"
            variant="outline"
            className="h-9 gap-2 rounded-xl border-border/50 bg-background/70 px-3 text-sm font-medium text-foreground shadow-none backdrop-blur-xl hover:bg-accent/80"
          >
            <FolderKanban className="h-4 w-4" />
            <span className="max-w-40 truncate">
              {selectedProject?.name ?? "Projects"}
            </span>
            <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" />
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent
          align="start"
          sideOffset={8}
          className="w-72 rounded-xl border border-border/50 bg-popover/80 p-2 shadow-lg backdrop-blur-xl"
        >
          <div className="px-2 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            Projects
          </div>
          <ProjectList
            projects={orderedProjects}
            selectedProjectId={selectedProjectId}
            onSelectProject={(projectId) => {
              onSelectProject(projectId);
              setOpen(false);
            }}
            onRenameProject={(project, name) => {
              void handleRenameProject(project, name);
            }}
            onDeleteProject={(project) => {
              void handleDeleteProject(project);
            }}
            onRequestClose={() => setOpen(false)}
          />
          <DropdownMenuSeparator />

          <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
            <DialogTrigger asChild>
              <button
                type="button"
                className="flex w-full items-center gap-2 rounded-lg px-2 py-2 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
              >
                <Plus className="h-4 w-4" />
                <span>New Project</span>
              </button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Create project</DialogTitle>
                <DialogDescription>Add a new project for organizing tasks.</DialogDescription>
              </DialogHeader>
              <form onSubmit={handleCreateProject} className="space-y-4">
                <Input
                  autoFocus
                  placeholder="Project name"
                  value={createName}
                  onChange={(event) => setCreateName(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Escape") {
                      setCreateDialogOpen(false);
                    }
                  }}
                />
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setCreateDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isCreating || !createName.trim()}>
                    {isCreating ? "Creating..." : "Create project"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

export function ProjectList({
  projects,
  selectedProjectId,
  onSelectProject,
  onRenameProject,
  onDeleteProject,
  onRequestClose,
}: ProjectListProps) {
  return (
    <div className="max-h-72 space-y-1 overflow-y-auto px-1 py-1">
      {projects.map((project) => (
        <ProjectItem
          key={project.id}
          project={project}
          isSelected={selectedProjectId === project.id}
          onSelectProject={onSelectProject}
          onRenameProject={onRenameProject}
          onDeleteProject={onDeleteProject}
          onRequestClose={onRequestClose}
        />
      ))}
    </div>
  );
}

export function ProjectItem({
  project,
  isSelected,
  onSelectProject,
  onRenameProject,
  onDeleteProject,
  onRequestClose,
}: ProjectItemProps) {
  const handleRename = () => {
    const nextName = window.prompt("Project name", project.name);

    if (!nextName) {
      return;
    }

    onRenameProject(project, nextName);
  };

  return (
    <div
      className={cn(
        "flex items-center gap-2 rounded-lg px-2 py-2 transition-colors",
        isSelected
          ? "bg-orange-500/10 text-orange-600"
          : "text-muted-foreground hover:bg-accent hover:text-foreground"
      )}
    >
      <button
        type="button"
        onClick={() => {
          onSelectProject(project.id);
          onRequestClose();
        }}
        className="flex flex-1 items-center gap-2 text-left"
      >
        {project.isDefault ? (
          <Inbox className="h-4 w-4" />
        ) : (
          <FolderKanban className="h-4 w-4" />
        )}
        <span className="truncate text-sm font-medium">{project.name}</span>
      </button>

      {!project.isDefault ? (
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => {
              handleRename();
            }}
            className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-background hover:text-foreground"
            aria-label={`Rename ${project.name}`}
          >
            <PencilLine className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={() => {
              onDeleteProject(project);
            }}
            className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-background hover:text-red-600"
            aria-label={`Delete ${project.name}`}
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      ) : null}
    </div>
  );
}
