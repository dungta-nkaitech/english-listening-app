"use client";

import { useEffect, useRef, useState } from "react";
import { IUserVocabulary } from "@/types/vocabulary.interface";
import AddVocabularyForm from "@/components/AddVocabularyForm";
import { MdOutlinePostAdd } from "react-icons/md";
import NavigationBar from "@/components/NavigationBar";
import { fetchUserVocabularyPageClient } from "@/lib/client/userVocabClient";

const PAGE_SIZE = 10;

export default function VocabularyPageClient({
  userId,
  initialItems,
}: {
  userId: string;
  initialItems: IUserVocabulary[];
}) {
  const [items, setItems] = useState<IUserVocabulary[]>(initialItems);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);

  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<IUserVocabulary[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchPage, setSearchPage] = useState(0);
  const [searchHasMore, setSearchHasMore] = useState(true);

  const [showAddForm, setShowAddForm] = useState(false);
  const loaderRef = useRef<HTMLDivElement>(null);

  const isSearchMode = () => searchTerm.trim().length >= 2;

  /** Infinite Scroll observer */
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const target = entries[0];
        if (target.isIntersecting) {
          if (isSearchMode()) {
            if (!searchLoading && searchHasMore) loadMoreSearch();
          } else {
            if (!loading && hasMore) loadMore();
          }
        }
      },
      { rootMargin: "100px" }
    );

    if (loaderRef.current) observer.observe(loaderRef.current);
    return () => {
      if (loaderRef.current) observer.unobserve(loaderRef.current);
    };
  }, [loading, hasMore, searchLoading, searchHasMore, searchTerm]);

  /** Debounced search effect */
  useEffect(() => {
    if (!isSearchMode()) {
      resetSearch();
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
  }, [searchTerm]);

  /** Load More Normal */
  async function loadMore() {
    setLoading(true);
    const newItems = await fetchUserVocabularyPageClient(userId, page, "");

    setItems((prev) => mergeUnique(prev, newItems));
    setPage((prev) => prev + 1);
    if (newItems.length < PAGE_SIZE) setHasMore(false);
    setLoading(false);
  }

  /** Load First Search Page */
  async function loadFirstPageSearch() {
    const newItems = await fetchUserVocabularyPageClient(userId, 0, searchTerm);
    setSearchResults(newItems);
    if (newItems.length < PAGE_SIZE) setSearchHasMore(false);
    setSearchPage(1);
    setSearchLoading(false);
  }

  /** Load More Search Results */
  async function loadMoreSearch() {
    setSearchLoading(true);
    const newItems = await fetchUserVocabularyPageClient(
      userId,
      searchPage,
      searchTerm
    );
    setSearchResults((prev) => mergeUnique(prev, newItems));
    setSearchPage((prev) => prev + 1);
    if (newItems.length < PAGE_SIZE) setSearchHasMore(false);
    setSearchLoading(false);
  }

  /** Utilities */
  function resetSearch() {
    setSearchResults([]);
    setSearchPage(0);
    setSearchHasMore(true);
  }

  function handleClearSearch() {
    setSearchTerm("");
    resetSearch();
  }

  function mergeUnique(arr: IUserVocabulary[], newItems: IUserVocabulary[]) {
    const merged = [...arr, ...newItems];
    return Array.from(new Map(merged.map((item) => [item.id, item])).values());
  }

  function formatDate(str: string) {
    if (!str) return "";
    const date = new Date(str.replace(" ", "T"));
    return date.toLocaleDateString("en-GB");
  }

  function groupByDate(items: IUserVocabulary[]) {
    const groups: { [date: string]: IUserVocabulary[] } = {};
    items.forEach((item) => {
      const date = formatDate(item.createdAt);
      if (!groups[date]) groups[date] = [];
      groups[date].push(item);
    });
    return groups;
  }

  /** Handle Save New Vocabulary */
  async function handleSaveVocabulary(data: {
    word: string;
    definition: string;
    example: string;
  }) {
    try {
      const res = await fetch("/api/user-vocab", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, userId }),
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

      // Refresh the list
      setItems([]);
      setPage(0);
      setHasMore(true);
      loadMore();
    } catch (error) {
      console.error("Error saving vocabulary:", error);
      alert("Something went wrong while saving vocabulary.");
    }
  }

  const grouped = groupByDate(isSearchMode() ? searchResults : items);

  return (
    <>
      <div className="flex items-center justify-between px-4 py-3 bg-green-800 text-white">
        <NavigationBar />
      </div>
      <div className="max-w-2xl mx-auto px-4 py-6">
        {/* Search box */}
        <div className="flex items-center gap-2 mb-4">
          <input
            type="text"
            placeholder="Search your vocabulary..."
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

        {/* Grouped Items */}
        <div className="space-y-6">
          {Object.entries(grouped).map(([date, items]) => (
            <div key={date} className="border rounded-lg bg-white shadow">
              <div className="px-4 py-2 border-b text-sm text-gray-500 font-medium bg-gray-50">
                {date}
              </div>
              <div>
                {items.map((item, idx) => (
                  <div
                    key={item.id}
                    className={`flex justify-between items-start gap-4 px-4 py-3 ${
                      idx < items.length - 1
                        ? "border-b border-dashed border-gray-300"
                        : ""
                    }`}
                  >
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-bold break-words">
                        {item.word}
                      </h3>
                      <p className="text-gray-700 whitespace-pre-wrap">
                        {item.definition}
                      </p>
                      {item.example && (
                        <p className="italic text-gray-600">
                          Example: {item.example}
                        </p>
                      )}
                    </div>
                    <div className="flex flex-col gap-1 shrink-0">
                      <button
                        onClick={() => alert(`Edit: ${item.word}`)}
                        className="text-sm text-blue-600 hover:underline"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => alert(`Delete: ${item.word}`)}
                        className="text-sm text-red-600 hover:underline"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
          <div
            ref={loaderRef}
            className="py-4 text-center text-gray-500 text-sm"
          >
            {isSearchMode()
              ? searchLoading && searchHasMore
                ? "Loading..."
                : searchHasMore
                ? "Scroll to load more"
                : searchResults.length === 0
                ? "No results found."
                : "All loaded"
              : loading && hasMore
              ? "Loading..."
              : hasMore
              ? "Scroll to load more"
              : items.length === 0
              ? "No vocabulary yet."
              : "All loaded"}
          </div>
        </div>

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
    </>
  );
}
