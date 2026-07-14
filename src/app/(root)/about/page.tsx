import type { Metadata } from "next";

import About from "@/components/about/about-us";

export const metadata: Metadata = {
  title: "About",
  description: "Learn more about TodoMark and its creator.",
};

export default function AboutPage() {
  return <About />;
}