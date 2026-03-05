import { redirect } from 'next/navigation'
import { adminAuth, adminDb } from '@/lib/firebase/admin'
import { cookies } from 'next/headers'
import Header from '@/components/Header'

export default async function OnboardingLayout({ children }) {
    const cookieStore = await cookies()
    const session = cookieStore.get('session')?.value

    if (!session) redirect('/login')

    let decodedToken;
    try {
        decodedToken = await adminAuth.verifySessionCookie(session, true)
    } catch {
        redirect('/login')
    }

    const profileSnap = await adminDb.collection('profiles').doc(decodedToken.uid).get()
    if (profileSnap.exists) {
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
