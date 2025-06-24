"use client";

import { useEffect, useRef, useState } from "react";
import { IEpisode } from "@/types/episode.interface";
import EpisodeCard from "./EpisodeCard";
import { fetchEpisodesPage } from "../lib/fetchEpisodes";

type Tab = "all" | "favorites" | "learned";

const PAGE_SIZE = 20;

export default function EpisodeTabs() {
  const [episodes, setEpisodes] = useState<IEpisode[]>([]);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [currentTab, setCurrentTab] = useState<Tab>("all");

  // Fake IDs — sau này lấy từ user
  const favoriteIds = ["ep001", "ep002"];
  const learnedIds = ["ep003"];

  const loaderRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadMore();
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const target = entries[0];
        if (target.isIntersecting && hasMore && !loading) {
          loadMore();
        }
      },
      { rootMargin: "100px" }
    );

    if (loaderRef.current) observer.observe(loaderRef.current);
    return () => {
      if (loaderRef.current) observer.unobserve(loaderRef.current);
    };
  }, [loaderRef.current, hasMore, loading]);

  const loadMore = async () => {
    setLoading(true);
    const newEpisodes = await fetchEpisodesPage(page);
    setEpisodes((prev) => [...prev, ...newEpisodes]);
    setPage((prev) => prev + 1);
    if (newEpisodes.length < PAGE_SIZE) setHasMore(false);
    setLoading(false);
  };

  const filtered = episodes.filter((ep) => {
    if (currentTab === "favorites") return favoriteIds.includes(ep.id);
    if (currentTab === "learned") return learnedIds.includes(ep.id);
    return true;
  });

  // Scroll to top
  const [showScrollTop, setShowScrollTop] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 300);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: listRef.current?.offsetTop || 0,
      behavior: "smooth",
    });
  };

  return (
    <div>
      {/* Tabs */}
      <div className="flex gap-2 mb-3">
        {["all", "favorites", "learned"].map((tab) => (
          <button
            key={tab}
            onClick={() => setCurrentTab(tab as Tab)}
            className={`px-3 py-1 rounded-full text-sm font-medium transition ${
              currentTab === tab
                ? "bg-green-700 text-white"
                : "bg-gray-200 text-gray-700"
            }`}
          >
            {tab === "all"
              ? "All Episodes"
              : tab === "favorites"
              ? "Favorites"
              : "Learned"}
          </button>
        ))}
      </div>

      {/* Cards */}
      <div className="space-y-3" ref={listRef}>
        {filtered.map((ep) => (
          <EpisodeCard key={ep.id} episode={ep} />
        ))}
        {filtered.length === 0 && !loading && (
          <p className="text-sm text-gray-500 text-center">
            No episodes to show.
          </p>
        )}
        <div ref={loaderRef} className="py-4 text-center text-gray-500 text-sm">
          {loading && hasMore
            ? "Loading..."
            : hasMore
            ? "Scroll to load more"
            : "All loaded"}
        </div>
      </div>

      {/* Scroll to Top Button */}
      {showScrollTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-4 p-3 rounded-full bg-[#1b5e20] text-white shadow-lg hover:scale-110 transition"
        >
          Back to top
        </button>
      )}
    </div>
  );
}
