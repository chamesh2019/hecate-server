import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseAdmin';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { provider = 'google', redirectTo } = body;

        const { data, error } = await supabase.auth.signInWithOAuth({
            provider: provider as any,
            options: {
                redirectTo: redirectTo || `${request.nextUrl.origin}/auth/callback`,
            },
        });

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ url: data.url });
    } catch (error) {
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
