'use client';

import { useEffect, useRef, useState } from 'react';
import AudioPlayer from '@/app/components/AudioPlayer';
import TranscriptList, { TranscriptListRef } from '@/app/components/TranscriptList';
import NavigationBar from '@/components/NavigationBar';
import { IEpisode, ITranscript } from '@/types/episode.interface';
import VocabularyList from './VocabularyList';
import { IUserVocabulary } from '@/types/vocabulary.interface';

const USER_ID = '88774f25-8043-4375-8a5e-3f6a0ea39374';

export default function EpisodeDetail({
  episode,
}: {
  episode: IEpisode;
}) {
  const [activeTab, setActiveTab] = useState<'transcript' | 'vocab' | 'quiz' | 'pdf'>('transcript');

  const transcriptRef = useRef<TranscriptListRef>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  const [currentTime, setCurrentTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  const [topDivHeight, setTopDivHeight] = useState(0);
  const topDivRef = useRef<HTMLDivElement>(null);

  const [isFavorite, setIsFavorite] = useState(false);
  const [isLearned, setIsLearned] = useState(false);

  const [transcripts, setTranscripts] = useState<ITranscript[]>([]);
  const [userVocabItems, setUserVocabItems] = useState<IUserVocabulary[]>([]);
  const [systemVocabItems, setSystemVocabItems] = useState<IUserVocabulary[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (topDivRef.current) {
      setTopDivHeight(topDivRef.current.offsetHeight);
    }
  }, []);

  // Fetch all episode-related data (transcripts + user_vocab + system_vocab)
  useEffect(() => {
    if (!episode?.id) return;

    setLoading(true);
    setError(null);

    async function fetchData() {
      try {
        const [transcriptsRes, userVocabRes, systemVocabRes] = await Promise.all([
          fetch(`/api/transcripts?episodeId=${episode.id}`),
          fetch(`/api/user-vocab?userId=${USER_ID}&episodeId=${episode.id}`),
          fetch(`/api/vocab-items?episodeId=${episode.id}`)
        ]);

        if (!transcriptsRes.ok) throw new Error('Failed to load transcripts');
        if (!userVocabRes.ok) throw new Error('Failed to load user vocabulary');
        if (!systemVocabRes.ok) throw new Error('Failed to load system vocabulary');

        const transcriptsJson = await transcriptsRes.json();
        const userVocabJson = await userVocabRes.json();
        const systemVocabJson = await systemVocabRes.json();

        setTranscripts(transcriptsJson.data || []);
        setUserVocabItems(userVocabJson.data || []);
        setSystemVocabItems(systemVocabJson.data || []);
      } catch (err: any) {
        console.error('Error loading episode data:', err);
        setError(err.message || 'Unknown error');
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [episode?.id]);

  // Initial load: fetch current favorite/learned status
  useEffect(() => {
    async function fetchStatus() {
      if (!episode?.id || !USER_ID) return;

      try {
        const res = await fetch(`/api/status?userId=${USER_ID}&episodeId=${episode.id}`);
        if (!res.ok) {
          console.error('Failed to fetch status', res.status);
          return;
        }
        const data = await res.json();
        setIsFavorite(!!data.isFavorite);
        setIsLearned(!!data.isLearned);
      } catch (err) {
        console.error('Error fetching status:', err);
      }
    }

    fetchStatus();
  }, [episode?.id]);

  /** Toggle Favorite button logic */
  async function toggleFavorite() {
    try {
      const res = await fetch('/api/favorites', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: USER_ID, episodeId: episode.id }),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Toggle favorite failed');

      if (json.status === 'added') setIsFavorite(true);
      else if (json.status === 'removed') setIsFavorite(false);

    } catch (err) {
      console.error('Error toggling favorite', err);
    }
  }

  /** Toggle Learnt button logic */
  async function toggleLearnt() {
    try {
      const res = await fetch('/api/learnt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: USER_ID, episodeId: episode.id }),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Toggle learnt failed');

      if (json.status === 'added') setIsLearned(true);
      else if (json.status === 'removed') setIsLearned(false);

    } catch (err) {
      console.error('Error toggling learnt', err);
    }
  }

  if (!episode) return <div className="p-4">Cannot load episode</div>;

  return (
    <div className="relative min-h-screen bg-[#fef6e4] text-[#000]">
      <div ref={topDivRef}>
        {/* Navigation */}
        <div className="flex items-center justify-between px-4 py-3 bg-green-800 text-white">
          <NavigationBar />
        </div>

        {/* Header */}
        <div className="px-4 pt-4">
          <h1 className="text-2xl font-bold mb-1">{episode.title}</h1>
          <p className="text-sm text-gray-600 mb-3">{episode.description}</p>

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

        {/* Main Content */}
        <div
          className="absolute left-0 right-0 overflow-y-auto px-4"
          style={{ top: topDivHeight + 5, bottom: 200 }}
        >
          {loading && <div className="text-center text-gray-500 py-6">Loading...</div>}
          {error && <div className="text-center text-red-500 py-6">{error}</div>}

          {!loading && !error && activeTab === 'transcript' && (
            <TranscriptList
              ref={transcriptRef}
              transcripts={transcripts}
              currentTime={currentTime}
              onClickTranscript={(t) => {
                if (audioRef.current) {
                  audioRef.current.currentTime = t.startTime;
                  audioRef.current.play();
                  setIsPlaying(true);
                }
              }}
            />
          )}

          {!loading && !error && activeTab === 'vocab' && (
            <VocabularyList
              userVocabItems={userVocabItems}
              systemVocabItems={systemVocabItems}
              onEditUserVocab={(item) => alert(`Edit: ${item.word}`)}
              onDeleteUserVocab={(item) => alert(`Delete: ${item.word}`)}
            />
          )}
        </div>
      </div>

      {/* Audio Player */}
      {episode.audioUrl && (
        <AudioPlayer
          transcriptRef={transcriptRef}
          audioRef={audioRef}
          audioUrl={episode.audioUrl}
          currentTime={currentTime}
          setCurrentTime={setCurrentTime}
          isPlaying={isPlaying}
          setIsPlaying={setIsPlaying}
          isFavorite={isFavorite}
          isLearned={isLearned}
          toggleFavorite={toggleFavorite}
          toggleLearnt={toggleLearnt}
        />
      )}
    </div>
  );
}
