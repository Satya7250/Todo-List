import { auth } from "@clerk/nextjs/server";
import { Caveat } from "next/font/google";
import { HomeBackground } from "@/components/home/home-background";
import { HomePageShell } from "@/components/home/home-page-shell";

const caveat = Caveat({ subsets: ["latin"] });

export default async function Home() {
  await auth.protect();

  return (
    <main className="relative min-h-screen overflow-hidden">
      <HomeBackground />
      <HomePageShell caveatClassName={caveat.className} />
    </main>
  );
}