"use client";

import { useEffect, useRef, useState } from "react";
import { IUserVocabulary } from "@/types/vocabulary.interface";
import AddVocabularyForm from "../../components/AddVocabularyForm";
import { MdOutlinePostAdd } from "react-icons/md";

const USER_ID = "88774f25-8043-4375-8a5e-3f6a0ea39374";
const PAGE_SIZE = 10;

export default function VocabularyPage() {
  const [items, setItems] = useState<IUserVocabulary[]>([]);
  const [page, setPage] = useState(0);
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

  // Load on mount
  useEffect(() => {
    loadMore(0);
  }, []);

  // Infinite Scroll
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
  }, [loading, hasMore, searchLoading, searchHasMore, searchTerm, page]);

  // Debounced search
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
  }, [searchTerm]);

  /** Load more normal list */
  async function loadMore(targetPage: number) {
    setLoading(true);
    const res = await fetch(
      `/api/user-vocab?userId=${USER_ID}&page=${targetPage}`
    );
    const json = await res.json();
    const newItems: IUserVocabulary[] = json.data || [];

    setItems((prev) => {
      const merged = [...prev, ...newItems];
      const unique = Array.from(
        new Map(merged.map((item) => [item.id, item])).values()
      );
      return unique;
    });

    setPage((prev) => prev + 1);
    if (newItems.length < PAGE_SIZE) setHasMore(false);
    setLoading(false);
  }

  /** Load first page of search */
  async function loadFirstPageSearch() {
    const res = await fetch(
      `/api/user-vocab?userId=${USER_ID}&search=${encodeURIComponent(
        searchTerm
      )}&page=0`
    );
    const json = await res.json();
    const newItems: IUserVocabulary[] = json.data || [];

    setSearchResults(newItems);
    if (newItems.length < PAGE_SIZE) setSearchHasMore(false);
    setSearchPage(1);
    setSearchLoading(false);
  }

  /** Load more search results */
  async function loadMoreSearch() {
    setSearchLoading(true);
    const res = await fetch(
      `/api/user-vocab?userId=${USER_ID}&search=${encodeURIComponent(
        searchTerm
      )}&page=${searchPage}`
    );
    const json = await res.json();
    const newItems: IUserVocabulary[] = json.data || [];

    setSearchResults((prev) => {
      const merged = [...prev, ...newItems];
      const unique = Array.from(
        new Map(merged.map((item) => [item.id, item])).values()
      );
      return unique;
    });

    setSearchPage((prev) => prev + 1);
    if (newItems.length < PAGE_SIZE) setSearchHasMore(false);
    setSearchLoading(false);
  }

  /** Clear search */
  function handleClearSearch() {
    setSearchTerm("");
    setSearchResults([]);
    setSearchPage(0);
    setSearchHasMore(true);
  }

  function formatDate(str: string) {
    if (!str) return "";
    const iso = str.replace(" ", "T");
    const date = new Date(iso);
    return date.toLocaleDateString("en-GB");
  }

  /** Group items by date */
  function groupByDate(items: IUserVocabulary[]) {
    const groups: { [date: string]: IUserVocabulary[] } = {};
    items.forEach((item) => {
      const date = formatDate(item.createdAt);
      if (!groups[date]) groups[date] = [];
      groups[date].push(item);
    });
    return groups;
  }

  /** Handle save new vocabulary (same logic as EpisodeTabs) */
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

      // Optional: reload first page
      setItems([]);
      setPage(0);
      setHasMore(true);
      loadMore(0);
    } catch (error) {
      console.error("Error saving vocabulary:", error);
      alert("Something went wrong while saving vocabulary.");
    }
  }

  /** Dummy edit/delete handlers */
  function handleEdit(item: IUserVocabulary) {
    alert(`Edit: ${item.word}`);
  }

  function handleDelete(item: IUserVocabulary) {
    alert(`Delete: ${item.word}`);
  }

  const grouped = groupByDate(isSearchMode() ? searchResults : items);

  return (
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

      {/* Grouped by date */}
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
                      onClick={() => handleEdit(item)}
                      className="text-sm text-blue-600 hover:underline"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(item)}
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

        {/* Loader / status */}
        <div ref={loaderRef} className="py-4 text-center text-gray-500 text-sm">
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

      {/* Add Vocabulary Floating Button */}
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
