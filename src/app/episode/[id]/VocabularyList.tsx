"use client";

import { useEffect, useState } from "react";
import { IUserVocabulary } from "@/types/vocabulary.interface";
import VocabularyItem from "@/components/VocabularyItem";
import AddVocabularyForm from "@/components/AddVocabularyForm";
import ConfirmDeleteModal from "@/components/ConfirmDeleteModal";
import { MdOutlinePostAdd } from "react-icons/md";
import { IEpisode } from "@/types/episode.interface";

interface Props {
  episode: IEpisode;
  userVocabItems: IUserVocabulary[];
  systemVocabItems: IUserVocabulary[];
}

const USER_ID = "88774f25-8043-4375-8a5e-3f6a0ea39374";

export default function VocabularyList({ episode, userVocabItems, systemVocabItems }: Props) {
  const [userItems, setUserItems] = useState<IUserVocabulary[]>(userVocabItems);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editingItem, setEditingItem] = useState<IUserVocabulary | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState<IUserVocabulary | null>(null);
  const [deleteStatus, setDeleteStatus] = useState<"confirm" | "loading" | "success">("confirm");

  /** ✅ Load fresh vocab list from server */
  async function loadUserVocab() {
    try {
      const res = await fetch(`/api/user-vocab?userId=${USER_ID}&episodeId=${episode.id}`);
      const json = await res.json();
      if (res.ok && json.data) {
        setUserItems(json.data);
      } else {
        console.error("Failed to fetch vocab list:", json.error);
      }
    } catch (error) {
      console.error("Error loading user vocab:", error);
    }
  }

  /** ✅ Load once on mount */
  useEffect(() => {
    loadUserVocab();
  }, []);

  /** ✅ Add or Edit handler - calls API then reloads */
  async function handleSaveVocabulary(data: { word: string; definition: string; example: string }) {
    setIsSaving(true);
    try {
      let res;
      if (editMode && editingItem) {
        // Edit
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
        // Add new
        res = await fetch("/api/user-vocab", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...data,
            episodeId: episode.id,
            episodeTitle: episode.title,
            userId: USER_ID,
          }),
        });
      }

      if (!res.ok) {
        const errorData = await res.json();
        console.error("API error:", errorData);
        alert(`Failed to save vocabulary: ${errorData.error || res.statusText}`);
        return;
      }

      // ✅ Reload from DB
      await loadUserVocab();

      // ✅ Reset UI
      setShowAddForm(false);
      setEditingItem(null);
      setEditMode(false);
    } catch (error) {
      console.error("Error saving vocabulary:", error);
      alert("Something went wrong while saving vocabulary.");
    } finally {
      setIsSaving(false);
    }
  }

  /** ✅ Delete handler - calls API then reloads */
  async function confirmDeleteFromModal() {
    if (!deleteTarget) return;
    setDeleteStatus("loading");
    try {
      const res = await fetch(`/api/user-vocab/${deleteTarget.id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const errorData = await res.json();
        console.error("API error:", errorData);
        alert(`Failed to delete vocabulary: ${errorData.error || res.statusText}`);
        setDeleteStatus("confirm");
        return;
      }

      // ✅ Reload from DB
      await loadUserVocab();
      setDeleteStatus("success");
    } catch (error) {
      console.error("Error deleting vocabulary:", error);
      alert("Something went wrong while deleting vocabulary.");
      setDeleteStatus("confirm");
    }
  }

  /** ✅ Click Edit → open modal with data */
  function handleEditClick(item: IUserVocabulary) {
    setEditMode(true);
    setEditingItem(item);
    setShowAddForm(true);
  }

  /** ✅ Click Delete → open confirm modal */
  function handleDeleteClick(item: IUserVocabulary) {
    setDeleteTarget(item);
    setDeleteStatus("confirm");
  }

  return (
    <div className="max-w-2xl mx-auto px-2 py-2 space-y-6 relative">
      {/* ✅ Global Saving Overlay */}
      {isSaving && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-green-700 border-opacity-50"></div>
        </div>
      )}

      {/* ✅ Your Vocabulary Section */}
      <div className="border rounded-lg bg-white shadow">
        <div className="flex items-center justify-between px-4 py-3 border-b text-green-800 font-bold bg-gray-50 rounded-t-lg">
          <span>Your Vocabulary</span>
          <button
            onClick={() => {
              setEditMode(false);
              setEditingItem(null);
              setShowAddForm(true);
            }}
            className="text-green-800 p-2 hover:scale-105 transition rounded-full"
          >
            <MdOutlinePostAdd size={20} />
          </button>
        </div>
        <div>
          {userItems.map((item, idx) => (
            <div key={item.id} className={`px-4 py-3 ${idx < userItems.length - 1 ? "border-b border-dashed border-gray-300" : ""}`}>
              <VocabularyItem item={item} onEdit={() => handleEditClick(item)} onDelete={() => handleDeleteClick(item)} hideEpisodeLink />
            </div>
          ))}
          {userItems.length === 0 && <div className="text-center text-gray-400 py-4">No personal vocabulary yet.</div>}
        </div>
      </div>

      {/* ✅ System Vocabulary Section */}
      <div className="border rounded-lg bg-white shadow">
        <div className="px-4 py-3 border-b text-green-800 font-bold bg-gray-50 rounded-t-lg">Episode&apos;s Vocabulary</div>
        <div>
          {systemVocabItems.map((item, idx) => (
            <div key={item.id} className={`px-4 py-3 ${idx < systemVocabItems.length - 1 ? "border-b border-dashed border-gray-300" : ""}`}>
              <VocabularyItem item={item} hideEpisodeLink />
            </div>
          ))}
          {systemVocabItems.length === 0 && <div className="text-center text-gray-400 py-4">No system vocabulary available.</div>}
        </div>
      </div>

      {/* ✅ Add/Edit Form Modal */}
      {showAddForm && (
        <AddVocabularyForm
          onClose={() => {
            setShowAddForm(false);
            setEditingItem(null);
            setEditMode(false);
          }}
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

      {/* ✅ Confirm Delete Modal */}
      <ConfirmDeleteModal
        open={!!deleteTarget}
        status={deleteStatus}
        itemWord={deleteTarget?.word || ""}
        onClose={() => setDeleteTarget(null)}
        onConfirm={confirmDeleteFromModal}
      />
    </div>
  );
}
