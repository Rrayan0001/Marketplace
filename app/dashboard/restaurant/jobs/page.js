import { adminAuth, adminDb } from "@/lib/firebase/admin";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import EmptyState from "@/components/ui/empty-state";
import { ArrowLeft02Icon, PlusSignIcon, Folder01Icon, Calendar01Icon, Clock01Icon, UserGroupIcon, Briefcase02Icon } from "hugeicons-react";

export default async function RestaurantJobsPage() {
    const cookieStore = await cookies();
    const session = cookieStore.get("session")?.value;
    if (!session) redirect('/login');

    let decodedToken;
    try {
        decodedToken = await adminAuth.verifySessionCookie(session, true);
    } catch {
        redirect('/login');
    }

    const uid = decodedToken.uid;

    // 2. Get restaurant profile
    const restaurantSnap = await adminDb.collection('restaurant_profiles').where('profile_id', '==', uid).limit(1).get();
    if (restaurantSnap.empty) redirect('/dashboard');
    const restaurant = { id: restaurantSnap.docs[0].id, ...restaurantSnap.docs[0].data() };

    // 3. Fetch jobs posted by this restaurant
    const jobsSnap = await adminDb.collection('jobs')
        .where('restaurant_id', '==', uid)
        .get();

    const jobs = await Promise.all(jobsSnap.docs.map(async (doc) => {
        const data = doc.data();

        // Fetch applications count for this job
        const appsSnap = await adminDb.collection('applications')
            .where('job_id', '==', doc.id)
            .get();

        return {
            id: doc.id,
            ...data,
            applications: [{ count: appsSnap.size }]
        };
    }));

    // In-memory sort
    jobs.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

    return (
        <div className="container max-w-5xl mx-auto py-12 px-4">
            <div className="mb-4 md:mb-6">
                <Link href="/dashboard" className="inline-flex items-center text-zinc-500 hover:text-zinc-900 transition-colors font-medium text-sm">
                    <ArrowLeft02Icon className="w-4 h-4 mr-2" /> Back to Dashboard
                </Link>
            </div>

            <header className="mb-6 md:mb-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-zinc-900 tracking-tight mb-1 md:mb-2">Manage Jobs</h1>
                    <p className="text-sm md:text-base text-zinc-500">Review your active postings and manage applicants.</p>
                </div>
                <Link href="/dashboard/restaurant/post-job" className="w-full sm:w-auto">
                    <Button className="w-full shadow-sm shadow-primary/20 bg-primary hover:bg-primary/90 text-white transition-all">
                        <PlusSignIcon className="w-4 h-4 mr-2" /> Post New Job
                    </Button>
                </Link>
            </header>

            {(!jobs || jobs.length === 0) ? (
                <EmptyState
                    icon={<Folder01Icon className="h-8 w-8 text-primary" />}
                    title="No jobs posted yet"
                    description="Create your first listing to start hiring verified workers."
                    actionHref="/dashboard/restaurant/post-job"
                    actionLabel="Create Job Post"
                />
            ) : (
                <div className="grid gap-3 md:gap-4">
                    {jobs.map((job) => (
                        <Card key={job.id} className="transition-all hover:shadow-md hover:border-zinc-300 border-zinc-200 group">
                            <CardContent className="p-5 md:p-8 flex flex-col md:flex-row gap-4 md:gap-6 justify-between items-start md:items-center">
                                <div className="space-y-4 flex-1">
                                    <div>
                                        <div className="flex items-center gap-3 mb-2">
                                            <h3 className="text-lg md:text-xl font-bold text-zinc-900 m-0 group-hover:text-primary transition-colors">{job.title}</h3>
                                            <Badge variant={job.is_active ? "default" : "secondary"} className={job.is_active ? "bg-primary/10 text-primary hover:bg-primary/20" : ""}>
                                                {job.is_active ? 'Active' : 'Closed'}
                                            </Badge>
                                        </div>
                                        <div className="flex flex-wrap gap-x-5 gap-y-2 text-xs md:text-sm text-zinc-500 font-medium">
                                            <span className="flex items-center gap-1.5 capitalize">
                                                <Briefcase02Icon className="w-3.5 h-3.5 md:w-4 md:h-4 text-zinc-400" />
                                                {job.role_type.replace('_', ' ')}
                                            </span>
                                            <span className="flex items-center gap-1.5 capitalize">
                                                <Clock01Icon className="w-3.5 h-3.5 md:w-4 md:h-4 text-zinc-400" />
                                                {job.job_type.replace('_', ' ')} • {job.shift.replace('_', ' ')}
                                            </span>
                                            <span className="flex items-center gap-1.5">
                                                <Calendar01Icon className="w-3.5 h-3.5 md:w-4 md:h-4 text-zinc-400" />
                                                Posted {new Date(job.created_at).toLocaleDateString()}
                                            </span>
                                        </div>
                                    </div>
                                    <div>
                                        <Badge variant="outline" className="bg-blue-50/50 text-blue-700 border-blue-200/60 text-xs md:text-sm font-semibold px-2.5 py-1">
                                            <UserGroupIcon className="w-3.5 h-3.5 md:w-4 md:h-4 mr-1.5" />
                                            {job.applications[0]?.count || 0} Applicants
                                        </Badge>
                                    </div>
                                </div>
                                <div className="w-full md:w-auto mt-2 md:mt-0 pt-4 md:pt-0 border-t border-zinc-100 md:border-t-0">
                                    {job.applications[0]?.count > 0 ? (
                                        <Link href={`/dashboard/restaurant/jobs/${job.id}`}>
                                            <Button className="w-full md:w-auto h-10 md:h-11 px-5 md:px-6 shadow-sm">
                                                View Applicants
                                            </Button>
                                        </Link>
                                    ) : (
                                        <Button variant="outline" disabled className="w-full md:w-auto h-10 md:h-11 px-5 md:px-6">
                                            No Applicants Yet
                                        </Button>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
