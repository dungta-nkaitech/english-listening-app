import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');

    if (!userId) {
        return NextResponse.json({ error: 'Missing userId' }, { status: 400 });
    }

    const { data: favoritesData } = await supabase
        .from('user_favorite_episodes')
        .select('episode_id')   
        .eq('user_id', userId);

    const { data: learntData } = await supabase
        .from('user_learnt_episodes')
        .select('episode_id')
        .eq('user_id', userId);

    return NextResponse.json({
        favorites: favoritesData?.map((d) => d.episode_id) ?? [],
        learnt: learntData?.map((d) => d.episode_id) ?? []
    });
}
