"use client";

import { FileText } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { GlassNavbar } from "@/components/home/glass-navbar";

const NotesShell = () => {
  return (
    <div className="mx-auto flex h-full w-full max-w-5xl flex-col gap-6 px-4 py-6">
      {/* <GlassNavbar /> */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Notes</h1>
        <p className="text-muted-foreground">
          Capture ideas, meeting notes, and anything important.
        </p>
      </div>

      {/* Note Editor */}
      <Card>
        <CardHeader>
          <CardTitle>New Note</CardTitle>
        </CardHeader>

        <CardContent>
          <div className="rounded-lg border border-dashed p-8 text-center text-muted-foreground">
            Note editor coming soon...
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
          <div className="flex h-64 items-center justify-center rounded-lg border border-dashed text-muted-foreground">
            No notes yet.
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export { NotesShell };