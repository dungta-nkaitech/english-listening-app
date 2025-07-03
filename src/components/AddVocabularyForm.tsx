"use client";

import { useEffect, useState } from "react";

interface AddVocabularyFormProps {
  onClose: () => void;
  onSave: (data: { word: string; definition: string; example: string }) => void;
  initialData?: { word: string; definition: string; example: string };
}

export default function AddVocabularyForm({ onClose, onSave, initialData }: AddVocabularyFormProps) {
  const [word, setWord] = useState("");
  const [definition, setDefinition] = useState("");
  const [example, setExample] = useState("");

  // Prefill on open
  useEffect(() => {
    if (initialData) {
      setWord(initialData.word || "");
      setDefinition(initialData.definition || "");
      setExample(initialData.example || "");
    } else {
      setWord("");
      setDefinition("");
      setExample("");
    }
  }, [initialData]);

  function handleSubmit() {
    if (!word.trim()) {
      alert("Please fill in at Word");
      return;
    }
    onSave({ word, definition, example });
    onClose();
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-sm shadow-lg">
        <h2 className="text-lg font-bold mb-4">{initialData ? "Edit Vocabulary" : "Add Vocabulary"}</h2>
        <div className="flex flex-col gap-3">
          <input className="border rounded px-3 py-2" placeholder="Word" value={word} onChange={(e) => setWord(e.target.value)} />
          <p className="text-sm text-gray-500 mt-5">
            <span>Use **bold** for</span>
            <span className="font-bold"> bold</span>,<span> use *italic* for</span>
            <span className="italic"> italic</span>,<span> and use ***bold & italic*** for</span>
            <span className="font-bold italic"> bold &amp; italic</span>
          </p>

          <textarea className="border rounded px-3 py-2" placeholder="Definition" value={definition} onChange={(e) => setDefinition(e.target.value)} rows={5} />
          <textarea className="border rounded px-3 py-2" placeholder="Example" value={example} onChange={(e) => setExample(e.target.value)} rows={5} />
        </div>
        <div className="flex justify-end gap-2 mt-4">
          <button onClick={onClose} className="px-3 py-2 rounded bg-gray-300 hover:bg-gray-400">
            Cancel
          </button>
          <button onClick={handleSubmit} className="px-3 py-2 rounded bg-green-700 text-white hover:bg-green-800">
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
