/* eslint-disable @typescript-eslint/no-explicit-any */
import { IEpisode } from "@/types/episode.interface";

export async function fetchEpisodesSearchClient(
  search: string,
  page: number
): Promise<IEpisode[]> {
  const res = await fetch(
    `/api/episodes?search=${encodeURIComponent(search)}&page=${page}`
  );

  if (!res.ok) {
    console.error("Failed to fetch search results:", res.statusText);
    return [];
  }

  const json = await res.json();
  if (!json.data) return [];

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

export async function fetchEpisodesPageClient(
  page: number
): Promise<IEpisode[]> {
  const res = await fetch(`/api/episodes?page=${page}`);

  if (!res.ok) {
    console.error("Failed to fetch episodes page:", res.statusText);
    return [];
  }

  const json = await res.json();
  if (!json.data) return [];

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
