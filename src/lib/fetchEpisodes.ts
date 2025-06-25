import { supabase } from "./supabaseClient";
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

  const episodes: IEpisode[] = data.map((item) => ({
    id: item.id,
    episodeUrl: item.episode_url,
    title: item.title,
    description: item.description,
    thumbnailUrl: item.thumbnail_url,
    audioUrl: item.audio_url,
    pdfUrl: item.pdf_url,
    quizUrl: item.quiz_url,
  }));
  return episodes || [];
}
