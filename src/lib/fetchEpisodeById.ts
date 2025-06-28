import { supabase } from "@/lib/supabaseClient"; // hoặc server tùy bạn dùng ở đâu
import { IEpisode, ITranscript } from "@/types/episode.interface";
import { IUserVocabulary } from "@/types/vocabulary.interface";

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

  const episode: IEpisode = {
    id: data.id,
    episodeUrl: data.episode_url,
    title: data.title,
    description: data.description,
    thumbnailUrl: data.thumbnail_url,
    audioUrl: data.audio_url,
    pdfUrl: data.pdf_url,
    quizUrl: data.quiz_url,
  };

  return episode;
}

export async function getTranscriptsByEpisodeId(
  episodeId: string
): Promise<ITranscript[]> {
  const { data, error } = await supabase
    .from("transcripts")
    .select("*")
    .eq("episode_id", episodeId)
    .order("order", { ascending: true });

  if (error) {
    console.error("Error fetching transcripts:", error);
    return [];
  }

  const transcripts: ITranscript[] = data.map((item) => ({
    id: item.id,
    episodeId: item.episode_id,
    order: item.order,
    text: item.text,
    startTime: item.start_time,
    endTime: item.end_time,
    speaker: item.speaker,
  }));

  return transcripts;
}

export async function getVocabByEpisodeId(
  episodeId: string
): Promise<IUserVocabulary[]> {
  const { data, error } = await supabase
    .from("vocab_items")
    .select("*")
    .eq("episode_id", episodeId);
    

  if (error) {
    console.error("Error fetching vocab:", error);
    return [];
  }

  const vocabItems: IUserVocabulary[] = data.map((item) => ({
    id: item.id,
    userId: item.user_id || null,
    episodeId: item.episode_id || null,
    word: item.word,
    definition: item.definition,
    example: item.example || null,
    createdAt: item.created_at,
    episodeTitle: item.episode_title || null
  }));

  return vocabItems;
}
