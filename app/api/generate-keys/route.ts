import { NextRequest, NextResponse } from 'next/server';
import { generateKeyPair } from '@/lib/encryption';

export async function POST(request: NextRequest) {
    try {
        const authHeader = request.headers.get('authorization');
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // In a real-world scenario, you'd validate the token here
        // to ensure the user is authenticated before generating keys.

        const keyPair = generateKeyPair();

        return NextResponse.json(keyPair);
    } catch (error: any) {
        console.error('Key generation API error:', error);
        return NextResponse.json({ error: 'Failed to generate key pair', details: error?.message }, { status: 500 });
    }
}
