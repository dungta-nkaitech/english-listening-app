'use client'

import AudioPlayer from '@/app/components/AudioPlayer'
import TranscriptList from '@/app/components/TranscriptList'
import { IEpisode, ITranscript, IVocabItem } from '@/types/episode.interface'
import { useEffect, useRef, useState } from 'react'
import NavigationBar from './NavigationBar'
import VocabList from '@/app/components/VocabList'

export default function EpisodeDetail({
  episode,
  transcripts,
  vocabItems,
}: //
{
  episode: IEpisode
  transcripts: ITranscript[]
  vocabItems: IVocabItem[]
}) {
  //const [isFavorite, setIsFavorite] = useState(false);
  //const [isLearned, setIsLearned] = useState(false);
  const [activeTab, setActiveTab] = useState<
    'transcript' | 'vocab' | 'quiz' | 'pdf'
  >('transcript')

  const [currentTime, setCurrentTime] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  const [topDivHeight, setTopDivHeight] = useState(0)

  const topDivRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (topDivRef.current) {
      setTopDivHeight(topDivRef.current.offsetHeight)
    }
  }, [topDivRef]) // [] để chạy 1 lần sau khi render

  if (!episode) return <div className="p-4">Không tìm thấy episode</div>

  return (
    <div className="relative min-h-screen bg-[#fef6e4] text-[#000]">
      <div ref={topDivRef}>
        {/* Navigation */}
        <div className="flex items-center justify-between px-4 py-3 bg-green-800 text-white">
          <NavigationBar></NavigationBar>
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
        </div>
        {/* Transcription */}
        {/* Transcript scrollable */}
        <div
          className="absolute left-0 right-0 overflow-y-auto px-4"
          style={{ top: topDivHeight + 10, bottom: 150 }}
        >
          {activeTab == 'transcript' && (
            <TranscriptList
              transcripts={transcripts}
              currentTime={currentTime}
              onClickTranscript={(t) => {
                if (audioRef.current) {
                  audioRef.current.currentTime = t.startTime
                  audioRef.current.play() // (tuỳ chọn)
                  setIsPlaying(true)
                }
              }}
            />
          )}
          {activeTab == 'vocab' && <VocabList vocabItems={vocabItems} />}
          {activeTab == 'quiz' && (
            <TranscriptList
              transcripts={transcripts}
              currentTime={currentTime}
              onClickTranscript={(t) => {
                if (audioRef.current) {
                  audioRef.current.currentTime = t.startTime
                  audioRef.current.play() // (tuỳ chọn)
                  setIsPlaying(true)
                }
              }}
            />
          )}
          {activeTab == 'pdf' && (
            <TranscriptList
              transcripts={transcripts}
              currentTime={currentTime}
              onClickTranscript={(t) => {
                if (audioRef.current) {
                  audioRef.current.currentTime = t.startTime
                  audioRef.current.play() // (tuỳ chọn)
                  setIsPlaying(true)
                }
              }}
            />
          )}
        </div>
      </div>

      {/* Audio Player */}
      <div>
        <AudioPlayer
          audioRef={audioRef}
          audioUrl={episode.audioUrl}
          currentTime={currentTime}
          setCurrentTime={setCurrentTime}
          isPlaying={isPlaying}
          setIsPlaying={setIsPlaying}
        />
      </div>
    </div>
  )
}
