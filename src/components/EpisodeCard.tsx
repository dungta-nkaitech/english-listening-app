"use client";

import { IEpisodeWithStatus } from "../types/episode.interface";
import Image from "next/image";
import { useEffect, useState } from "react";
import { FaHeart, FaCheckCircle } from "react-icons/fa";
import Link from "next/link";

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

  // Đồng bộ lại khi props thay đổi từ cha
  useEffect(() => {
    setIsFavorite(episode.isFavorite);
  }, [episode.isFavorite]);

  useEffect(() => {
    setIsLearned(episode.isLearned);
  }, [episode.isLearned]);

  async function handleToggleFavorite() {
    try {
      const res = await fetch("/api/favorites", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: USER_ID, episodeId: episode.id }),
      });
      if (!res.ok) throw new Error("Failed to update favorite");

      const data = await res.json();
      setIsFavorite(data.status === "added");

      // Yêu cầu cha reload trạng thái thật từ server
      onStatusUpdated(episode.id);
    } catch (err) {
      console.error("Error toggling favorite", err);
    }
  }

  async function handleToggleLearned() {
    try {
      const res = await fetch("/api/learnt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: USER_ID, episodeId: episode.id }),
      });
      if (!res.ok) throw new Error("Failed to update learnt");

      const data = await res.json();
      setIsLearned(data.status === "added");

      onStatusUpdated(episode.id);
    } catch (err) {
      console.error("Error toggling learnt", err);
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
      <div className="w-[110px] aspect-[3/2] overflow-hidden rounded-lg flex-shrink-0">
        <Image
          src={episode.thumbnailUrl || "/images/placeholder.jpg"}
          alt={episode.title}
          width={110}
          height={73}
          className="object-cover w-full h-full"
        />
      </div>

      <div className="flex-1 flex flex-col overflow-hidden">
        <h2 className="text-base font-semibold text-gray-800 leading-tight line-clamp-2">
          {episode.title}
        </h2>
        <p className="text-sm text-gray-500 mt-1 line-clamp-2">
          {episode.description}
        </p>
      </div>

      <div
        className="flex flex-col items-center justify-center gap-3 px-1"
        onClick={(e) => e.preventDefault()}
      >
        <button
          className="hover:scale-110 active:scale-95 transition-transform"
          onClick={(e) => {
            e.stopPropagation();
            e.preventDefault();
            handleToggleFavorite();
          }}
        >
          <FaHeart
            size={20}
            className={isFavorite ? "text-red-500" : "text-gray-300"}
          />
        </button>

        <button
          className="flex flex-col items-center text-[11px] hover:scale-105 active:scale-95 transition-transform"
          onClick={(e) => {
            e.stopPropagation();
            e.preventDefault();
            handleToggleLearned();
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
