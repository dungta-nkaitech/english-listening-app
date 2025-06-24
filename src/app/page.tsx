"use client";

import EpisodeTabs from "@/components/EpisodeTabs";
import TopNavbar from "./TopNavbar";

export default function HomePage() {
  return (
    <main className="bg-[#fef9f0] min-h-screen">
      <TopNavbar title="LISTENING APP" showBack={false} />

      <div className="p-4 space-y-4">
        <EpisodeTabs />
      </div>
    </main>
  );
}
