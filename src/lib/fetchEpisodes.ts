import { supabase } from './supabaseClient'
import { IEpisode } from '@/types/episode.interface'

const PAGE_SIZE = 20

export async function fetchEpisodesPage(page: number): Promise<IEpisode[]> {
  const from = page * PAGE_SIZE
  const to = from + PAGE_SIZE - 1

  const { data, error } = await supabase
    .from('episodes')
    .select('*')
    .range(from, to)
    .order('id', { ascending: true })

  if (error) throw error

  const episodes: IEpisode[] = data.map((item) => ({
    id: item.id,
    episodeUrl: item.episode_url,
    title: item.title,
    description: item.description,
    thumbnailUrl: item.thumbnail_url,
    audioUrl: item.audio_url,
    pdfUrl: item.pdf_url,
    quizUrl: item.quiz_url,
  }))
  return episodes || []
}

export async function fetchEpisodesSearch(search: string, page: number): Promise<IEpisode[]> {
    const res = await fetch(`/api/episodes?search=${encodeURIComponent(search)}&page=${page}`);
    if (!res.ok) {
        console.error("Failed to fetch search results:", res.statusText);
        return [];
    }

    const json = await res.json();

    if (!json.data) return [];

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return json.data.map((item: any) => ({
        id: item.id,
        title: item.title,
        description: item.description,
        thumbnailUrl: item.thumbnail_url,
        audioUrl: item.audio_url,
        pdfUrl: item.pdf_url,
        createdAt: item.created_at,
        episodeUrl: item.episode_url,
        quizUrl: item.quiz_url,
    }));
}
