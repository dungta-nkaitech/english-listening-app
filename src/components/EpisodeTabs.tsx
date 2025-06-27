'use client'

import { useEffect, useRef, useState } from 'react'
import { IEpisode } from '@/types/episode.interface'
import EpisodeCard from './EpisodeCard'
import { fetchEpisodesPage, fetchEpisodesSearch } from '../lib/fetchEpisodes'

type Tab = 'all' | 'favorites' | 'learned'

const PAGE_SIZE = 20

export default function EpisodeTabs() {
  const [episodes, setEpisodes] = useState<IEpisode[]>([])
  const [page, setPage] = useState(0)
  const [loading, setLoading] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const [currentTab, setCurrentTab] = useState<Tab>('all')

  // Fake IDs — sau này lấy từ user
  const favoriteIds = ['ep001', 'ep002']
  const learnedIds = ['ep003']

  const loaderRef = useRef<HTMLDivElement>(null)

  // 🔍 Search state
  const [searchTerm, setSearchTerm] = useState('')
  const [searchResults, setSearchResults] = useState<IEpisode[] | null>(null)
  const [searchLoading, setSearchLoading] = useState(false)

  useEffect(() => {
    loadMore()
  }, [])

  useEffect(() => {
    if (searchResults === null) {
      const observer = new IntersectionObserver(
        (entries) => {
          const target = entries[0]
          if (target.isIntersecting && hasMore && !loading) {
            loadMore()
          }
        },
        { rootMargin: '100px' }
      )

      if (loaderRef.current) observer.observe(loaderRef.current)
      return () => {
        if (loaderRef.current) observer.unobserve(loaderRef.current)
      }
    }
  }, [hasMore, loading, searchResults])

  const loadMore = async () => {
    setLoading(true)
    const newEpisodes = await fetchEpisodesPage(page)
    setEpisodes((prev) => {
      const merged = [...prev, ...newEpisodes]
      const unique = Array.from(
        new Map(merged.map((ep) => [ep.id, ep])).values()
      )
      return unique
    })
    setPage((prev) => prev + 1)
    if (newEpisodes.length < PAGE_SIZE) setHasMore(false)
    setLoading(false)
  }

  const filtered = episodes.filter((ep) => {
    if (currentTab === 'favorites') return favoriteIds.includes(ep.id)
    if (currentTab === 'learned') return learnedIds.includes(ep.id)
    return true
  })

  // 🔍 Handle search
  const handleSearch = async () => {
    const trimmed = searchTerm.trim()
    if (trimmed === '') {
      setSearchResults(null)
      return
    }
    setSearchLoading(true)
    const results = await fetchEpisodesSearch(trimmed)
    setSearchResults(results)
    setSearchLoading(false)
  }

  const handleClearSearch = () => {
    setSearchTerm('')
    setSearchResults(null)
  }

  // Scroll to top
  const [showScrollTop, setShowScrollTop] = useState(false)
  const listRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 300)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const scrollToTop = () => {
    window.scrollTo({
      top: listRef.current?.offsetTop || 0,
      behavior: 'smooth',
    })
  }

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
        <button
          onClick={handleSearch}
          className="px-3 py-2 bg-green-700 text-white rounded-lg hover:bg-green-800 transition"
        >
          Search
        </button>
        {searchResults !== null && (
          <button
            onClick={handleClearSearch}
            className="px-3 py-2 bg-green-700 text-white rounded-lg hover:bg-green-800 transition"
          >
            Back
          </button>
        )}
      </div>

      {/* Tabs */}
      {searchResults === null && (
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
        </div>
      )}

      {/* Cards */}
      <div className="space-y-3" ref={listRef}>
        {searchResults !== null ? (
          <>
            {searchLoading && (
              <p className="text-sm text-gray-500 text-center">Searching...</p>
            )}
            {!searchLoading && searchResults.length === 0 && (
              <p className="text-sm text-gray-500 text-center">
                No results found.
              </p>
            )}
            {!searchLoading &&
              searchResults.length > 0 &&
              searchResults.map((ep) => (
                <EpisodeCard key={ep.id} episode={ep} />
              ))}
          </>
        ) : (
          <>
            {filtered.map((ep) => (
              <EpisodeCard key={ep.id} episode={ep} />
            ))}

            <div
              ref={loaderRef}
              className="py-4 text-center text-gray-500 text-sm"
            >
              {loading && hasMore
                ? 'Loading...'
                : hasMore
                ? 'Scroll to load more'
                : 'All loaded'}
            </div>
          </>
        )}
      </div>

      {/* Scroll to Top Button */}
      {showScrollTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-4 p-3 rounded-full bg-[#1b5e20] text-white shadow-lg hover:scale-110 transition"
        >
          Back to top
        </button>
      )}
    </div>
  )
}
