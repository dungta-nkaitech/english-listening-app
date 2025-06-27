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

  const favoriteIds = ['ep001', 'ep002']
  const learnedIds = ['ep003']

  const loaderRef = useRef<HTMLDivElement>(null)

  /** Search states */
  const [searchTerm, setSearchTerm] = useState('')
  const [searchResults, setSearchResults] = useState<IEpisode[]>([])
  const [searchLoading, setSearchLoading] = useState(false)
  const [searchPage, setSearchPage] = useState(0)
  const [searchHasMore, setSearchHasMore] = useState(true)

  /** Scroll to top button */
  const [showScrollTop, setShowScrollTop] = useState(false)
  const listRef = useRef<HTMLDivElement>(null)

  /** Infinite scroll observer */
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const target = entries[0]
        if (target.isIntersecting) {
          if (isSearchMode()) {
            if (!searchLoading && searchHasMore) loadMoreSearch()
          } else {
            if (!loading && hasMore) loadMore()
          }
        }
      },
      { rootMargin: '100px' }
    )
    if (loaderRef.current) observer.observe(loaderRef.current)
    return () => {
      if (loaderRef.current) observer.unobserve(loaderRef.current)
    }
  }, [loading, hasMore, searchLoading, searchHasMore, searchTerm])

  /** Check if in search mode */
  const isSearchMode = () => searchTerm.trim().length >= 2

  /** Debounced search trigger */
  useEffect(() => {
    if (!isSearchMode()) {
      setSearchResults([])
      setSearchPage(0)
      setSearchHasMore(true)
      return
    }

    setSearchLoading(true)
    setSearchResults([])
    setSearchPage(0)
    setSearchHasMore(true)

    const timer = setTimeout(() => {
      loadFirstPageSearch()
    }, 400)

    return () => clearTimeout(timer)
  }, [searchTerm])

  /** Load initial page for all episodes */
  useEffect(() => {
    loadMore()
  }, [])

  /** Backspace shortcut */
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Backspace' && isSearchMode()) {
        const active = document.activeElement
        if (
          active &&
          (active.tagName === 'INPUT' || active.tagName === 'TEXTAREA' || active.getAttribute('contenteditable') === 'true')
        ) {
          return
        }
        e.preventDefault()
        handleClearSearch()
      }
    }
    window.addEventListener('keydown', handleGlobalKeyDown)
    return () => window.removeEventListener('keydown', handleGlobalKeyDown)
  }, [searchTerm])

  /** Load more all episodes */
  const loadMore = async () => {
    setLoading(true)
    const newEpisodes = await fetchEpisodesPage(page)
    setEpisodes((prev) => {
      const merged = [...prev, ...newEpisodes]
      const unique = Array.from(new Map(merged.map((ep) => [ep.id, ep])).values())
      return unique
    })
    setPage((prev) => prev + 1)
    if (newEpisodes.length < PAGE_SIZE) setHasMore(false)
    setLoading(false)
  }

  /** Load first page of search */
  const loadFirstPageSearch = async () => {
    const results = await fetchEpisodesSearch(searchTerm.trim(), 0)
    setSearchResults(results)
    if (results.length < PAGE_SIZE) setSearchHasMore(false)
    setSearchPage(1)
    setSearchLoading(false)
  }

  /** Load more search results */
  const loadMoreSearch = async () => {
    setSearchLoading(true)
    const newResults = await fetchEpisodesSearch(searchTerm.trim(), searchPage)
    setSearchResults((prev) => {
      const merged = [...prev, ...newResults]
      const unique = Array.from(new Map(merged.map((ep) => [ep.id, ep])).values())
      return unique
    })
    setSearchPage((prev) => prev + 1)
    if (newResults.length < PAGE_SIZE) setSearchHasMore(false)
    setSearchLoading(false)
  }

  /** Handle clear search */
  const handleClearSearch = () => {
    setSearchTerm('')
    setSearchResults([])
    setSearchPage(0)
    setSearchHasMore(true)
  }

  /** Filter for tabs */
  const filtered = episodes.filter((ep) => {
    if (currentTab === 'favorites') return favoriteIds.includes(ep.id)
    if (currentTab === 'learned') return learnedIds.includes(ep.id)
    return true
  })

  /** Scroll to top listener */
  useEffect(() => {
    const handleScroll = () => setShowScrollTop(window.scrollY > 300)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const scrollToTop = () => {
    window.scrollTo({ top: listRef.current?.offsetTop || 0, behavior: 'smooth' })
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
                currentTab === tab ? 'bg-green-700 text-white' : 'bg-gray-200 text-gray-700'
              }`}
            >
              {tab === 'all' ? 'All Episodes' : tab === 'favorites' ? 'Favorites' : 'Learned'}
            </button>
          ))}
        </div>
      )}

      {/* Cards */}
      <div className="space-y-3" ref={listRef}>
        {isSearchMode() ? (
          <>
            {searchResults.map((ep) => (
              <EpisodeCard key={ep.id} episode={ep} />
            ))}

            <div ref={loaderRef} className="py-4 text-center text-gray-500 text-sm">
              {searchLoading && searchHasMore
                ? 'Loading...'
                : searchHasMore
                ? 'Scroll to load more'
                : searchResults.length === 0
                ? 'No results found.'
                : 'All loaded'}
            </div>
          </>
        ) : (
          <>
            {filtered.map((ep) => (
              <EpisodeCard key={ep.id} episode={ep} />
            ))}

            <div ref={loaderRef} className="py-4 text-center text-gray-500 text-sm">
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
