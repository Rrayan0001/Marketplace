import { redirect } from 'next/navigation'
import { adminAuth, adminDb } from '@/lib/firebase/admin'
import { cookies } from 'next/headers'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Clock, CheckCircle2, AlertTriangle, XCircle, Briefcase, Users, Store, Package, Activity, FileText } from 'lucide-react'

export default async function DashboardPage() {
    const cookieStore = await cookies()
    const session = cookieStore.get('session')?.value

    if (!session) redirect('/login')

    let decodedToken;
    try {
        decodedToken = await adminAuth.verifySessionCookie(session, true)
    } catch {
        redirect('/login')
    }

    const uid = decodedToken.uid

    // Check if profile exists
    const profileSnap = await adminDb.collection('profiles').doc(uid).get()
    const profile = profileSnap.data()

    // If no profile, send to onboarding
    if (!profile) {
        const role = decodedToken.role || 'worker'
        redirect(`/onboarding/${role}`)
    }

    // Admins should not use the normal dashboard — send them to their own panel
    if (profile.role === 'admin') {
        redirect('/admin')
    }

    // Fetch the latest document status
    const docsSnap = await adminDb.collection('documents')
        .where('profile_id', '==', uid)
        .get()

    // Sort in memory to avoid index requirement
    const latestDoc = docsSnap.empty
        ? null
        : docsSnap.docs
            .map(d => d.data())
            .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))[0]

    // Fetch Analytics based on role
    let analytics = { activeJobs: 0, pendingApps: 0, totalApps: 0, hiredJobs: 0 }

    if (profile.role === 'restaurant') {
        const activeJobsSnap = await adminDb.collection('jobs')
            .where('restaurant_id', '==', uid)
            .where('is_active', '==', true)
            .get()
        analytics.activeJobs = activeJobsSnap.size

        const pendingAppsSnap = await adminDb.collection('applications')
            .where('restaurant_id', '==', uid)
            .where('status', '==', 'pending')
            .get()
        analytics.pendingApps = pendingAppsSnap.size

    } else if (profile.role === 'worker') {
        const allAppsSnap = await adminDb.collection('applications')
            .where('worker_id', '==', uid)
            .get()
        analytics.totalApps = allAppsSnap.size

        const hiredSnap = await adminDb.collection('applications')
            .where('worker_id', '==', uid)
            .where('status', '==', 'hired')
            .get()
        analytics.hiredJobs = hiredSnap.size

    } else if (profile.role === 'vendor') {
        const leadsSnap = await adminDb.collection('quote_requests')
            .where('vendor_id', '==', uid)
            .where('status', '==', 'pending')
            .get()
        analytics.pendingApps = leadsSnap.size
    }

    if (profile.status === 'pending' && profile.role !== 'restaurant') {
        return (
            <div className="min-h-[80vh] flex items-center justify-center py-12 px-4">
                <div className="max-w-xl w-full">
                    <Card className="border-0 shadow-2xl shadow-amber-900/5 ring-1 ring-zinc-100 bg-white/80 backdrop-blur-xl rounded-2xl overflow-hidden transition-all duration-500">
                        <div className="h-2 w-full bg-gradient-to-r from-amber-400 via-orange-400 to-amber-500" />
                        <CardHeader className="pt-12 pb-8 text-center bg-gradient-to-b from-amber-50/50 to-transparent">
                            <div className="mx-auto w-24 h-24 bg-amber-100/50 rounded-full flex items-center justify-center mb-8 shadow-inner relative">
                                <div className="absolute inset-0 border-4 border-amber-200/40 rounded-full animate-ping" style={{ animationDuration: '3s' }} />
                                <div className="absolute inset-2 bg-amber-100 rounded-full flex items-center justify-center shadow-sm">
                                    <Clock className="w-10 h-10 text-amber-600" />
                                </div>
                            </div>
                            <CardTitle className="text-3xl font-bold tracking-tight text-zinc-900 mb-3">Profile Under Review</CardTitle>
                            <CardDescription className="text-base text-zinc-600 leading-relaxed max-w-md mx-auto">
                                Thank you for completing your profile! Our admin team is currently verifying your details.
                                This usually takes up to 24 hours. We will email you once approved.
                            </CardDescription>
                        </CardHeader>

                        {latestDoc && (
                            <CardContent className="px-6 sm:px-10 pb-10">
                                <div className="bg-white rounded-xl p-6 border border-zinc-200/60 shadow-sm text-left relative overflow-hidden group hover:border-amber-200 transition-colors">
                                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-amber-400 group-hover:bg-amber-500 transition-colors" />
                                    <h4 className="flex items-center gap-2 font-semibold text-zinc-900 mb-5 pl-2">
                                        <Activity className="w-4 h-4 text-amber-500" /> Document Verification Status
                                    </h4>
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pl-2 p-4 bg-zinc-50/50 rounded-lg border border-zinc-100">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-blue-100/80 flex items-center justify-center shrink-0">
                                                <FileText className="w-5 h-5 text-blue-600" />
                                            </div>
                                            <span className="font-medium text-zinc-800 capitalize truncate line-clamp-1">{latestDoc.document_type?.replace('_', ' ')}</span>
                                        </div>
                                        {latestDoc.ai_status === 'pending' || latestDoc.ai_status === 'processing' ? (
                                            <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 shadow-sm px-4 py-1.5 text-sm shrink-0">Processing by AI...</Badge>
                                        ) : latestDoc.ai_status === 'passed' ? (
                                            <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 shadow-sm px-4 py-1.5 text-sm shrink-0">AI Verified</Badge>
                                        ) : (
                                            <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200 shadow-sm px-4 py-1.5 text-sm shrink-0">Flagged for Review</Badge>
                                        )}
                                    </div>
                                </div>
                            </CardContent>
                        )}

                        <CardFooter className="flex flex-col-reverse sm:flex-row justify-center gap-3 sm:gap-4 px-6 sm:px-10 pb-10 bg-gradient-to-t from-zinc-50/50 to-transparent">
                            <form action="/auth/signout" method="post" className="w-full sm:w-auto">
                                <Button type="submit" variant="outline" className="w-full h-12 px-8 rounded-xl border-zinc-200 text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 transition-all text-base font-medium">Sign Out</Button>
                            </form>
                            <Link href="/" className="w-full sm:w-auto">
                                <Button className="w-full h-12 px-8 rounded-xl shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all text-base font-medium bg-zinc-900 text-white">Back to Home</Button>
                            </Link>
                        </CardFooter>
                    </Card>
                </div>
            </div>
        )
    }

    if (profile.status === 'rejected' || profile.status === 'blocked') {
        return (
            <div className="min-h-[80vh] flex items-center justify-center py-12 px-4">
                <div className="max-w-xl w-full">
                    <Card className="border-0 shadow-2xl shadow-red-900/5 ring-1 ring-zinc-100 bg-white/80 backdrop-blur-xl rounded-2xl overflow-hidden transition-all duration-500">
                        <div className="h-2 w-full bg-gradient-to-r from-red-500 to-rose-600" />
                        <CardHeader className="pt-12 pb-6 text-center bg-gradient-to-b from-red-50/50 to-transparent">
                            <div className="mx-auto w-24 h-24 bg-red-50 rounded-full flex items-center justify-center mb-8 shadow-inner ring-4 ring-red-50/50">
                                <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center shadow-sm">
                                    <XCircle className="w-10 h-10 text-red-600" />
                                </div>
                            </div>
                            <CardTitle className="text-3xl font-bold tracking-tight text-zinc-900 mb-3">Profile Not Approved</CardTitle>
                            <CardDescription className="text-base text-zinc-600 leading-relaxed max-w-md mx-auto">
                                Unfortunately, your profile could not be verified at this time.
                            </CardDescription>
                        </CardHeader>

                        <CardContent className="px-6 sm:px-10 pb-10">
                            <div className="bg-red-50/50 rounded-xl p-6 border border-red-100 text-left">
                                <h4 className="flex items-center gap-2 font-semibold text-red-900 mb-3">
                                    <AlertTriangle className="w-5 h-5 text-red-600" /> Admin Notes
                                </h4>
                                <p className="text-zinc-700 text-sm leading-relaxed pl-7">
                                    {profile.admin_notes || "Please double check your uploaded documents for any discrepancies and try contacting support."}
                                </p>
                            </div>
                        </CardContent>

                        <CardFooter className="flex justify-center pb-10 px-6 sm:px-10 bg-gradient-to-t from-zinc-50/50 to-transparent">
                            <form action="/auth/signout" method="post" className="w-full sm:w-auto">
                                <Button type="submit" variant="outline" className="w-full h-12 px-12 rounded-xl border-zinc-200 hover:bg-zinc-100 transition-all text-base font-medium">Sign Out</Button>
                            </form>
                        </CardFooter>
                    </Card>
                </div>
            </div>
        )
    }

    // Approved! Regular dashboard
    return (
        <div className="container max-w-6xl mx-auto py-12 px-4">
            {profile.status === 'pending' && profile.role === 'restaurant' && (
                <div className="mb-10 p-5 bg-amber-50/80 border border-amber-200/60 rounded-xl flex items-start gap-4 shadow-sm">
                    <div className="mt-0.5 bg-amber-100 p-2 rounded-full hidden sm:block">
                        <AlertTriangle className="w-5 h-5 text-amber-600" />
                    </div>
                    <div>
                        <h3 className="text-amber-800 font-semibold mb-1 flex items-center gap-2">
                            <span className="sm:hidden"><AlertTriangle className="w-4 h-4" /></span>
                            Food License Verification Required
                        </h3>
                        <p className="text-amber-700/90 text-sm leading-relaxed">
                            Welcome! You can freely browse our directory of verified workers and B2B suppliers. However, <strong>you must upload your food license and receive admin approval before you can post jobs or hire staff.</strong>
                        </p>
                    </div>
                </div>
            )}

            <header className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-zinc-900 mb-1">Welcome back, {profile.full_name || 'User'}!</h1>
                    <div className="text-zinc-500 flex items-center gap-2">
                        You are signed in as a verified <Badge variant="secondary" className="capitalize text-xs rounded-md">{profile.role}</Badge>
                    </div>
                </div>
                <form action="/auth/signout" method="post">
                    <Button type="submit" variant="outline" className="h-10 text-zinc-600">Sign Out</Button>
                </form>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
                {profile.role === 'restaurant' && (
                    <>
                        <Card className="border-primary/20 shadow-sm relative overflow-hidden transition-all hover:shadow-md">
                            <div className="absolute top-0 left-0 right-0 h-1 bg-primary"></div>
                            <CardHeader>
                                <div className="p-2.5 bg-primary/10 w-fit rounded-lg mb-2"><Briefcase className="w-5 h-5 text-primary" /></div>
                                <CardTitle>Post a New Job</CardTitle>
                                <CardDescription>Hire verified chefs, waiters, and kitchen helpers in your zone.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                {profile.status === 'pending' ? (
                                    <Button className="w-full h-10 shadow-sm opacity-50 cursor-not-allowed bg-zinc-100 text-zinc-400 border border-zinc-200 hover:bg-zinc-100" title="License required to post jobs">
                                        Create Job Post (Locked)
                                    </Button>
                                ) : (
                                    <Link href="/dashboard/restaurant/post-job" className="w-full">
                                        <Button className="w-full h-10 shadow-sm">Create Job Post</Button>
                                    </Link>
                                )}
                            </CardContent>
                        </Card>
                        <Card className="shadow-sm border-zinc-200 transition-all hover:shadow-md">
                            <CardHeader>
                                <div className="p-2.5 bg-zinc-100 w-fit rounded-lg mb-2"><Users className="w-5 h-5 text-zinc-600" /></div>
                                <CardTitle>Manage Jobs</CardTitle>
                                <CardDescription>Review applications and make hiring decisions.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Link href="/dashboard/restaurant/jobs" className="w-full">
                                    <Button variant="outline" className="w-full h-10">View Active Jobs</Button>
                                </Link>
                            </CardContent>
                        </Card>
                        <Card className="shadow-sm border-zinc-200 transition-all hover:shadow-md">
                            <CardHeader>
                                <div className="p-2.5 bg-zinc-100 w-fit rounded-lg mb-2"><Store className="w-5 h-5 text-zinc-600" /></div>
                                <CardTitle>B2B Suppliers</CardTitle>
                                <CardDescription>Find packaging, equipment, and ingredients.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Link href="/dashboard/restaurant/vendors" className="w-full">
                                    <Button variant="outline" className="w-full h-10">Browse Vendors</Button>
                                </Link>
                            </CardContent>
                        </Card>
                        <Card className="shadow-sm border-zinc-200 transition-all hover:shadow-md md:col-span-2 lg:col-span-3">
                            <CardHeader>
                                <div className="p-2.5 bg-zinc-100 w-fit rounded-lg mb-2"><Users className="w-5 h-5 text-zinc-600" /></div>
                                <CardTitle>Worker Directory</CardTitle>
                                <CardDescription>Proactively browse active verified workers in your zone.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Link href="/dashboard/restaurant/workers" className="w-full md:w-auto">
                                    <Button variant="outline" className="w-full md:w-auto h-10 px-8">Browse Directory</Button>
                                </Link>
                            </CardContent>
                        </Card>
                    </>
                )}

                {profile.role === 'worker' && (
                    <>
                        <Card className="border-primary/20 shadow-sm relative overflow-hidden transition-all hover:shadow-md">
                            <div className="absolute top-0 left-0 right-0 h-1 bg-primary"></div>
                            <CardHeader>
                                <div className="p-2.5 bg-primary/10 w-fit rounded-lg mb-2"><Briefcase className="w-5 h-5 text-primary" /></div>
                                <CardTitle>Find Jobs</CardTitle>
                                <CardDescription>Browse active job postings from restaurants in your zone.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Link href="/dashboard/worker/jobs" className="w-full">
                                    <Button className="w-full h-10 shadow-sm">Browse Jobs</Button>
                                </Link>
                            </CardContent>
                        </Card>
                        <Card className="shadow-sm border-zinc-200 transition-all hover:shadow-md">
                            <CardHeader>
                                <div className="p-2.5 bg-zinc-100 w-fit rounded-lg mb-2"><Activity className="w-5 h-5 text-zinc-600" /></div>
                                <CardTitle>My Applications</CardTitle>
                                <CardDescription>Track the status of jobs you have applied for.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Link href="/dashboard/worker/applications" className="w-full">
                                    <Button variant="outline" className="w-full h-10">Track Applications</Button>
                                </Link>
                            </CardContent>
                        </Card>
                    </>
                )}

                {profile.role === 'vendor' && (
                    <Card className="border-primary/20 shadow-sm relative overflow-hidden transition-all hover:shadow-md lg:col-span-2">
                        <div className="absolute top-0 left-0 right-0 h-1 bg-primary"></div>
                        <CardHeader>
                            <div className="p-2.5 bg-primary/10 w-fit rounded-lg mb-2"><Package className="w-5 h-5 text-primary" /></div>
                            <CardTitle>Quote Requests</CardTitle>
                            <CardDescription>Manage incoming B2B leads from local restaurants.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Link href="/dashboard/vendor/leads">
                                <Button className="h-10 px-6 shadow-sm">View Incoming Leads</Button>
                            </Link>
                        </CardContent>
                    </Card>
                )}
            </div>

            <h2 className="text-xl font-bold text-zinc-900 mb-6">Overview &amp; Stats</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
                <Card className="shadow-sm border-zinc-200">
                    <CardContent className="p-6">
                        <div className="flex items-center gap-6">
                            {profile.role === 'restaurant' && (
                                <>
                                    <div className="space-y-1">
                                        <p className="text-3xl font-bold tracking-tight text-primary">{analytics.activeJobs}</p>
                                        <p className="text-sm font-medium text-zinc-500">Active Jobs</p>
                                    </div>
                                    <div className="w-px h-12 bg-zinc-200"></div>
                                    <div className="space-y-1">
                                        <p className="text-3xl font-bold tracking-tight text-blue-600">{analytics.pendingApps}</p>
                                        <p className="text-sm font-medium text-zinc-500">Pending Applicants</p>
                                    </div>
                                </>
                            )}
                            {profile.role === 'worker' && (
                                <>
                                    <div className="space-y-1">
                                        <p className="text-3xl font-bold tracking-tight text-primary">{analytics.totalApps}</p>
                                        <p className="text-sm font-medium text-zinc-500">Total Applications</p>
                                    </div>
                                    <div className="w-px h-12 bg-zinc-200"></div>
                                    <div className="space-y-1">
                                        <p className="text-3xl font-bold tracking-tight text-green-600">{analytics.hiredJobs}</p>
                                        <p className="text-sm font-medium text-zinc-500">Jobs Secured</p>
                                    </div>
                                </>
                            )}
                            {profile.role === 'vendor' && (
                                <div className="space-y-1">
                                    <p className="text-3xl font-bold tracking-tight text-primary">{analytics.pendingApps}</p>
                                    <p className="text-sm font-medium text-zinc-500">Pending Quote Requests</p>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>

            <h2 className="text-xl font-bold text-zinc-900 mb-6">Recent Activity</h2>
            <Card className="shadow-sm border-zinc-200">
                <CardContent className="p-12 text-center">
                    <div className="mx-auto w-12 h-12 rounded-full bg-zinc-100 flex items-center justify-center mb-4">
                        <Clock className="w-6 h-6 text-zinc-400" />
                    </div>
                    <p className="text-zinc-500 font-medium">No recent activity to show.</p>
                </CardContent>
            </Card>
        </div>
    )
}
