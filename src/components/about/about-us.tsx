import React from "react";
import { CheckCircle2, Code2, Target, Sparkles } from "lucide-react";

const About = () => {
  const features = [
    "Organize tasks with ease",
    "Create and manage multiple projects",
    "Set priorities and due dates",
    "Modern & responsive UI",
    "Dark and Light mode",
    "Fast and secure experience",
  ];

  return (
    <main className="min-h-screen bg-background px-6 py-16">
      <div className="mx-auto max-w-5xl">
        {/* Hero */}
        <div className="text-center">
          <span className="inline-flex items-center gap-2 rounded-full border px-4 py-1 text-sm font-medium">
            <Sparkles className="h-4 w-4 text-orange-500" />
            About TodoMark
          </span>

          <h1 className="mt-6 text-4xl font-bold tracking-tight md:text-6xl">
            Built for Productivity,
            <span className="text-orange-500"> Designed for Simplicity.</span>
          </h1>

          <p className="mx-auto mt-6 max-w-3xl text-muted-foreground text-lg">
            Hi, I'm <span className="font-semibold text-foreground">Satya Prakash</span>,
            the creator of TodoMark. I built this application to make task
            management simple, fast, and enjoyable without unnecessary
            complexity.
          </p>
        </div>

        {/* Cards */}
        <div className="mt-16 grid gap-6 md:grid-cols-3">
          <div className="rounded-2xl border bg-card p-6 shadow-sm">
            <Target className="mb-4 h-8 w-8 text-orange-500" />
            <h2 className="text-xl font-semibold">Mission</h2>
            <p className="mt-3 text-muted-foreground">
              Help people stay organized, productive, and focused through a
              clean and distraction-free task management experience.
            </p>
          </div>

          <div className="rounded-2xl border bg-card p-6 shadow-sm">
            <CheckCircle2 className="mb-4 h-8 w-8 text-orange-500" />
            <h2 className="text-xl font-semibold">Features</h2>

            <ul className="mt-3 space-y-2">
              {features.map((feature) => (
                <li
                  key={feature}
                  className="flex items-center gap-2 text-muted-foreground"
                >
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                  {feature}
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-2xl border bg-card p-6 shadow-sm">
            <Code2 className="mb-4 h-8 w-8 text-orange-500" />
            <h2 className="text-xl font-semibold">Built With</h2>

            <div className="mt-4 flex flex-wrap gap-2">
              {[
                "Next.js",
                "React",
                "TypeScript",
                "Tailwind CSS",
                "shadcn/ui",
                "Drizzle ORM",
                "PostgreSQL",
                "Clerk",
              ].map((tech) => (
                <span
                  key={tech}
                  className="rounded-full border px-3 py-1 text-sm"
                >
                  {tech}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-20 rounded-3xl border bg-card p-10 text-center">
          <h2 className="text-3xl font-bold">
            Thank you for using TodoMark ❤️
          </h2>

          <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
            Every feature is built with care to help you manage your work more
            efficiently. I hope TodoMark becomes a part of your daily workflow
            and helps you accomplish your goals.
          </p>

          <div className="mt-8">
            <p className="font-semibold">Made with ❤️ by Satya Prakash</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Full Stack Developer • Next.js • React • TypeScript
            </p>
          </div>
        </div>
      </div>
    </main>
  );
};

export default About;