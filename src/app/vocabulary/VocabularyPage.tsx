"use client";

import { useEffect, useRef, useState } from "react";
import { IUserVocabulary } from "@/types/vocabulary.interface";
import AddVocabularyForm from "../../components/AddVocabularyForm";
import { MdOutlinePostAdd } from "react-icons/md";
import VocabularyItem from "@/components/VocabularyItem";
import ConfirmDeleteModal from "../../components/ConfirmDeleteModal";

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
  const [editMode, setEditMode] = useState(false);
  const [editingItem, setEditingItem] = useState<IUserVocabulary | null>(null);

  const [deleteTarget, setDeleteTarget] = useState<IUserVocabulary | null>(null);
  const [deleteStatus, setDeleteStatus] = useState<"confirm" | "loading" | "success">("confirm");

  const [showGlobalLoading, setShowGlobalLoading] = useState(false);

  const loaderRef = useRef<HTMLDivElement>(null);

  const isSearchMode = () => searchTerm.trim().length >= 2;

  function openAddForm() {
    setEditMode(false);
    setEditingItem(null);
    setShowAddForm(true);
  }

  function handleEditVocabulary(item: IUserVocabulary) {
    setEditMode(true);
    setEditingItem(item);
    setShowAddForm(true);
  }

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
    const res = await fetch(`/api/user-vocab?userId=${USER_ID}&page=${targetPage}`);
    const json = await res.json();
    const newItems: IUserVocabulary[] = json.data || [];

    setItems((prev) => {
      const merged = [...prev, ...newItems];
      const unique = Array.from(new Map(merged.map((item) => [item.id, item])).values());
      return unique;
    });

    setPage((prev) => prev + 1);
    if (newItems.length < PAGE_SIZE) setHasMore(false);
    setLoading(false);
  }

  /** Load first page of search */
  async function loadFirstPageSearch() {
    const res = await fetch(`/api/user-vocab?userId=${USER_ID}&search=${encodeURIComponent(searchTerm)}&page=0`);
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
    const res = await fetch(`/api/user-vocab?userId=${USER_ID}&search=${encodeURIComponent(searchTerm)}&page=${searchPage}`);
    const json = await res.json();
    const newItems: IUserVocabulary[] = json.data || [];

    setSearchResults((prev) => {
      const merged = [...prev, ...newItems];
      const unique = Array.from(new Map(merged.map((item) => [item.id, item])).values());
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

  async function handleSaveVocabulary(data) {
    setShowGlobalLoading(true);

    try {
      let res;
      if (editMode && editingItem) {
        res = await fetch(`/api/user-vocab/${editingItem.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            word: data.word,
            definition: data.definition,
            example: data.example,
            episodeId: editingItem.episodeId,
            episodeTitle: editingItem.episodeTitle,
          }),
        });
      } else {
        res = await fetch("/api/user-vocab", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...data,
            userId: USER_ID,
          }),
        });
      }

      if (!res.ok) {
        alert("Failed to save vocabulary.");
        return;
      }

      // Reset state
      setEditingItem(null);
      setEditMode(false);

      // Reload list
      setItems([]);
      setPage(0);
      setHasMore(true);
      await loadMore(0);
    } catch (error) {
      console.error("Error saving vocabulary:", error);
      alert("Something went wrong while saving vocabulary.");
    } finally {
      setShowGlobalLoading(false);
    }
  }

  /** Delete vocabulary item */
  function handleDeleteVocabulary(item: IUserVocabulary) {
    setDeleteTarget(item);
    setDeleteStatus("confirm");
  }

  async function confirmDeleteFromServer() {
    if (!deleteTarget) return;

    setDeleteStatus("loading");

    try {
      const res = await fetch(`/api/user-vocab/${deleteTarget.id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const errorData = await res.json();
        console.error("API error:", errorData);
        alert("Failed to delete vocabulary: " + (errorData.error || res.statusText));
        setDeleteStatus("confirm");
        return;
      }

      setItems((prev) => prev.filter((i) => i.id !== deleteTarget.id));
      setSearchResults((prev) => prev.filter((i) => i.id !== deleteTarget.id));

      setDeleteStatus("success");
    } catch (error) {
      console.error("Error deleting vocabulary:", error);
      alert("Something went wrong while deleting vocabulary.");
      setDeleteStatus("confirm");
    }
  }

  const grouped = groupByDate(isSearchMode() ? searchResults : items);

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      {showGlobalLoading && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-green-700 border-opacity-50"></div>
        </div>
      )}
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
          <button onClick={handleClearSearch} className="px-3 py-2 bg-green-700 text-white rounded-lg hover:bg-green-800 transition">
            Back
          </button>
        )}
      </div>

      {/* Grouped by date */}
      <div className="space-y-6">
        {Object.entries(grouped).map(([date, items]) => (
          <div key={date} className="border rounded-lg bg-white shadow">
            <div className="px-4 py-2 border-b text-sm text-gray-500 font-medium bg-gray-50 rounded-t-lg">{date}</div>
            <div>
              {items.map((item, idx) => (
                <div key={item.id} className={`px-4 py-3 ${idx < items.length - 1 ? "border-b border-dashed border-gray-300" : ""}`}>
                  <VocabularyItem item={item} onEdit={handleEditVocabulary} onDelete={handleDeleteVocabulary} />
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
          onClick={openAddForm}
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
          initialData={
            editMode && editingItem
              ? {
                  word: editingItem.word,
                  definition: editingItem.definition,
                  example: editingItem.example || "",
                }
              : undefined
          }
        />
      )}

      <ConfirmDeleteModal
        open={!!deleteTarget}
        status={deleteStatus}
        itemWord={deleteTarget?.word || ""}
        onClose={() => setDeleteTarget(null)}
        onConfirm={confirmDeleteFromServer}
      />
    </div>
  );
}
