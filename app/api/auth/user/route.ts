import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseAdmin';

export async function GET(request: NextRequest) {
    try {
        // Get the authorization header
        const authHeader = request.headers.get('authorization');

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return NextResponse.json({ error: 'Unauthorized', user: null }, { status: 401 });
        }

        const token = authHeader.substring(7);

        // Get the user from the token
        const { data: { user }, error: userError } = await supabase.auth.getUser(token);

        if (userError || !user) {
            return NextResponse.json({ error: 'Invalid token', user: null }, { status: 401 });
        }

        return NextResponse.json({ user });
    } catch (error) {
        return NextResponse.json({ error: 'Internal server error', user: null }, { status: 500 });
    }
}
