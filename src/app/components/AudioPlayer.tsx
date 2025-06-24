import { useEffect, useState } from "react";
import { FaPause, FaPlay, FaHeart, FaCheckCircle } from "react-icons/fa";

interface Props {
  audioUrl?: string;
  currentTime: number;
  setCurrentTime: React.Dispatch<React.SetStateAction<number>>;
  audioRef: React.RefObject<HTMLAudioElement | null>;
  isPlaying: boolean;
  setIsPlaying: React.Dispatch<React.SetStateAction<boolean>>;
}

function AudioPlayer({
  audioUrl,
  currentTime,
  setCurrentTime,
  audioRef,
  isPlaying,
  setIsPlaying,
}: Props) {
  const [duration, setDuration] = useState(0);
  const [windowWidth, setWindowWidth] = useState(0);

  // 1. Lấy kích thước màn hình
  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };
    handleResize(); // lần đầu
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [window]);

  // Cập nhật currentTime khi audio phát
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateTime = () => setCurrentTime(audio.currentTime);
    const setAudioDuration = () => setDuration(audio.duration);

    audio.addEventListener("timeupdate", updateTime);
    audio.addEventListener("loadedmetadata", setAudioDuration);

    return () => {
      audio.removeEventListener("timeupdate", updateTime);
      audio.removeEventListener("loadedmetadata", setAudioDuration);
    };
  }, []);

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
    if (!audio) return;
    audio.currentTime = Math.max(
      0,
      Math.min(audio.currentTime + sec, duration)
    );
  };

  const playerWidth = Math.min(windowWidth, 430);

  function formatTime(seconds: number): string {
    const minutes = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${minutes}:${secs.toString().padStart(2, "0")}`;
  }
  return (
    <div className="fixed bottom-0" style={{ width: playerWidth }}>
      <div className="bg-white rounded-xl shadow-lg p-2 m-3">
        {/* Progress bar */}
        <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-green-600 transition-all"
            style={{ width: `${(currentTime / duration) * 100 || 0}%` }}
          ></div>
        </div>
        <div className="w-full flex justify-between text-sm text-gray-600">
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(duration)}</span>
        </div>

        {/* Control buttons */}
        <div className="flex items-center justify-center space-x-10">
          <button className="rounded-full shadow flex items-center justify-center hover:scale-110 transition">
            <FaHeart />
          </button>
          <button
            className="w-10 h-10 rounded-full bg-gray-200 shadow flex items-center justify-center text-gray-800 hover:bg-gray-400 transition"
            onClick={() => skipTime(-5)}
          >
            -5s
          </button>

          <button
            onClick={togglePlay}
            className="bg-green-600 hover:bg-green-700 text-white w-14 h-14 rounded-full flex items-center justify-center text-2xl shadow-lg transition"
          >
            {isPlaying ? <FaPause /> : <FaPlay />}
          </button>

          <button
            className="w-10 h-10 rounded-full bg-gray-200 shadow flex items-center justify-center text-gray-800 hover:bg-gray-400 transition"
            onClick={() => skipTime(5)}
          >
            +5s
          </button>
          <button className="tex flex items-center justify-center hover:scale-110 transition">
            <FaCheckCircle />
          </button>
        </div>

        {/* Hidden audio element */}
        <audio ref={audioRef} src={audioUrl} preload="metadata" />
      </div>
    </div>
  );
}

export default AudioPlayer;
