"use client";

import { ITranscript } from "@/types/episode.interface";
import { useEffect, useState } from "react";

interface Props {
  transcripts: ITranscript[];
  currentTime: number;
  onClickTranscript?: (t: ITranscript) => void;
}

export default function TranscriptList({
  transcripts,
  currentTime,
  onClickTranscript,
}: Props) {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const index = transcripts.findIndex(
      (t) => currentTime >= t.startTime && currentTime < t.endTime
    );
    if (index !== -1) {
      setActiveIndex(index);
    }
  }, [currentTime, transcripts]);

  return (
    <div className="flex-1 overflow-y-auto">
      {transcripts.map((item, i) => {
        const isActive = i === activeIndex;
        return (
          <div
            key={item.id}
            className={`w-full py-1 text-[17px] leading-relaxed cursor-pointer ${
              isActive ? "font-semibold text-black" : "text-gray-600"
            }`}
            onClick={() => onClickTranscript?.(item)}
          >
            <span>{item.text}</span>
          </div>
        );
      })}
    </div>
  );
}
