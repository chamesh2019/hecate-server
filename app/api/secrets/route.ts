import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

export async function GET(request: NextRequest) {
    try {
        // Get the authorization header
        const authHeader = request.headers.get('authorization');

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const token = authHeader.substring(7);

        // Get the user from the token
        const { data: { user }, error: userError } = await supabase.auth.getUser(token);

        if (userError || !user) {
            return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
        }

        // Fetch secrets for this user
        const { data: secrets, error: secretsError } = await supabase
            .from('user_secrets')
            .select('*')
            .eq('user_id', user.id);

        if (secretsError) {
            return NextResponse.json({ error: secretsError.message }, { status: 500 });
        }

        secrets.forEach(secret => {
            delete secret.user_id;
            secret.value = "*".repeat(16) + secret.value.slice(-4);
        });

        return NextResponse.json({ secrets });
    } catch (error) {
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        // Get the authorization header
        const authHeader = request.headers.get('authorization');

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const token = authHeader.substring(7);

        // Get the user from the token
        const { data: { user }, error: userError } = await supabase.auth.getUser(token);

        if (userError || !user) {
            return NextResponse.json({ error: 'Invalid token', details: userError?.message }, { status: 401 });
        }

        // Parse the request body
        const body = await request.json();
        const { key, value } = body;

        if (!key || !value) {
            return NextResponse.json({ error: 'Key and value are required' }, { status: 400 });
        }

        // Insert the new secret
        const { data, error } = await supabase
            .from('user_secrets')
            .insert([{ key, value, user_id: user.id }])
            .select();

        if (error) {
            console.error('Supabase error:', error);
            return NextResponse.json({ error: error.message, details: error }, { status: 500 });
        }

        return NextResponse.json({ secret: data[0] }, { status: 201 });
    } catch (error: any) {
        console.error('Server error:', error);
        return NextResponse.json({ error: 'Internal server error', details: error?.message }, { status: 500 });
    }
}
