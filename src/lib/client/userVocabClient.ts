import { IUserVocabulary } from "@/types/vocabulary.interface";

export async function fetchUserVocabularyPageClient(
  userId: string,
  page: number,
  search: string
): Promise<IUserVocabulary[]> {
  const url = new URL("/api/user-vocab", window.location.origin);
  url.searchParams.set("userId", userId);
  url.searchParams.set("page", page.toString());
  if (search.trim()) url.searchParams.set("search", search);

  const res = await fetch(url.toString());
  if (!res.ok) {
    console.error("Failed to fetch user vocab:", res.statusText);
    return [];
  }

  const json = await res.json();
  return json.data || [];
}
