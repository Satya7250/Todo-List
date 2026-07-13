import Link from "next/link";
import { ArrowLeft, Construction } from "lucide-react";

export default function NotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center px-6">
      <div className="mx-auto max-w-lg text-center">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full border border-orange-500/20 bg-orange-500/10">
          <Construction className="h-10 w-10 text-orange-500" />
        </div>

        <p className="mt-8 text-sm font-medium uppercase tracking-[0.3em] text-orange-500">
          404
        </p>

        <h1 className="mt-3 text-4xl font-bold tracking-tight">
          Feature Coming Soon
        </h1>

        <p className="mt-4 text-muted-foreground">
          We&apos;re still building this feature. It will be available in a future
          update. Stay tuned!
        </p>

        <div className="mt-10">
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-xl bg-orange-500 px-5 py-3 text-sm font-medium text-white transition-colors hover:bg-orange-600"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Link>
        </div>
      </div>
    </main>
  );
}