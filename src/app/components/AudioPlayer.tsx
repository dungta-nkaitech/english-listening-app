import { useEffect, useRef, useState } from 'react'
import { FaPause, FaPlay } from 'react-icons/fa'

function AudioPlayer({ audioUrl }: { audioUrl: string }) {
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [windowWidth, setWindowWidth] = useState(0)

  // 1. Lấy kích thước màn hình
  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth)
    }
    handleResize() // lần đầu
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [window])

  // Cập nhật currentTime khi audio phát
  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    const updateTime = () => setCurrentTime(audio.currentTime)
    const setAudioDuration = () => setDuration(audio.duration)

    audio.addEventListener('timeupdate', updateTime)
    audio.addEventListener('loadedmetadata', setAudioDuration)

    return () => {
      audio.removeEventListener('timeupdate', updateTime)
      audio.removeEventListener('loadedmetadata', setAudioDuration)
    }
  }, [])

  const togglePlay = () => {
    const audio = audioRef.current
    if (!audio) return
    if (isPlaying) {
      audio.pause()
    } else {
      audio.play()
    }
    setIsPlaying(!isPlaying)
  }

  const skipTime = (sec: number) => {
    const audio = audioRef.current
    if (!audio) return
    audio.currentTime = Math.max(0, Math.min(audio.currentTime + sec, duration))
  }

  const playerWidth = Math.min(windowWidth, 430)

  return (
    <div
      className="fixed bottom-0"
      style={{ width: playerWidth }}
    >
      <div
        className="bg-white rounded-xl shadow-lg p-4 m-3"
      >
        {/* Progress bar */}
        <div className="w-full h-2 bg-gray-200 rounded-full mb-4 overflow-hidden">
          <div
            className="h-full bg-green-600 transition-all"
            style={{ width: `${(currentTime / duration) * 100 || 0}%` }}
          ></div>
        </div>

        {/* Control buttons */}
        <div className="flex items-center justify-center space-x-10">
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
        </div>

        {/* Hidden audio element */}
        <audio ref={audioRef} src={audioUrl} preload="metadata" />
      </div>
    </div>
  )
}

export default AudioPlayer
