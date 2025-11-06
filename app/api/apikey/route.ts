import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseAdmin';
import crypto from 'crypto';

// Generate a secure API key
function generateApiKey(): string {
    return 'hk_' + crypto.randomBytes(32).toString('hex');
}

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

        // Check if user already has an API key
        const { data: existingKeys, error: fetchError } = await supabase
            .from('api_keys')
            .select('*')
            .eq('user_id', user.id)
            .eq('active', true)
            .single();

        if (fetchError && fetchError.code !== 'PGRST116') {
            console.error('Error fetching API key:', fetchError);
            return NextResponse.json({ error: fetchError.message }, { status: 500 });
        }

        if (existingKeys) {
            return NextResponse.json({ apiKey: existingKeys.key });
        }

        // If no API key exists, generate one
        const newApiKey = generateApiKey();
        const { data, error } = await supabase
            .from('api_keys')
            .insert([{
                user_id: user.id,
                key: newApiKey,
                active: true
            }])
            .select();

        if (error) {
            console.error('Error creating API key:', error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ apiKey: newApiKey }, { status: 201 });
    } catch (error: any) {
        console.error('Server error:', error);
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

        // Deactivate old API keys
        await supabase
            .from('api_keys')
            .update({ active: false })
            .eq('user_id', user.id);

        // Generate new API key
        const newApiKey = generateApiKey();
        const { data, error } = await supabase
            .from('api_keys')
            .insert([{
                user_id: user.id,
                key: newApiKey,
                active: true
            }])
            .select();

        if (error) {
            console.error('Error creating API key:', error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ apiKey: newApiKey }, { status: 201 });
    } catch (error: any) {
        console.error('Server error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
