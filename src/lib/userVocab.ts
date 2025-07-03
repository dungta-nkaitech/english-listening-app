import { supabase } from "@/lib/supabaseClient";
import { IUserVocabulary } from "@/types/vocabulary.interface";

const PAGE_SIZE = 10;

export async function fetchUserVocabularyPage(
  userId: string,
  page: number,
  search?: string
): Promise<IUserVocabulary[]> {
  const from = page * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  let query = supabase
    .from("user_vocab")
    .select("*")
    .eq("user_id", userId)
    .range(from, to)
    .order("created_at", { ascending: false });

  if (search && search.trim() !== "") {
    query = query.ilike("word", `%${search}%`);
  }

  const { data, error } = await query;
  const camelData = data?.map(mapToCamelCase) ?? [];

  if (error) throw error;
  return camelData ?? [];
}

function mapToCamelCase(item: UserVocabRow) {
  return {
    id: item.id,
    userId: item.user_id,
    episodeId: item.episode_id || undefined,
    word: item.word,
    definition: item.definition,
    example: item.example || undefined,
    createdAt: item.created_at,
  };
}

type UserVocabRow = {
  id: string;
  user_id: string;
  episode_id?: string | null;
  word: string;
  definition: string;
  example?: string | null;
  created_at: string;
};
