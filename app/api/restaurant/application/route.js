import { NextResponse } from 'next/server';
import { adminAuth, adminDb } from '@/lib/firebase/admin';
import { cookies } from 'next/headers';

export async function POST(request) {
    try {
        const cookieStore = await cookies();
        const session = cookieStore.get('session')?.value;
        if (!session) return NextResponse.redirect(new URL('/login', request.url));

        // 1. Verify caller is a restaurant
        const decodedToken = await adminAuth.verifySessionCookie(session, true);
        const restaurantProfileSnap = await adminDb.collection('restaurant_profiles').doc(decodedToken.uid).get();

        if (!restaurantProfileSnap.exists()) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }

        // 2. Parse form data
        const formData = await request.formData();
        const applicationId = formData.get('applicationId');
        const jobId = formData.get('jobId');
        const action = formData.get('action'); // 'hire' or 'reject'

        if (!applicationId || !action || !jobId) {
            return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });
        }

        // 3. Verify the job belongs to this restaurant
        const appRef = adminDb.collection('applications').doc(applicationId);
        const appSnap = await appRef.get();

        if (!appSnap.exists()) {
            return NextResponse.json({ error: 'Application not found.' }, { status: 404 });
        }

        const applicationData = appSnap.data();
        const jobSnap = await adminDb.collection('jobs').doc(applicationData.job_id).get();

        if (!jobSnap.exists() || jobSnap.data().restaurant_id !== decodedToken.uid) {
            return NextResponse.json({ error: 'Forbidden. You do not own this job posting.' }, { status: 403 });
        }

        // 4. Update the application status
        const newStatus = action === 'hire' ? 'hired' : 'rejected';
        await appRef.update({
            status: newStatus,
            updated_at: new Date().toISOString(),
        });

        return NextResponse.redirect(new URL(`/dashboard/restaurant/jobs/${jobId}`, request.url), 303);

    } catch (error) {
        console.error("Application Review Error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
