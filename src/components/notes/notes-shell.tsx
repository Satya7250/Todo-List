"use client";

import { useEffect, useRef, useState } from "react";
import { FileText, Loader2, Pencil, Plus, Trash2, X } from "lucide-react";

import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  createNote,
  deleteNote,
  getNotes,
  updateNote,
  type NoteRecord,
} from "@/actions/notes";
// import { GlassNavbar } from "@/components/home/glass-navbar";

const RULE_LINE_HEIGHT = 32; // px — every ruled element below shares this rhythm
const HOLE_COUNT = 7;

/** Punched-hole gutter shared by the editor page and every note card. */
function PunchHoles() {
  return (
    <div className="absolute inset-y-0 left-0 z-10 flex w-10 flex-col items-center justify-evenly">
      {Array.from({ length: HOLE_COUNT }).map((_, i) => (
        <span
          key={i}
          className="h-2.5 w-2.5 rounded-full bg-background shadow-[inset_0_1px_2px_rgba(0,0,0,0.35)]"
        />
      ))}
    </div>
  );
}

/** Ruled paper background + red margin rule, positioned to match RULE_LINE_HEIGHT. */
const paperRuleStyle: React.CSSProperties = {
  backgroundImage: `repeating-linear-gradient(
      to bottom,
      transparent,
      transparent ${RULE_LINE_HEIGHT - 1}px,
      rgba(120, 113, 108, 0.25) ${RULE_LINE_HEIGHT - 1}px,
      rgba(120, 113, 108, 0.25) ${RULE_LINE_HEIGHT}px
    )`,
  backgroundPosition: "0 12px",
};

const NotesShell = () => {
  const [notes, setNotes] = useState<NoteRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const editorRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLTextAreaElement>(null);

  /** Grows the textarea to fit its content, snapped to RULE_LINE_HEIGHT so the ruled lines stay aligned with the text as it expands. */
  const autoGrow = (el: HTMLTextAreaElement | null) => {
    if (!el) return;
    el.style.height = "auto";
    const minHeight = RULE_LINE_HEIGHT * 5;
    const lines = Math.ceil(el.scrollHeight / RULE_LINE_HEIGHT);
    el.style.height = `${Math.max(minHeight, lines * RULE_LINE_HEIGHT)}px`;
  };

  useEffect(() => {
    async function loadNotes() {
      setIsLoading(true);
      try {
        const response = await getNotes();
        if (response.success && response.data) {
          setNotes(response.data);
        }
      } finally {
        setIsLoading(false);
      }
    }

    loadNotes();
  }, []);

  const resetEditor = () => {
    setTitle("");
    setContent("");
    setEditingId(null);
    requestAnimationFrame(() => autoGrow(contentRef.current));
  };

  const handleEditNote = (note: NoteRecord) => {
    setEditingId(note.id);
    setTitle(note.title);
    setContent(note.content);
    editorRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    requestAnimationFrame(() => autoGrow(contentRef.current));
  };

  const handleSave = async () => {
    const trimmedTitle = title.trim();
    const trimmedContent = content.trim();
    if (!trimmedTitle && !trimmedContent) return;

    setIsSaving(true);
    try {
      if (editingId) {
        const response = await updateNote(editingId, {
          title: trimmedTitle,
          content: trimmedContent,
        });

        if (response.success && response.data) {
          setNotes((prev) => prev.map((n) => (n.id === editingId ? response.data! : n)));
        }
      } else {
        const response = await createNote(trimmedTitle, trimmedContent);

        if (response.success && response.data) {
          setNotes((prev) => [response.data!, ...prev]);
        }
      }

      resetEditor();
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    const response = await deleteNote(id);
    if (response.success) {
      setNotes((prev) => prev.filter((n) => n.id !== id));
      if (editingId === id) resetEditor();
    }
  };

  return (
    <div className="mx-auto flex h-full w-full max-w-5xl flex-col gap-6 px-4 py-6">
      {/* <GlassNavbar /> */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Notes</h1>
        <p className="text-muted-foreground">
          Capture ideas, meeting notes, and anything important.
        </p>
      </div>

      {/* Note Editor — styled as a ruled legal-pad page */}
      <Card ref={editorRef} className="overflow-hidden">
        <CardHeader className="flex-row items-center justify-between gap-2 space-y-0">
          <CardTitle>{editingId ? "Edit note" : "New note"}</CardTitle>
          {editingId && (
            <button
              type="button"
              onClick={resetEditor}
              className="flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
            >
              <X className="h-3.5 w-3.5" />
              Cancel edit
            </button>
          )}
        </CardHeader>

        <CardContent>
          <div className="relative overflow-hidden rounded-lg border border-amber-900/10 bg-[#f4efdf] shadow-inner">
            <PunchHoles />

            {/* red margin rule */}
            <div className="pointer-events-none absolute inset-y-0 left-14 z-10 w-px bg-[#c1543d]/50" />

            <div className="relative z-0 pl-20 pr-6" style={paperRuleStyle}>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Title this page..."
                disabled={isSaving}
                className={cn(
                  "h-13 w-full bg-transparent pt-3 font-mono text-base font-semibold text-[#2b2723] outline-none",
                  "placeholder:font-normal placeholder:text-[#8a8375] disabled:opacity-60"
                )}
                style={{ lineHeight: `${RULE_LINE_HEIGHT}px` }}
              />

              <textarea
                ref={contentRef}
                value={content}
                onChange={(e) => {
                  setContent(e.target.value);
                  autoGrow(e.target);
                }}
                placeholder="Start writing..."
                disabled={isSaving}
                className={cn(
                  "block w-full resize-none overflow-hidden bg-transparent font-mono text-sm text-[#2b2723] outline-none",
                  "placeholder:text-[#8a8375] disabled:opacity-60"
                )}
                style={{ lineHeight: `${RULE_LINE_HEIGHT}px`, height: `${RULE_LINE_HEIGHT * 5}px` }}
              />
            </div>
          </div>

          <div className="mt-3 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={handleSave}
              disabled={isSaving || (!title.trim() && !content.trim())}
              className={cn(
                "flex h-9 items-center gap-1.5 rounded-xl px-4 text-sm font-medium transition-all duration-200",
                (title.trim() || content.trim()) && !isSaving
                  ? "bg-orange-500 text-white shadow-lg shadow-orange-500/20 hover:bg-orange-600"
                  : "cursor-not-allowed bg-accent text-muted-foreground"
              )}
            >
              {isSaving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Plus className="h-4 w-4" />
              )}
              {editingId ? "Save changes" : "Add note"}
            </button>
          </div>
        </CardContent>
      </Card>

      {/* Notes List */}
      <Card className="flex-1 overflow-hidden">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Your Notes
          </CardTitle>
        </CardHeader>

        <CardContent className="h-full overflow-y-auto">
          {isLoading ? (
            <div className="flex h-64 items-center justify-center gap-2 text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              Loading notes...
            </div>
          ) : notes.length === 0 ? (
            <div className="flex h-64 flex-col items-center justify-center gap-1 rounded-lg border border-dashed text-center text-muted-foreground">
              <p className="font-medium">No notes yet.</p>
              <p className="text-sm">Write your first one above.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {notes.map((note) => (
                <div
                  key={note.id}
                  role="button"
                  tabIndex={0}
                  onClick={() => handleEditNote(note)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      handleEditNote(note);
                    }
                  }}
                  className={cn(
                    "relative cursor-pointer overflow-hidden rounded-lg border bg-[#f4efdf] shadow-sm transition-shadow hover:shadow-md",
                    editingId === note.id
                      ? "border-orange-500/60 ring-2 ring-orange-500/30"
                      : "border-amber-900/10"
                  )}
                >
                  <PunchHoles />
                  <div className="pointer-events-none absolute inset-y-0 left-14 z-10 w-px bg-[#c1543d]/40" />

                  <div className="relative z-0 flex flex-col gap-1 pl-20 pr-4 py-4">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-mono text-sm font-semibold text-[#2b2723]">
                        {note.title || "Untitled"}
                      </h3>
                      <div className="flex shrink-0 items-center gap-1">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEditNote(note);
                          }}
                          aria-label="Edit note"
                          className="rounded-md p-1 text-[#8a8375] transition-colors hover:bg-black/5 hover:text-[#2b2723]"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(note.id);
                          }}
                          aria-label="Delete note"
                          className="rounded-md p-1 text-[#8a8375] transition-colors hover:bg-red-500/10 hover:text-red-600"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>

                    <p className="line-clamp-3 font-mono text-xs text-[#5c5648]">
                      {note.content}
                    </p>

                    <span className="mt-1 text-[10px] uppercase tracking-wide text-[#8a8375]">
                      {new Date(note.createdAt).toLocaleDateString(undefined, {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export { NotesShell };