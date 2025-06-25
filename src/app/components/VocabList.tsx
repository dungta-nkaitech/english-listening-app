// components/VocabList.tsx
"use client";

import { IVocabItem } from "@/types/episode.interface";

export default function VocabList({
  vocabItems,
}: {
  vocabItems: IVocabItem[];
}) {
  if (!vocabItems.length) {
    return <p className="p-4 text-gray-500">Chưa có dữ liệu từ vựng.</p>;
  }

  return (
    <div className="p-4 space-y-3">
      {vocabItems.map((item) => (
        <div
          key={item.id}
          className="border border-gray-300 rounded-lg p-3 bg-white shadow-sm"
        >
          <h4 className="font-semibold text-lg text-blue-700">{item.word}</h4>
          <p className="text-gray-700">{item.definition}</p>
          {item.example && (
            <p className="text-sm text-gray-500 mt-1 italic">
              Ví dụ: {item.example}
            </p>
          )}
        </div>
      ))}
    </div>
  );
}
