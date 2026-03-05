import { NextResponse } from 'next/server';
import { adminAuth, adminDb } from '@/lib/firebase/admin';
import { cookies } from 'next/headers';
import { FieldValue } from 'firebase-admin/firestore';

export async function POST(request) {
    try {
        const cookieStore = await cookies();
        const session = cookieStore.get('session')?.value;
        if (!session) return NextResponse.redirect(new URL('/login', request.url));

        // 1. Verify caller is admin
        const decodedToken = await adminAuth.verifySessionCookie(session, true);
        const adminProfileSnap = await adminDb.collection('profiles').doc(decodedToken.uid).get();
        if (adminProfileSnap.data()?.role !== 'admin') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }

        // 2. Parse form data
        const formData = await request.formData();
        const profileId = formData.get('profileId');
        const action = formData.get('action'); // 'approve' or 'reject'
        const adminNotes = formData.get('adminNotes') || '';

        if (!profileId || !action) {
            return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });
        }

        // 3. Update the profile status in Firestore
        const newStatus = action === 'approve' ? 'approved' : 'rejected';
        await adminDb.collection('profiles').doc(profileId).update({
            status: newStatus,
            admin_notes: adminNotes,
            updated_at: new Date().toISOString(),
        });

        // 4. Update documents for this profile
        const docsSnap = await adminDb.collection('documents')
            .where('profile_id', '==', profileId)
            .get();
        const batch = adminDb.batch();
        docsSnap.forEach(doc => {
            batch.update(doc.ref, {
                admin_status: newStatus,
                admin_notes: adminNotes,
                reviewed_by: decodedToken.uid,
                reviewed_at: new Date().toISOString(),
            });
        });
        await batch.commit();

        return NextResponse.redirect(new URL('/admin', request.url), 303);

    } catch (error) {
        console.error("Admin Review Error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
