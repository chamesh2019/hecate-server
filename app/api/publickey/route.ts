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

        // Fetch the public key for this user
        const { data: publicKey, error: publicKeyError } = await supabase
            .from('public_keys')
            .select('key')
            .eq('user_id', user.id)
            .single();

        if (publicKeyError && publicKeyError.code !== 'PGRST116') {
            return NextResponse.json({ error: publicKeyError.message }, { status: 500 });
        }

        return NextResponse.json({ publicKey: publicKey?.key || null });
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
            return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
        }

        // Parse the request body
        const body = await request.json();
        const { publicKey } = body;

        if (!publicKey) {
            return NextResponse.json({ error: 'Public key is required' }, { status: 400 });
        }

        // Check if a public key already exists for this user
        const { data: existingKey } = await supabase
            .from('public_keys')
            .select('user_id')
            .eq('user_id', user.id)
            .single();

        if (existingKey) {
            // Update the existing public key
            const { error } = await supabase
                .from('public_keys')
                .update({ key: publicKey })
                .eq('user_id', user.id);

            if (error) {
                console.error('Supabase error:', error);
                return NextResponse.json({ error: error.message }, { status: 500 });
            }
        } else {
            // Insert new public key
            const { error } = await supabase
                .from('public_keys')
                .insert([{ key: publicKey, user_id: user.id }]);

            if (error) {
                console.error('Supabase error:', error);
                return NextResponse.json({ error: error.message }, { status: 500 });
            }
        }

        return NextResponse.json({ message: 'Public key saved successfully' }, { status: 200 });
    } catch (error: any) {
        console.error('Server error:', error);
        return NextResponse.json({ error: 'Internal server error', details: error?.message }, { status: 500 });
    }
}
