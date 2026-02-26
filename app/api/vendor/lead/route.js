import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request) {
    try {
        const supabase = await createClient();

        // 1. Verify caller
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return NextResponse.redirect(new URL('/login', request.url));

        const { data: vendor } = await supabase
            .from('vendor_profiles')
            .select('id')
            .eq('profile_id', user.id)
            .single();

        if (!vendor) {
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
        const { data: leadOwnership } = await supabase
            .from('quote_requests')
            .select('vendor_id')
            .eq('id', leadId)
            .single();

        if (leadOwnership?.vendor_id !== vendor.id) {
            return NextResponse.json({ error: 'Forbidden. This lead is assigned to another vendor.' }, { status: 403 });
        }

        // 4. Update the lead status
        const newStatus = action === 'accepted' ? 'accepted' : 'declined';

        const { error: updateError } = await supabase
            .from('quote_requests')
            .update({
                status: newStatus,
                updated_at: new Date().toISOString()
            })
            .eq('id', leadId);

        if (updateError) throw updateError;

        // Redirect back to the leads page
        return NextResponse.redirect(new URL(`/dashboard/vendor/leads`, request.url), 303);

    } catch (error) {
        console.error("Lead Update Error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
