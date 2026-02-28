import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Header from '@/components/Header'

export default async function AdminLayout({ children }) {
    const supabase = await createClient()

    // Ensure user is signed in
    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login')
    }

    // Ensure user is an admin
    const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .maybeSingle()

    if (profile?.role !== 'admin') {
        redirect('/dashboard')
    }

    return (
        <div style={{ minHeight: '100vh', background: 'var(--bg-subtle)' }}>
            <Header />
            <div style={{ padding: '0 24px' }}>
                <div style={{
                    background: '#0a0a0a',
                    color: 'white',
                    padding: '12px 24px',
                    borderRadius: '8px',
                    marginTop: '80px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                }}>
                    <h2 style={{ fontSize: '1.2rem', margin: 0 }}>🛡️ Admin Control Room</h2>
                    <span style={{ fontSize: '0.9rem', color: '#888' }}>Margros Platform Operations</span>
                </div>
            </div>
            <main style={{ padding: '24px' }}>
                {children}
            </main>
        </div>
    )
}
