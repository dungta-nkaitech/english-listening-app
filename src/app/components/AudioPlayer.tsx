"use client";

import { useEffect, useState, useRef } from "react";
import { FaPause, FaPlay, FaHeart, FaCheckCircle } from "react-icons/fa";
import { TranscriptListRef } from "./TranscriptList";

interface Props {
  audioUrl: string;
  currentTime: number;
  setCurrentTime: React.Dispatch<React.SetStateAction<number>>;
  audioRef: React.RefObject<HTMLAudioElement | null>;
  isPlaying: boolean;
  setIsPlaying: React.Dispatch<React.SetStateAction<boolean>>;
  transcriptRef: React.RefObject<TranscriptListRef | null>;
}

export default function AudioPlayer({
  audioUrl,
  audioRef,
  currentTime,
  setCurrentTime,
  isPlaying,
  setIsPlaying,
  transcriptRef,
}: Props) {
  const [duration, setDuration] = useState(0);

  // Cập nhật currentTime khi audio phát
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateTime = () => {
      setCurrentTime(audio.currentTime);
    };

    audio.addEventListener("timeupdate", updateTime);
    return () => {
      audio.removeEventListener("timeupdate", updateTime);
    };
  }, [audioRef, setCurrentTime]);

  // Gắn loadedmetadata để lấy duration
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleLoadedMetadata = () => {
      setDuration(audio.duration);
    };

    audio.addEventListener("loadedmetadata", handleLoadedMetadata);

    if (audio.readyState >= 1 && !isNaN(audio.duration) && audio.duration > 0) {
      handleLoadedMetadata();
    }

    return () => {
      audio.removeEventListener("loadedmetadata", handleLoadedMetadata);
    };
  }, [audioUrl, audioRef]);

  // Bắt phím tắt: Space / ArrowLeft / ArrowRight
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement).tagName;
      if (tag === "INPUT" || tag === "TEXTAREA") return;

      const audio = audioRef.current;
      if (!audio) return;

      switch (e.code) {
        case "Space":
          e.preventDefault();
          togglePlay();
          break;
        case "ArrowLeft":
          e.preventDefault();
          skipTime(-5);
          break;
        case "ArrowRight":
          e.preventDefault();
          skipTime(5);
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [audioRef, isPlaying]);

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
    } else {
      audio.play();
    }

    setIsPlaying(!isPlaying);
  };

  const skipTime = (sec: number) => {
    const audio = audioRef.current;
    if (!audio || !audio.duration || isNaN(audio.duration)) return;

    const newTime = Math.max(
      0,
      Math.min(audio.currentTime + sec, audio.duration)
    );
    audio.currentTime = newTime;
    setCurrentTime(newTime);
    transcriptRef.current?.scrollToActive();
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const audio = audioRef.current;
    if (!audio) return;

    const newTime = Number(e.target.value);
    audio.currentTime = newTime;
    setCurrentTime(newTime);
    transcriptRef.current?.scrollToActive();
  };

  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${minutes}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="fixed bottom-0 w-full max-w-[430px]">
      <div className="bg-white rounded-xl shadow-lg p-2 m-3 h-[140px]">
        {/* Progress bar (click + drag) */}
        <input
          type="range"
          min={0}
          max={duration}
          step={0.1}
          value={currentTime}
          onChange={handleSeek}
          className="w-full mt-2 accent-green-600 cursor-pointer"
        />

        {/* Thời gian */}
        <div className="w-full mt-1 flex justify-between text-sm text-gray-600">
          <span>{formatTime(currentTime)}</span>
          <span>{duration ? formatTime(duration) : "..."}</span>
        </div>

        {/* Control buttons */}
        <div className="flex items-center justify-center space-x-10 mt-2">
          <button className="rounded-full shadow flex items-center justify-center hover:scale-110 transition">
            <FaHeart />
          </button>
          <button
            className="w-10 h-10 rounded-full bg-gray-200 shadow flex items-center justify-center text-gray-800 hover:bg-gray-400 transition"
            onClick={() => skipTime(-50)}
          >
            -5s
          </button>

          <button
            onClick={togglePlay}
            className="bg-[#016630] hover:bg-green-700 text-white w-14 h-14 rounded-full flex items-center justify-center text-2xl shadow-lg transition"
          >
            {isPlaying ? <FaPause /> : <FaPlay />}
          </button>

          <button
            className="w-10 h-10 rounded-full bg-gray-200 shadow flex items-center justify-center text-gray-800 hover:bg-gray-400 transition"
            onClick={() => skipTime(50)}
          >
            +5s
          </button>
          <button className="tex flex items-center justify-center hover:scale-110 transition">
            <FaCheckCircle />
          </button>
        </div>

        <audio ref={audioRef} src={audioUrl} preload="auto" />
      </div>
    </div>
  );
}
