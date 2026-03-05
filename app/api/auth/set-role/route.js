import { NextResponse } from 'next/server';
import { adminAuth } from '@/lib/firebase/admin';

export async function POST(request) {
    try {
        const { uid, role } = await request.json();
        await adminAuth.setCustomUserClaims(uid, { role });
        return NextResponse.json({ status: 'success' });
    } catch (error) {
        console.error('Set role error:', error);
        return NextResponse.json({ error: 'Failed to set role' }, { status: 500 });
    }
}
