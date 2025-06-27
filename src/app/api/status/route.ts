import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get("userId");
  const episodeId = searchParams.get("episodeId");

  if (!userId) {
    return NextResponse.json({ error: "Missing userId" }, { status: 400 });
  }

  if (episodeId) {
    // ✅ Check trạng thái riêng của 1 episode
    const { data: favoriteData } = await supabase
      .from("user_favorite_episodes")
      .select("episode_id")
      .eq("user_id", userId)
      .eq("episode_id", episodeId)
      .maybeSingle();

    const { data: learntData } = await supabase
      .from("user_learnt_episodes")
      .select("episode_id")
      .eq("user_id", userId)
      .eq("episode_id", episodeId)
      .maybeSingle();

    return NextResponse.json({
      episodeId,
      isFavorite: !!favoriteData,
      isLearned: !!learntData,
    });
  }

  // ✅ Nếu không có episodeId → trả toàn bộ list
  const { data: favoritesData } = await supabase
    .from("user_favorite_episodes")
    .select("episode_id")
    .eq("user_id", userId);

  const { data: learntData } = await supabase
    .from("user_learnt_episodes")
    .select("episode_id")
    .eq("user_id", userId);

  return NextResponse.json({
    favorites: favoritesData?.map((d) => d.episode_id) ?? [],
    learnt: learntData?.map((d) => d.episode_id) ?? [],
  });
}
