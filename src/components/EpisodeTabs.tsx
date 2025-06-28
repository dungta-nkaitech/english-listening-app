'use client';

import { useEffect, useRef, useState } from 'react';
import { IEpisode, IEpisodeWithStatus } from '@/types/episode.interface';
import EpisodeCard from './EpisodeCard';
import { fetchEpisodesPage, fetchEpisodesSearch } from '../lib/fetchEpisodes';
import { FaAngleDoubleUp } from 'react-icons/fa';
import { MdOutlinePostAdd } from 'react-icons/md';
import AddVocabularyForm from './AddVocabularyForm';
import Link from 'next/link';

const USER_ID = '88774f25-8043-4375-8a5e-3f6a0ea39374';
const PAGE_SIZE = 20;

type Tab = 'all' | 'favorites' | 'learned';

export default function EpisodeTabs() {
  const [episodes, setEpisodes] = useState<IEpisodeWithStatus[]>([]);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [currentTab, setCurrentTab] = useState<Tab>('all');

  const loaderRef = useRef<HTMLDivElement>(null);

  /** Search states */
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<IEpisodeWithStatus[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchPage, setSearchPage] = useState(0);
  const [searchHasMore, setSearchHasMore] = useState(true);

  /** Scroll to top button */
  const [showScrollTop, setShowScrollTop] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);

  /** show add Vocabulary Form */
  const [showAddForm, setShowAddForm] = useState(false);

  /** 1️⃣ First load on mount: load episodes + status */
  useEffect(() => {
    async function init() {
      await loadFirstPage();
    }
    init();
  }, []);

  /** 2️⃣ Always refresh status and merge when window regains focus */
  useEffect(() => {
    const handleFocus = () => {
      console.log('[EpisodeTabs] Window focus → refresh status and merge.');
      refreshAllStatus();
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [episodes]);

  /** 3️⃣ Infinite scroll observer */
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const target = entries[0];
        if (target.isIntersecting) {
          if (isSearchMode()) {
            if (!searchLoading && searchHasMore) loadMoreSearch();
          } else {
            if (!loading && hasMore) loadMore(page);
          }
        }
      },
      { rootMargin: '100px' }
    );

    if (loaderRef.current) observer.observe(loaderRef.current);
    return () => {
      if (loaderRef.current) observer.unobserve(loaderRef.current);
    };
  }, [loading, hasMore, searchLoading, searchHasMore, searchTerm, page]);

  /** 4️⃣ Check if in search mode */
  const isSearchMode = () => searchTerm.trim().length >= 2;

  /** 5️⃣ Debounced search trigger */
  useEffect(() => {
    if (!isSearchMode()) {
      setSearchResults([]);
      setSearchPage(0);
      setSearchHasMore(true);
      return;
    }

    setSearchLoading(true);
    setSearchResults([]);
    setSearchPage(0);
    setSearchHasMore(true);

    const timer = setTimeout(() => {
      loadFirstPageSearch();
    }, 400);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  /** 6️⃣ Backspace shortcut to clear search */
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Backspace' && isSearchMode()) {
        const active = document.activeElement;
        if (
          active &&
          (active.tagName === 'INPUT' ||
            active.tagName === 'TEXTAREA' ||
            active.getAttribute('contenteditable') === 'true')
        ) {
          return;
        }
        e.preventDefault();
        handleClearSearch();
      }
    };

    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, [searchTerm]);

  /** ✅ Load first page on mount */
  const loadFirstPage = async () => {
    setLoading(true);
    setPage(0);
    setHasMore(true);

    const newEpisodes = await fetchEpisodesPage(0);
    const newEpisodesWithStatus: IEpisodeWithStatus[] = newEpisodes.map((ep) => ({
      ...ep,
      isFavorite: false,
      isLearned: false,
    }));

    setEpisodes(newEpisodesWithStatus);
    setPage(1);
    setLoading(false);

    await refreshAllStatus();
  };

  /** ✅ Load more episodes with status merge */
  const loadMore = async (targetPage: number) => {
    setLoading(true);

    const newEpisodes = await fetchEpisodesPage(targetPage);
    const newEpisodesWithStatus: IEpisodeWithStatus[] = newEpisodes.map((ep) => ({
      ...ep,
      isFavorite: false,
      isLearned: false,
    }));

    setEpisodes((prev) => {
      const merged = [...prev, ...newEpisodesWithStatus];
      return Array.from(new Map(merged.map((ep) => [ep.id, ep])).values());
    });

    setPage((prev) => prev + 1);
    if (newEpisodes.length < PAGE_SIZE) setHasMore(false);
    setLoading(false);

    // 🔥 Merge new status from server immediately
    await refreshAllStatus();
  };

  /** ✅ Refresh status for ALL loaded episodes */
  async function refreshAllStatus() {
    try {
      const res = await fetch(`/api/status?userId=${USER_ID}`);
      if (!res.ok) throw new Error('Failed to fetch user status');
      const data = await res.json();

      const favorites = data.favorites || [];
      const learnt = data.learnt || [];

      console.log('[EpisodeTabs] Merging status from /api/status', data);

      setEpisodes((prev) =>
        prev.map((ep) => ({
          ...ep,
          isFavorite: favorites.includes(ep.id),
          isLearned: learnt.includes(ep.id),
        }))
      );
    } catch (err) {
      console.error('Error refreshing status:', err);
    }
  }

  /** ✅ Refresh single episode (from EpisodeCard) */
  async function refreshSingleEpisode(episodeId: string) {
    try {
      const res = await fetch(`/api/status?userId=${USER_ID}&episodeId=${episodeId}`);
      const data = await res.json();

      if (data.episodeId) {
        setEpisodes((prev) =>
          prev.map((ep) =>
            ep.id === episodeId
              ? { ...ep, isFavorite: data.isFavorite, isLearned: data.isLearned }
              : ep
          )
        );
      } else {
        console.error('Invalid single-episode response:', data);
      }
    } catch (err) {
      console.error('Error refreshing single episode:', err);
    }
  }

  /** Load first page of search */
  const loadFirstPageSearch = async () => {
    const results: IEpisode[] = await fetchEpisodesSearch(searchTerm.trim(), 0);
    const resultsWithStatus: IEpisodeWithStatus[] = results.map((ep) => ({
      ...ep,
      isFavorite: false,
      isLearned: false,
    }));

    setSearchResults(resultsWithStatus);
    if (results.length < PAGE_SIZE) setSearchHasMore(false);
    setSearchPage(1);
    setSearchLoading(false);
  };

  /** Load more search results */
  const loadMoreSearch = async () => {
    setSearchLoading(true);

    const newResults: IEpisode[] = await fetchEpisodesSearch(searchTerm.trim(), searchPage);
    const newResultsWithStatus: IEpisodeWithStatus[] = newResults.map((ep) => ({
      ...ep,
      isFavorite: false,
      isLearned: false,
    }));

    setSearchResults((prev) => {
      const merged = [...prev, ...newResultsWithStatus];
      const unique = Array.from(new Map(merged.map((ep) => [ep.id, ep])).values());
      return unique;
    });

    setSearchPage((prev) => prev + 1);
    if (newResults.length < PAGE_SIZE) setSearchHasMore(false);
    setSearchLoading(false);
  };

  /** Handle clear search */
  const handleClearSearch = () => {
    setSearchTerm('');
    setSearchResults([]);
    setSearchPage(0);
    setSearchHasMore(true);
  };

  /** Filter for tabs */
  const filtered = episodes.filter((ep) => {
    if (currentTab === 'favorites') return ep.isFavorite;
    if (currentTab === 'learned') return ep.isLearned;
    return true;
  });

  /** Scroll to top listener */
  useEffect(() => {
    const handleScroll = () => setShowScrollTop(window.scrollY > 300);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: listRef.current?.offsetTop || 0,
      behavior: 'smooth',
    });
  };

  /** Render */
  return (
    <div>
      {/* Search Box */}
      <div className="flex items-center gap-2 mb-4">
        <input
          type="text"
          placeholder="Search episodes by title..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-1 px-3 py-2 border rounded-lg text-sm"
        />
        {isSearchMode() && (
          <button
            onClick={handleClearSearch}
            className="px-3 py-2 bg-green-700 text-white rounded-lg hover:bg-green-800 transition"
          >
            Back
          </button>
        )}
      </div>

      {/* Tabs */}
      {!isSearchMode() && (
        <div className="flex gap-2 mb-3">
          {['all', 'favorites', 'learned'].map((tab) => (
            <button
              key={tab}
              onClick={() => setCurrentTab(tab as Tab)}
              className={`px-3 py-1 rounded-full text-sm font-medium transition ${
                currentTab === tab
                  ? 'bg-green-700 text-white'
                  : 'bg-gray-200 text-gray-700'
              }`}
            >
              {tab === 'all'
                ? 'All Episodes'
                : tab === 'favorites'
                ? 'Favorites'
                : 'Learned'}
            </button>
          ))}
          <Link
            href="/vocabulary"
            className="px-3 py-1 rounded-full text-sm font-medium transition bg-gray-200 text-gray-700 inline-flex items-center justify-center"
          >
            Vocabulary
          </Link>
        </div>
      )}

      {/* Cards */}
      <div className="space-y-3" ref={listRef}>
        {(isSearchMode() ? searchResults : filtered).map((ep) => (
          <EpisodeCard
            key={ep.id}
            episode={ep}
            onStatusUpdated={refreshSingleEpisode}
          />
        ))}

        <div ref={loaderRef} className="py-4 text-center text-gray-500 text-sm">
          {isSearchMode()
            ? searchLoading && searchHasMore
              ? 'Loading...'
              : searchHasMore
              ? 'Scroll to load more'
              : searchResults.length === 0
              ? 'No results found.'
              : 'All loaded'
            : loading && hasMore
            ? 'Loading...'
            : hasMore
            ? 'Scroll to load more'
            : 'All loaded'}
        </div>
      </div>

      {/* Bottom Add Form / Scroll Up */}
      {(showScrollTop || !showAddForm) && (
        <div className="fixed bottom-4 left-0 right-0 px-4">
          <div className="mx-auto w-full max-w-[430px] flex justify-between items-center">
            {!showAddForm && (
              <button
                onClick={() => setShowAddForm(true)}
                className="bg-[#1b5e20] text-white px-4 py-3 rounded-full shadow-lg hover:scale-110 transition flex items-center gap-2"
              >
                <MdOutlinePostAdd size={20} />
                Add vocabulary
              </button>
            )}
            {showScrollTop && (
              <button
                onClick={scrollToTop}
                className="p-3 rounded-full bg-[#1b5e20] text-white shadow-lg hover:scale-110 transition"
              >
                <FaAngleDoubleUp />
              </button>
            )}
          </div>
        </div>
      )}

      {showAddForm && (
        <AddVocabularyForm
          onClose={() => setShowAddForm(false)}
          onSave={() => setShowAddForm(false)}
        />
      )}
    </div>
  )
}
