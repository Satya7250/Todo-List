import { auth } from "@clerk/nextjs/server";
import { ModeToggle } from "@/components/ui/mode-toggle";
import { UserButton } from "@clerk/nextjs";

export default async function Home() {
  await auth.protect();

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="absolute top-4 left-4">
        <UserButton/>
      </div>
      <div className="absolute top-4 right-4">
        <ModeToggle />
      </div>

      <h1 className="text-3xl font-bold">
        Welcome to your Todo App
      </h1>
    </div>
  );
}