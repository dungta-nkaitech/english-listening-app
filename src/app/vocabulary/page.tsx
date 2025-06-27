"use client";

import NavigationBar from "@/components/NavigationBar";
import VocabularyPage from "./VocabularyPage";

export default function Page() {
  return (
    <main className="bg-[#fef9f0] min-h-screen">
      <div className="flex items-center justify-between px-4 py-3 bg-green-800 text-white">
        <NavigationBar></NavigationBar>
      </div>
      <VocabularyPage />
    </main>
  );
}
