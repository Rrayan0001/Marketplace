import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request) {
    try {
        const supabase = await createClient();

        // 1. Verify caller is admin
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return NextResponse.redirect(new URL('/login', request.url));

        const { data: adminProfile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .single();

        if (adminProfile?.role !== 'admin') {
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

        // 3. Update the profile status
        const newStatus = action === 'approve' ? 'approved' : 'rejected';

        const { error: updateError } = await supabase
            .from('profiles')
            .update({
                status: newStatus,
                admin_notes: adminNotes,
                updated_at: new Date().toISOString()
            })
            .eq('id', profileId);

        if (updateError) throw updateError;

        // 4. Also update document admin_status if applicable
        await supabase
            .from('documents')
            .update({
                admin_status: newStatus,
                admin_notes: adminNotes,
                reviewed_by: user.id,
                reviewed_at: new Date().toISOString()
            })
            .eq('profile_id', profileId);

        // Redirect back to queue
        return NextResponse.redirect(new URL('/admin', request.url), 303);

    } catch (error) {
        console.error("Admin Review Error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
