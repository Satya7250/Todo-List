import type { Metadata } from "next";

import { NotesShell } from "@/components/notes/notes-shell";

export const metadata: Metadata = {
  title: "Notes",
  description: "Organize your thoughts and ideas.",
};

export default function NotesPage() {
  return <NotesShell />;
}