import { redirect } from 'next/navigation'
import { adminAuth, adminDb } from '@/lib/firebase/admin'
import { cookies } from 'next/headers'
import Header from '@/components/Header'
import AdminSidebar from '@/components/AdminSidebar'

export default async function AdminLayout({ children }) {
    const cookieStore = await cookies()
    const session = cookieStore.get('session')?.value

    if (!session) {
        redirect('/admin-login')
    }

    let decodedToken;
    try {
        decodedToken = await adminAuth.verifySessionCookie(session, true)
    } catch {
        redirect('/admin-login')
    }

    // Ensure user is an admin
    const profileSnap = await adminDb.collection('profiles').doc(decodedToken.uid).get()
    const profile = profileSnap.data()

    if (profile?.role !== 'admin') {
        redirect('/dashboard')
    }

    // Fetch pending approvals count
    const pendingSnap = await adminDb.collection('profiles').where('status', '==', 'pending').get()
    const pendingCount = pendingSnap.size

    return (
        <div style={{ minHeight: '100vh', background: 'var(--bg-subtle)' }}>
            <Header />
            <div className="flex flex-col md:flex-row gap-6 p-4 pt-[100px] md:p-6 md:pt-[100px] max-w-[1400px] mx-auto">
                <AdminSidebar pendingCount={pendingCount} />
                <main className="flex-1 min-w-0">
                    {children}
                </main>
            </div>
        </div>
    )
}
