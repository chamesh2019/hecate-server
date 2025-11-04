import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

export async function GET(request: NextRequest) {
    try {
        // Get the API key from header
        const apiKey = request.headers.get('x-api-key');

        if (!apiKey) {
            return NextResponse.json({ error: 'API key required' }, { status: 401 });
        }

        // Validate API key and get user_id
        const { data: keyData, error: keyError } = await supabase
            .from('api_keys')
            .select('user_id, active')
            .eq('key', apiKey)
            .eq('active', true)
            .single();

        if (keyError || !keyData) {
            return NextResponse.json({ error: 'Invalid API key' }, { status: 401 });
        }

        // Get the secret name from query params (optional - to get specific secret)
        const { searchParams } = new URL(request.url);
        const secretName = searchParams.get('key');

        let query = supabase
            .from('user_secrets')
            .select('key, value')
            .eq('user_id', keyData.user_id);

        if (secretName) {
            query = query.eq('key', secretName);
        }

        const { data: secrets, error: secretsError } = await query;

        if (secretsError) {
            return NextResponse.json({ error: secretsError.message }, { status: 500 });
        }

        // If requesting a specific secret, return just that one
        if (secretName) {
            if (secrets && secrets.length > 0) {
                return NextResponse.json({ secret: secrets[0] });
            } else {
                return NextResponse.json({ error: 'Secret not found' }, { status: 404 });
            }
        }

        // Return all secrets
        return NextResponse.json({ secrets });
    } catch (error: any) {
        console.error('Server error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
