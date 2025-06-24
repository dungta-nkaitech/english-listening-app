'use client'

import AudioPlayer from '@/app/components/AudioPlayer'
import TranscriptList from '@/app/components/TranscriptList'
import { IEpisode } from '@/types/episode.interface'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { FaChevronLeft, FaHeart, FaCheckCircle, FaCog } from 'react-icons/fa'
import { mockTranscripts } from '../../../lib/mockTranscript'

export default function EpisodeDetail({ episode }: { episode: IEpisode }) {
  const router = useRouter()

  const [isFavorite, setIsFavorite] = useState(false)
  const [isLearned, setIsLearned] = useState(false)
  const [activeTab, setActiveTab] = useState<
    'transcript' | 'vocab' | 'quiz' | 'pdf'
  >('transcript')

  if (!episode) return <div className="p-4">Không tìm thấy episode</div>

  return (
    <div className="min-h-screen bg-[#fef6e4] text-[#000]">
      {/* Navigation */}
      <div className="flex items-center justify-between px-4 py-3 bg-green-800 text-white">
        <button
          onClick={() => router.push('/')}
          className="flex items-center space-x-2 font-semibold"
        >
          <FaChevronLeft />
          <span>LISTENING</span>
        </button>
        <div className="flex items-center space-x-4">
          <button
            onClick={() => setIsFavorite(!isFavorite)}
            className={isFavorite ? 'text-red-400' : ''}
            aria-label="Yêu thích"
          >
            <FaHeart />
          </button>
          <button
            onClick={() => setIsLearned(!isLearned)}
            className={isLearned ? 'text-green-400' : ''}
            aria-label="Đã học"
          >
            <FaCheckCircle />
          </button>
          <button>
            <FaCog />
          </button>
        </div>
      </div>

      {/* Nội dung */}
      <div className="px-4 pt-4">
        <h1 className="text-2xl font-bold mb-1">{episode.title}</h1>
        <p className="text-sm text-gray-600 mb-4">{episode.description}</p>

        {/* Tabs */}
        <div className="flex justify-between border-b border-gray-300 mb-4">
          {[
            { label: 'Transcripts', key: 'transcript' },
            { label: 'Vocabulary', key: 'vocab' },
            { label: 'Quiz', key: 'quiz' },
            { label: 'PDF', key: 'pdf' },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as typeof activeTab)}
              className={`flex-1 text-center py-2 text-sm font-medium transition ${
                activeTab === tab.key
                  ? 'bg-white shadow text-green-700 rounded-t-lg'
                  : 'text-gray-500 hover:text-black'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Transcription */}
        <TranscriptList
          transcripts={mockTranscripts}
          currentTime={15}
          onClickTranscript={(t) => {
            console.log('User clicked on:', t)
            // TODO: handle seek audio to t.startTime
          }}
        />

        {/* Audio Player */}
      </div>
      <div className="z-10 left-200">
        <AudioPlayer audioUrl={episode.audioUrl} />
      </div>
    </div>
  )
}
