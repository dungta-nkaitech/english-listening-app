import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";

const PAGE_SIZE = 20;

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const search = searchParams.get("search") ?? "";
        const pageParam = searchParams.get("page") ?? "0";
        const page = parseInt(pageParam, 10);

        const from = page * PAGE_SIZE;
        const to = from + PAGE_SIZE - 1;

        let query = supabase
            .from("episodes")
            .select("*")
            .range(from, to)
            .order("id", { ascending: true });

        if (search.trim() !== "") {
            query = query.ilike("title", `%${search}%`);
        }

        const { data, error } = await query;

        if (error) {
            console.error("Supabase error:", error.message);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ data });
    } catch (err) {
        console.error("Server error:", err);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
