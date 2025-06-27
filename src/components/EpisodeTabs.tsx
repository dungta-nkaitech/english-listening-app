"use client";

import { useEffect, useRef, useState } from "react";
import { IEpisode, IEpisodeWithStatus } from "@/types/episode.interface";
import EpisodeCard from "./EpisodeCard";
import { fetchEpisodesPage, fetchEpisodesSearch } from "../lib/fetchEpisodes";
import { FaAngleDoubleUp } from "react-icons/fa";
import { MdOutlinePostAdd } from "react-icons/md";
import AddVocabularyForm from "./AddVocabularyForm";
import Link from "next/link";

const USER_ID = "88774f25-8043-4375-8a5e-3f6a0ea39374";

type Tab = "all" | "favorites" | "learned";

const PAGE_SIZE = 20;

export default function EpisodeTabs() {
  const [episodes, setEpisodes] = useState<IEpisodeWithStatus[]>([]);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [currentTab, setCurrentTab] = useState<Tab>("all");

  const [status, setStatus] = useState<{
    favorites: string[];
    learnt: string[];
  }>({
    favorites: [],
    learnt: [],
  });

  const loaderRef = useRef<HTMLDivElement>(null);

  /** Search states */
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<IEpisodeWithStatus[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchPage, setSearchPage] = useState(0);
  const [searchHasMore, setSearchHasMore] = useState(true);

  /** Scroll to top button */
  const [showScrollTop, setShowScrollTop] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);

  // show add Vocabulary Form
  const [showAddForm, setShowAddForm] = useState(false);

  /** 1️⃣ Load user status once on mount */
  useEffect(() => {
    async function loadStatus() {
      const res = await fetch(`/api/status?userId=${USER_ID}`);
      const data = await res.json();
      setStatus(data);
    }
    loadStatus();
  }, []);

  /** 2️⃣ When status changes, reset episodes and reload from page 0 */
  useEffect(() => {
    setEpisodes([]);
    setPage(0);
    setHasMore(true);

    if (!isSearchMode()) {
      loadMore(0);
    }
  }, [status]);

  /** 3️⃣ Infinite scroll observer */
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const target = entries[0];
        if (target.isIntersecting) {
          if (isSearchMode()) {
            if (!searchLoading && searchHasMore) loadMoreSearch();
          } else {
            if (!loading && hasMore) loadMore(page);
          }
        }
      },
      { rootMargin: "100px" }
    );
    if (loaderRef.current) observer.observe(loaderRef.current);
    return () => {
      if (loaderRef.current) observer.unobserve(loaderRef.current);
    };
  }, [
    loading,
    hasMore,
    searchLoading,
    searchHasMore,
    searchTerm,
    page,
    status,
  ]);

  /** 4️⃣ Check if in search mode */
  const isSearchMode = () => searchTerm.trim().length >= 2;

  /** 5️⃣ Debounced search trigger */
  useEffect(() => {
    if (!isSearchMode()) {
      setSearchResults([]);
      setSearchPage(0);
      setSearchHasMore(true);
      return;
    }

    setSearchLoading(true);
    setSearchResults([]);
    setSearchPage(0);
    setSearchHasMore(true);

    const timer = setTimeout(() => {
      loadFirstPageSearch();
    }, 400);

    return () => clearTimeout(timer);
  }, [searchTerm, status]);

  /** 6️⃣ Backspace shortcut to clear search */
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Backspace" && isSearchMode()) {
        const active = document.activeElement;
        if (
          active &&
          (active.tagName === "INPUT" ||
            active.tagName === "TEXTAREA" ||
            active.getAttribute("contenteditable") === "true")
        ) {
          return;
        }
        e.preventDefault();
        handleClearSearch();
      }
    };
    window.addEventListener("keydown", handleGlobalKeyDown);
    return () => window.removeEventListener("keydown", handleGlobalKeyDown);
  }, [searchTerm]);

  /** 7️⃣ Load more episodes (normal mode) */
  const loadMore = async (targetPage: number) => {
    setLoading(true);

    const newEpisodes = await fetchEpisodesPage(targetPage);

    setEpisodes((prev) => {
      const newEpisodesWithStatus = newEpisodes.map((ep) => ({
        ...ep,
        isFavorite: status.favorites.includes(ep.id),
        isLearned: status.learnt.includes(ep.id),
      }));
      const merged = [...prev, ...newEpisodesWithStatus];
      const unique = Array.from(
        new Map(merged.map((ep) => [ep.id, ep])).values()
      );
      return unique;
    });

    setPage((prev) => prev + 1);
    if (newEpisodes.length < PAGE_SIZE) setHasMore(false);
    setLoading(false);
  };

  /** 8️⃣ Load first page of search */
  const loadFirstPageSearch = async () => {
    const results: IEpisode[] = await fetchEpisodesSearch(searchTerm.trim(), 0);

    const resultsWithStatus: IEpisodeWithStatus[] = results.map((ep) => ({
      ...ep,
      isFavorite: status.favorites.includes(ep.id),
      isLearned: status.learnt.includes(ep.id),
    }));

    setSearchResults(resultsWithStatus);
    if (results.length < PAGE_SIZE) setSearchHasMore(false);
    setSearchPage(1);
    setSearchLoading(false);
  };

  /** 9️⃣ Load more search results */
  const loadMoreSearch = async () => {
    setSearchLoading(true);

    const newResults: IEpisode[] = await fetchEpisodesSearch(
      searchTerm.trim(),
      searchPage
    );

    const newResultsWithStatus: IEpisodeWithStatus[] = newResults.map((ep) => ({
      ...ep,
      isFavorite: status.favorites.includes(ep.id),
      isLearned: status.learnt.includes(ep.id),
    }));

    setSearchResults((prev) => {
      const merged = [...prev, ...newResultsWithStatus];
      const unique = Array.from(
        new Map(merged.map((ep) => [ep.id, ep])).values()
      );
      return unique;
    });

    setSearchPage((prev) => prev + 1);
    if (newResults.length < PAGE_SIZE) setSearchHasMore(false);
    setSearchLoading(false);
  };

  /** Handle clear search */
  const handleClearSearch = () => {
    setSearchTerm("");
    setSearchResults([]);
    setSearchPage(0);
    setSearchHasMore(true);
  };

  /** Filter for tabs */
  const filtered = episodes.filter((ep) => {
    if (currentTab === "favorites") return ep.isFavorite;
    if (currentTab === "learned") return ep.isLearned;
    return true;
  });

  /** Scroll to top listener */
  useEffect(() => {
    const handleScroll = () => setShowScrollTop(window.scrollY > 300);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: listRef.current?.offsetTop || 0,
      behavior: "smooth",
    });
  };

  async function updateEpisodeStatus(episodeId: string) {
    const res = await fetch(
      `/api/status?userId=${USER_ID}&episodeId=${episodeId}`
    );
    const data = await res.json();

    if (data.episodeId) {
      setEpisodes((prev) =>
        prev.map((ep) =>
          ep.id === episodeId
            ? { ...ep, isFavorite: data.isFavorite, isLearned: data.isLearned }
            : ep
        )
      );
    } else {
      console.error("Invalid single-episode response:", data);
    }
  }

  async function handleSaveVocabulary(data: {
    word: string;
    definition: string;
    example: string;
  }) {
    try {
      const payload = {
        ...data,
        userId: USER_ID,
      };
      // Gọi Next.js API route
      const res = await fetch("/api/user-vocab", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errorData = await res.json();
        console.error("API error:", errorData);
        alert(
          "Failed to save vocabulary: " + (errorData.error || res.statusText)
        );
        return;
      }

      console.log("Vocabulary saved!");
      setShowAddForm(false);
    } catch (error) {
      console.error("Error saving vocabulary:", error);
      alert("Something went wrong while saving vocabulary.");
    }
  }

  return (
    <div>
      {/* Search Box */}
      <div className="flex items-center gap-2 mb-4">
        <input
          type="text"
          placeholder="Search episodes by title..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-1 px-3 py-2 border rounded-lg text-sm"
        />
        {isSearchMode() && (
          <button
            onClick={handleClearSearch}
            className="px-3 py-2 bg-green-700 text-white rounded-lg hover:bg-green-800 transition"
          >
            Back
          </button>
        )}
      </div>

      {/* Tabs */}
      {!isSearchMode() && (
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
          <Link
            href="/vocabulary"
            className="px-3 py-1 rounded-full text-sm font-medium transition bg-gray-200 text-gray-700"
          >
            Vocabulary
          </Link>
        </div>
      )}

      {/* Cards */}
      <div className="space-y-3" ref={listRef}>
        {isSearchMode() ? (
          <>
            {searchResults.map((ep) => (
              <EpisodeCard
                key={ep.id}
                episode={ep}
                onStatusUpdated={updateEpisodeStatus}
              />
            ))}

            <div
              ref={loaderRef}
              className="py-4 text-center text-gray-500 text-sm"
            >
              {searchLoading && searchHasMore
                ? "Loading..."
                : searchHasMore
                ? "Scroll to load more"
                : searchResults.length === 0
                ? "No results found."
                : "All loaded"}
            </div>
          </>
        ) : (
          <>
            {filtered.map((ep) => (
              <EpisodeCard
                key={ep.id}
                episode={ep}
                onStatusUpdated={updateEpisodeStatus}
              />
            ))}

            <div
              ref={loaderRef}
              className="py-4 text-center text-gray-500 text-sm"
            >
              {loading && hasMore
                ? "Loading..."
                : hasMore
                ? "Scroll to load more"
                : "All loaded"}
            </div>
          </>
        )}
      </div>

      {/* Scroll to Top Button */}
      {showScrollTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-4 right-4 p-3 rounded-full bg-[#1b5e20] text-white shadow-lg hover:scale-110 transition"
        >
          <FaAngleDoubleUp />
        </button>
      )}
      {!showAddForm && (
        <button
          onClick={() => setShowAddForm(true)}
          className="fixed bottom-4 p-3 rounded-full bg-[#1b5e20] text-white shadow-lg hover:scale-110 transition flex items-center gap-2"
        >
          <MdOutlinePostAdd size={24} />
          Add vocabulary
        </button>
      )}
      {showAddForm && (
        <AddVocabularyForm
          onClose={() => setShowAddForm(false)}
          onSave={handleSaveVocabulary}
        />
      )}
    </div>
  );
}
