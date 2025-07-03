import { supabase } from "@/lib/supabaseClient";
import { IEpisode } from "@/types/episode.interface";

const PAGE_SIZE = 20;

export async function fetchEpisodesPage(page: number): Promise<IEpisode[]> {
  const from = page * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  const { data, error } = await supabase
    .from("episodes")
    .select("*")
    .range(from, to)
    .order("id", { ascending: true });

  if (error) throw error;

  return (data ?? []).map((item) => ({
    id: item.id,
    episodeUrl: item.episode_url,
    title: item.title,
    description: item.description,
    thumbnailUrl: item.thumbnail_url,
    audioUrl: item.audio_url,
    pdfUrl: item.pdf_url,
    quizUrl: item.quiz_url,
  }));
}

export async function fetchEpisodesSearchServer(
  search: string,
  page: number
): Promise<IEpisode[]> {
  const from = page * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  const { data, error } = await supabase
    .from("episodes")
    .select("*")
    .ilike("title", `%${search}%`)
    .range(from, to)
    .order("id", { ascending: true });

  if (error) throw error;

  return (data ?? []).map((item) => ({
    id: item.id,
    episodeUrl: item.episode_url,
    title: item.title,
    description: item.description,
    thumbnailUrl: item.thumbnail_url,
    audioUrl: item.audio_url,
    pdfUrl: item.pdf_url,
    quizUrl: item.quiz_url,
  }));
}
