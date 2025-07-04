import { supabase } from "@/lib/supabaseClient";
import { IUserVocabulary } from "@/types/vocabulary.interface";

const PAGE_SIZE = 10;

export async function fetchUserVocabularyPage(
  userId: string,
  page: number
): Promise<IUserVocabulary[]> {
  const from = page * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  const { data, error } = await supabase
    .from("user_vocab")
    .select("*")
    .eq("user_id", userId)
    .range(from, to)
    .order("created_at", { ascending: false });

  if (error) throw error;

  return (data ?? []).map((item) => ({
    id: item.id,
    userId: item.user_id,
    episodeId: item.episode_id ?? null,
    word: item.word,
    definition: item.definition,
    example: item.example ?? null,
    createdAt: item.created_at,
  }));
}
