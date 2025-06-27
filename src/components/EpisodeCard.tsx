"use client";

import { IEpisodeWithStatus } from "../types/episode.interface";
import Image from "next/image";
import { useEffect, useState } from "react";
import { FaHeart, FaCheckCircle } from "react-icons/fa";
import Link from "next/link";

// Hard-coded user for this project
const USER_ID = "88774f25-8043-4375-8a5e-3f6a0ea39374";

export default function EpisodeCard({
  episode,
  onStatusUpdated,
}: {
  episode: IEpisodeWithStatus;
  onStatusUpdated: (episodeId: string) => void;
}) {
  const [isFavorite, setIsFavorite] = useState(episode.isFavorite);
  const [isLearned, setIsLearned] = useState(episode.isLearned);

  // ✅ Sync state with props when parent re-renders with new data
  useEffect(() => {
    setIsFavorite(episode.isFavorite);
  }, [episode.isFavorite]);

  useEffect(() => {
    setIsLearned(episode.isLearned);
  }, [episode.isLearned]);

  // Call API to toggle favorite
  async function toggleFavorite(episodeId: string) {
    try {
      const res = await fetch("/api/favorites", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: USER_ID, episodeId }),
      });
      if (!res.ok) throw new Error("Failed to update favorite");
      setIsFavorite((prev) => !prev);
      onStatusUpdated(episodeId);
    } catch (err) {
      console.error(err);
    }
  }

  // Call API to toggle learnt
  async function toggleLearned(episodeId: string) {
    try {
      const res = await fetch("/api/learnt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: USER_ID, episodeId }),
      });
      if (!res.ok) throw new Error("Failed to update learnt");
      setIsLearned((prev) => !prev);
      onStatusUpdated(episodeId);
    } catch (err) {
      console.error(err);
    }
  }

  return (
    <Link
      prefetch
      href={`/episode/${episode.id}`}
      className={`flex rounded-xl shadow-sm p-3 gap-3 transition-colors ${
        isLearned
          ? "bg-[#b5e6b8] hover:bg-[#d6e6d7]"
          : "bg-white hover:bg-gray-50"
      }`}
    >
      {/* Thumbnail */}
      <div className="w-[110px] aspect-[3/2] overflow-hidden rounded-lg flex-shrink-0">
        <Image
          src={episode.thumbnailUrl || "/images/placeholder.jpg"}
          alt={episode.title}
          width={110}
          height={73}
          className="object-cover w-full h-full"
        />
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <h2 className="text-base font-semibold text-gray-800 leading-tight line-clamp-2">
          {episode.title}
        </h2>
        <p className="text-sm text-gray-500 mt-1 line-clamp-2">
          {episode.description}
        </p>
      </div>

      {/* Actions */}
      <div
        className="flex flex-col items-center justify-center gap-3 px-1"
        onClick={(e) => e.preventDefault()}
      >
        {/* Favorite Button */}
        <button
          className="hover:scale-110 active:scale-95 transition-transform"
          onClick={(e) => {
            e.stopPropagation();
            e.preventDefault();
            toggleFavorite(episode.id);
          }}
        >
          <FaHeart
            size={20}
            className={isFavorite ? "text-red-500" : "text-gray-300"}
          />
        </button>

        {/* Learned Button */}
        <button
          className="flex flex-col items-center text-[11px] hover:scale-105 active:scale-95 transition-transform"
          onClick={(e) => {
            e.stopPropagation();
            e.preventDefault();
            toggleLearned(episode.id);
          }}
        >
          <FaCheckCircle
            size={20}
            className={isLearned ? "text-green-600" : "text-gray-300"}
          />
        </button>
      </div>
    </Link>
  );
}
