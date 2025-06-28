/* eslint-disable @typescript-eslint/no-explicit-any */
// app/api/user-vocab/route.ts
import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const PAGE_SIZE = 10;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId, word, definition, example, episodeId } = body;

    if (!word || !definition || !userId) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    const { data, error } = await supabase.from("user_vocab_items").insert([
      {
        user_id: userId,
        episode_id: episodeId || null,
        word,
        definition,
        example,
      },
    ]);

    if (error) {
      console.error("Supabase error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, data });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);

    const userId = searchParams.get("userId");
    if (!userId) {
      return NextResponse.json({ error: "Missing userId" }, { status: 400 });
    }

    const episodeId = searchParams.get("episodeId");  // ✅ NEW

    const page = parseInt(searchParams.get("page") || "0", 10);
    const search = searchParams.get("search")?.trim();

    let query = supabase
      .from("user_vocab_items")
      .select("id, user_id, episode_id, word, definition, example, created_at, episode_title")
      .eq("user_id", userId);

    // ✅ NEW: filter theo episodeId nếu có
    if (episodeId) {
      query = query.eq("episode_id", episodeId);
    }

    // ✅ search theo từ
    if (search && search.length >= 2) {
      query = query.ilike("word", `%${search}%`);
    }

    // ✅ pagination
    query = query
      .order("created_at", { ascending: false })
      .range(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE - 1);

    const { data, error } = await query;

    if (error) {
      console.error(error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const camelData = data?.map(mapToCamelCase) ?? [];
    console.log("user vocab",camelData)

    return NextResponse.json({ data: camelData });
  } catch (e: any) {
    console.error(e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}


function mapToCamelCase(item: any) {
  return {
    id: item.id,
    userId: item.user_id,
    episodeId: item.episode_id || undefined,
    word: item.word,
    definition: item.definition,
    example: item.example || undefined,
    createdAt: item.created_at,
    episodeTitle: item.episode_title || undefined,
  };
}
