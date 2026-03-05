import { NextResponse } from 'next/server';
import { adminAuth, adminDb } from '@/lib/firebase/admin';
import { cookies } from 'next/headers';

export async function POST(request) {
    try {
        const cookieStore = await cookies();
        const session = cookieStore.get('session')?.value;
        if (!session) return NextResponse.redirect(new URL('/login', request.url));

        // 1. Verify caller is a vendor
        const decodedToken = await adminAuth.verifySessionCookie(session, true);
        const vendorProfileSnap = await adminDb.collection('vendor_profiles').doc(decodedToken.uid).get();

        if (!vendorProfileSnap.exists()) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }

        // 2. Parse form data
        const formData = await request.formData();
        const leadId = formData.get('leadId');
        const action = formData.get('action'); // 'accepted' or 'declined'

        if (!leadId || !action) {
            return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });
        }

        // 3. Verify the lead belongs to this vendor
        const leadRef = adminDb.collection('quote_requests').doc(leadId);
        const leadSnap = await leadRef.get();

        if (!leadSnap.exists() || leadSnap.data().vendor_id !== decodedToken.uid) {
            return NextResponse.json({ error: 'Forbidden. This lead is assigned to another vendor.' }, { status: 403 });
        }

        // 4. Update the lead status
        const newStatus = action === 'accepted' ? 'accepted' : 'declined';
        await leadRef.update({
            status: newStatus,
            updated_at: new Date().toISOString(),
        });

        return NextResponse.redirect(new URL('/dashboard/vendor/leads', request.url), 303);

    } catch (error) {
        console.error("Lead Update Error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
