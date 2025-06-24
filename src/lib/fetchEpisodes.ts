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
  return data || [];
}
