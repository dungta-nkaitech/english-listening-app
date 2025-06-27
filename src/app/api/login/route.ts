import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

export async function POST(req: NextRequest) {
    const { username, password } = await req.json();

    // Simple plaintext check (for your current DB)
    const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('username', username)
        .single();

    if (error || !data) {
        return NextResponse.json(
            { error: 'User not found' },
            { status: 401 }
        );
    }

    if (data.password !== password) {
        return NextResponse.json(
            { error: 'Invalid password' },
            { status: 401 }
        );
    }

    // Success
    return NextResponse.json({
        message: 'Login successful',
        user: { id: data.id, username: data.username },
    });
}
