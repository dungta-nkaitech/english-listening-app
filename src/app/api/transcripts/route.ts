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
      .from("transcripts")
      .select("id, episode_id, start_time, end_time, text, speaker")
      .eq("episode_id", episodeId)
      .order("start_time", { ascending: true });

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
    startTime: item.start_time,
    endTime: item.end_time,
    text: item.text,
    speaker: item.speaker || undefined,
    createdAt: item.created_at,
  };
}
