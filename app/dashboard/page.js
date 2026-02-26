import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Clock, CheckCircle2, AlertTriangle, XCircle, Briefcase, Users, Store, Package, Activity } from 'lucide-react'

export default async function DashboardPage() {
    const supabase = await createClient()

    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login')
    }

    // Check if profile exists
    const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

    // Fetch the latest document status if available
    const { data: documents } = await supabase
        .from('documents')
        .select('ai_status, document_type')
        .eq('profile_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)

    const latestDoc = documents?.[0] || null;

    // Fetch Analytics Data based on Role
    let analytics = { activeJobs: 0, pendingApps: 0, totalApps: 0, hiredJobs: 0 };

    if (profile?.role === 'restaurant') {
        const { data: restaurant } = await supabase.from('restaurant_profiles').select('id').eq('profile_id', user.id).single();
        if (restaurant) {
            const { count: activeJobsCount } = await supabase.from('jobs').select('*', { count: 'exact', head: true }).eq('restaurant_id', restaurant.id).eq('is_active', true);
            const { count: pendingAppsCount } = await supabase.from('applications').select('*, jobs!inner(restaurant_id)', { count: 'exact', head: true }).eq('jobs.restaurant_id', restaurant.id).eq('status', 'pending');
            analytics.activeJobs = activeJobsCount || 0;
            analytics.pendingApps = pendingAppsCount || 0;
        }
    } else if (profile?.role === 'worker') {
        const { data: worker } = await supabase.from('worker_profiles').select('id').eq('profile_id', user.id).single();
        if (worker) {
            const { count: totalAppsCount } = await supabase.from('applications').select('*', { count: 'exact', head: true }).eq('worker_id', worker.id);
            const { count: hiredCount } = await supabase.from('applications').select('*', { count: 'exact', head: true }).eq('worker_id', worker.id).eq('status', 'hired');
            analytics.totalApps = totalAppsCount || 0;
            analytics.hiredJobs = hiredCount || 0;
        }
    } else if (profile?.role === 'vendor') {
        const { data: vendor } = await supabase.from('vendor_profiles').select('id').eq('profile_id', user.id).single();
        if (vendor) {
            const { count: pendingLeadsCount } = await supabase.from('quote_requests').select('*', { count: 'exact', head: true }).eq('vendor_id', vendor.id).eq('status', 'pending');
            analytics.pendingApps = pendingLeadsCount || 0; // reusing pendingApps for simplicity in layout
        }
    }

    // If no profile exists, or role is unknown, maybe they didn't finish onboarding
    if (error || !profile) {
        // If not in profiles, read role from user_metadata and go to onboarding
        const role = user.user_metadata?.role || 'worker' // fallback to worker
        redirect(`/onboarding/${role}`)
    }

    // They have a profile, but is it pending?
    if (profile.status === 'pending') {
        return (
            <div className="container max-w-2xl mx-auto pt-24 px-4 pb-12 text-center">
                <Card className="shadow-lg border-zinc-200">
                    <CardHeader className="pt-10 pb-6">
                        <div className="flex justify-center mb-6">
                            <Clock className="w-16 h-16 text-amber-500" />
                        </div>
                        <CardTitle className="text-3xl font-bold tracking-tight text-zinc-900">Profile Under Review</CardTitle>
                        <CardDescription className="text-base text-zinc-500 mt-2">
                            Thank you for completing your profile! Our admin team is currently verifying your details.
                            This usually takes up to 24 hours. We will email you once approved.
                        </CardDescription>
                    </CardHeader>

                    {latestDoc && (
                        <CardContent className="px-8 pb-8">
                            <div className="bg-zinc-50 rounded-xl p-5 border border-zinc-200 text-left">
                                <h4 className="flex items-center gap-2 font-semibold text-zinc-900 mb-3">
                                    <Activity className="w-4 h-4" /> Document Verification Status
                                </h4>
                                <div className="flex items-center gap-3">
                                    <span className="font-medium text-zinc-700 capitalize">{latestDoc.document_type.replace('_', ' ')}:</span>
                                    {latestDoc.ai_status === 'pending' || latestDoc.ai_status === 'processing' ? (
                                        <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">Processing by AI...</Badge>
                                    ) : latestDoc.ai_status === 'passed' ? (
                                        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">AI Verified (Awaiting Admin)</Badge>
                                    ) : (
                                        <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">AI Flagged (Manual Review Required)</Badge>
                                    )}
                                </div>
                            </div>
                        </CardContent>
                    )}

                    <CardFooter className="flex justify-center gap-4 pb-10">
                        <Link href="/">
                            <Button variant="outline" className="h-11 px-6">Back to Home</Button>
                        </Link>
                        <form action="/auth/signout" method="post">
                            <Button type="submit" variant="ghost" className="h-11 px-6 text-zinc-600 hover:text-zinc-900 font-medium">Sign Out</Button>
                        </form>
                    </CardFooter>
                </Card>
            </div>
        )
    }

    if (profile.status === 'rejected' || profile.status === 'blocked') {
        return (
            <div className="container max-w-2xl mx-auto pt-24 px-4 pb-12 text-center">
                <Card className="shadow-lg border-zinc-200">
                    <CardHeader className="pt-10 pb-6">
                        <div className="flex justify-center mb-6">
                            <XCircle className="w-16 h-16 text-red-500" />
                        </div>
                        <CardTitle className="text-3xl font-bold tracking-tight text-zinc-900">Profile Not Approved</CardTitle>
                        <CardDescription className="text-base text-zinc-500 mt-2">
                            Unfortunately, your profile could not be verified at this time.
                            <br/><br/>
                            <span className="font-medium text-zinc-700">Admin Notes:</span> {profile.admin_notes || "Please double check your uploaded documents."}
                        </CardDescription>
                    </CardHeader>
                    <CardFooter className="flex justify-center pb-10">
                        <form action="/auth/signout" method="post">
                            <Button type="submit" variant="outline" className="h-11 px-6">Sign Out</Button>
                        </form>
                    </CardFooter>
                </Card>
            </div>
        )
    }

    // Approved! Regular dashboard
    return (
        <div className="container max-w-6xl mx-auto py-12 px-4">
            <header className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-zinc-900 mb-1">Welcome back, {profile.full_name || 'User'}!</h1>
                    <p className="text-zinc-500 flex items-center gap-2">
                        You are signed in as a verified <Badge variant="secondary" className="capitalize text-xs rounded-md">{profile.role}</Badge>
                    </p>
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
                                <div className="p-2.5 bg-primary/10 w-fit rounded-lg mb-2">
                                    <Briefcase className="w-5 h-5 text-primary" />
                                </div>
                                <CardTitle>Post a New Job</CardTitle>
                                <CardDescription>Hire verified chefs, waiters, and kitchen helpers in your zone.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Link href="/dashboard/restaurant/post-job" className="w-full">
                                    <Button className="w-full h-10 shadow-sm">Create Job Post</Button>
                                </Link>
                            </CardContent>
                        </Card>
                        
                        <Card className="shadow-sm border-zinc-200 transition-all hover:shadow-md">
                            <CardHeader>
                                <div className="p-2.5 bg-zinc-100 w-fit rounded-lg mb-2">
                                    <Users className="w-5 h-5 text-zinc-600" />
                                </div>
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
                                <div className="p-2.5 bg-zinc-100 w-fit rounded-lg mb-2">
                                    <Store className="w-5 h-5 text-zinc-600" />
                                </div>
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
                                <div className="p-2.5 bg-zinc-100 w-fit rounded-lg mb-2">
                                    <Users className="w-5 h-5 text-zinc-600" />
                                </div>
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
                                <div className="p-2.5 bg-primary/10 w-fit rounded-lg mb-2">
                                    <Briefcase className="w-5 h-5 text-primary" />
                                </div>
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
                                <div className="p-2.5 bg-zinc-100 w-fit rounded-lg mb-2">
                                    <Activity className="w-5 h-5 text-zinc-600" />
                                </div>
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
                            <div className="p-2.5 bg-primary/10 w-fit rounded-lg mb-2">
                                <Package className="w-5 h-5 text-primary" />
                            </div>
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

            <h2 className="text-xl font-bold text-zinc-900 mb-6">Overview & Stats</h2>
            
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
