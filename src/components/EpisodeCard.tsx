"use client";

import { IEpisode } from "../types/episode.interface";
import Image from "next/image";
import { useState } from "react";
import { FaHeart, FaCheckCircle } from "react-icons/fa";
import { useRouter } from "next/navigation";

export default function EpisodeCard({ episode }: { episode: IEpisode }) {
  // State mô phỏng (sau này thay bằng real data/user)
  const [isFavorite, setIsFavorite] = useState(false);
  const [isLearned, setIsLearned] = useState(false);

  const router = useRouter();

  const handleClick = () => {
    router.push(`/episode/${episode.id}`);
  };

  return (
    <div
      className="flex rounded-xl shadow-sm bg-white p-3 gap-3"
      onClick={handleClick}
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
      <div className="flex-1 flex flex-col  overflow-hidden">
        <h2 className="text-base font-semibold text-gray-800 leading-tight line-clamp-2">
          {episode.title}
        </h2>
        <p className="text-sm text-gray-500 mt-1 line-clamp-2">
          {episode.description}
        </p>
      </div>

      {/* Actions */}
      <div className="flex flex-col items-center justify-center gap-3 px-1">
        {/* Favorite Button */}
        <button
          className="hover:scale-110 active:scale-95 transition-transform"
          onClick={() => setIsFavorite((prev) => !prev)}
        >
          <FaHeart
            size={20}
            className={isFavorite ? "text-red-500" : "text-gray-300"}
          />
        </button>

        {/* Learned Button */}
        <button
          className="flex flex-col items-center text-[11px] hover:scale-105 active:scale-95 transition-transform"
          onClick={() => setIsLearned((prev) => !prev)}
        >
          <FaCheckCircle
            size={20}
            className={isLearned ? "text-green-600" : "text-gray-300"}
          />
          <span
            className={
              isLearned ? "text-green-600 mt-0.5" : "text-gray-400 mt-0.5"
            }
          ></span>
        </button>
      </div>
    </div>
  );
}
