import { redirect } from 'next/navigation'
import { adminAuth } from '@/lib/firebase/admin'
import { cookies } from 'next/headers'
import Header from '@/components/Header'

export default async function DashboardLayout({ children }) {
    const cookieStore = await cookies()
    const session = cookieStore.get('session')?.value

    if (!session) {
        redirect('/login')
    }

    try {
        await adminAuth.verifySessionCookie(session, true)
    } catch {
        redirect('/login')
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
