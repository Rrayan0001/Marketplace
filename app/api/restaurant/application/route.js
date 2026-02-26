import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request) {
    try {
        const supabase = await createClient();

        // 1. Verify caller
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return NextResponse.redirect(new URL('/login', request.url));

        const { data: restaurant } = await supabase
            .from('restaurant_profiles')
            .select('id')
            .eq('profile_id', user.id)
            .single();

        if (!restaurant) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }

        // 2. Parse form data
        const formData = await request.formData();
        const applicationId = formData.get('applicationId');
        const jobId = formData.get('jobId'); // Used for redirection
        const action = formData.get('action'); // 'hire' or 'reject'

        if (!applicationId || !action || !jobId) {
            return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });
        }

        // 3. Verify the job actually belongs to this restaurant
        // We join applications to jobs to ensure the restaurant making the request owns the job
        const { data: applicationOwnership } = await supabase
            .from('applications')
            .select('jobs(restaurant_id)')
            .eq('id', applicationId)
            .single();

        if (applicationOwnership?.jobs?.restaurant_id !== restaurant.id) {
            return NextResponse.json({ error: 'Forbidden. You do not own this job posting.' }, { status: 403 });
        }

        // 4. Update the application status
        const newStatus = action === 'hire' ? 'hired' : 'rejected';

        const { error: updateError } = await supabase
            .from('applications')
            .update({
                status: newStatus,
                updated_at: new Date().toISOString()
            })
            .eq('id', applicationId);

        if (updateError) throw updateError;

        // Redirect back to the applicants page
        return NextResponse.redirect(new URL(`/dashboard/restaurant/jobs/${jobId}`, request.url), 303);

    } catch (error) {
        console.error("Application Review Error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
