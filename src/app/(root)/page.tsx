import { auth } from "@clerk/nextjs/server";
import { Caveat } from "next/font/google";
import { HomeBackground } from "@/components/home/home-background";
import { GlassNavbar } from "@/components/home/glass-navbar";
import { TodoList } from "@/components/home/todo-list";

const caveat = Caveat({ subsets: ["latin"] });

export default async function Home() {
  await auth.protect();

  return (
    <main className="relative min-h-screen overflow-hidden">
      <HomeBackground />
      <GlassNavbar />

      <section className="relative z-10 flex min-h-screen items-center justify-center px-6">
        <div className="w-full max-w-2xl text-center">

          {/* <h1 className="text-5xl font-bold tracking-tight">
            Welcome to your Todo App
          </h1> */}

          <p className={`${caveat.className} mt-4 text-2xl text-muted-foreground`}>
            Turn ideas into completed tasks.
          </p>

          <div className="mt-10">
            <TodoList />
          </div>
        </div>
      </section>
    </main>
  );
}