/* eslint-disable @typescript-eslint/no-explicit-any */
import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const episodeId = searchParams.get("episodeId");

    if (!episodeId) {
      return NextResponse.json({ error: "Missing episodeId" }, { status: 400 });
    }

    const { data, error } = await supabase
      .from("vocab_items")
      .select("id, episode_id, word, definition, example")
      .eq("episode_id", episodeId)

    if (error) {
      console.error("Supabase error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const camelData = data?.map(mapToCamelCase) ?? [];

    return NextResponse.json({ data: camelData });
  } catch (e: any) {
    console.error(e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

function mapToCamelCase(item: any) {
  return {
    id: item.id,
    episodeId: item.episode_id || undefined,
    word: item.word,
    definition: item.definition,
    example: item.example || undefined,
    createdAt: item.created_at || undefined,
  };
}
