"use client";

import { GlassNavbar } from "@/components/home/glass-navbar";

export function NavbarWrapper() {
  return (
    <GlassNavbar
      projects={[]}
      selectedProjectId={null}
      onSelectProject={() => {}}
      onProjectsChange={() => {}}
      showProjectSwitcher={false}
    />
  );
}