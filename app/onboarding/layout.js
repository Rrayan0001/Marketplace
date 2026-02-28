import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Header from '@/components/Header'

export default async function OnboardingLayout({ children }) {
    const supabase = await createClient()

    // Ensure user is signed in to see onboarding
    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login')
    }

    // If user already has a profile that is pending or approved, redirect them away
    const { data: profile } = await supabase
        .from('profiles')
        .select('status')
        .eq('id', user.id)
        .maybeSingle()

    if (profile) {
        redirect('/dashboard')
    }

    return (
        <div className="min-h-screen bg-zinc-50">
            <Header />
            <main className="pt-[72px]">
                {children}
            </main>
        </div>
    )
}
