import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

export async function POST(req: NextRequest) {
    const { userId, episodeId } = await req.json();

    if (!userId || !episodeId) {
        return NextResponse.json({ error: 'Missing userId or episodeId' }, { status: 400 });
    }

    // Check if exists
    const { data, error } = await supabase
        .from('user_learnt_episodes')
        .select('*')
        .eq('user_id', userId)
        .eq('episode_id', episodeId)
        .single();

    if (error && error.code !== 'PGRST116') {
        // Unexpected error
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (data) {
        // Already exists -> delete (toggle off)
        const { error: deleteError } = await supabase
            .from('user_learnt_episodes')
            .delete()
            .eq('user_id', userId)
            .eq('episode_id', episodeId);

        if (deleteError) {
            return NextResponse.json({ error: deleteError.message }, { status: 500 });
        }

        return NextResponse.json({ message: 'Removed from learnt', status: 'removed' });
    } else {
        // Doesn't exist -> insert (toggle on)
        const { error: insertError } = await supabase
            .from('user_learnt_episodes')
            .insert([{ user_id: userId, episode_id: episodeId }]);

        if (insertError) {
            return NextResponse.json({ error: insertError.message }, { status: 500 });
        }

        return NextResponse.json({ message: 'Added to learnt', status: 'added' });
    }
}
