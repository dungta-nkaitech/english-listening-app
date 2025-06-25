import { supabase } from "@/lib/supabaseClient"; // hoặc server tùy bạn dùng ở đâu
import { IEpisode, ITranscript, IVocabItem } from "@/types/episode.interface";

export async function getEpisodeById(id: string): Promise<IEpisode | null> {
  const { data, error } = await supabase
    .from("episodes")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    console.error("Error fetching episode:", error);
    return null;
  }

  return data;
}

export async function getTranscriptsByEpisodeId(
  episodeId: string
): Promise<ITranscript[]> {
  const { data, error } = await supabase
    .from("transcripts")
    .select("*")
    .eq("episodeId", episodeId)
    .order("order", { ascending: true });

  if (error) {
    console.error("Error fetching transcripts:", error);
    return [];
  }

  return data;
}

export async function getVocabByEpisodeId(
  episodeId: string
): Promise<IVocabItem[]> {
  const { data, error } = await supabase
    .from("vocab_items")
    .select("*")
    .eq("episodeId", episodeId);

  if (error) {
    console.error("Error fetching vocab:", error);
    return [];
  }

  return data;
}
