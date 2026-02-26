import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export async function POST(request) {
    const supabase = await createClient()
    await supabase.auth.signOut()
    return redirect('/')
}
