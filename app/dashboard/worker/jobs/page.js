import { adminAuth, adminDb } from "@/lib/firebase/admin";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import ApplyButton from "@/components/job/ApplyButton";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import EmptyState from "@/components/ui/empty-state";
import { ArrowLeft, Clock, Building2, Calendar, ChefHat, Star, Banknote } from "lucide-react";

export default async function WorkerJobsPage() {
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

    // 2. Get worker profile
    const workerSnap = await adminDb.collection('worker_profiles').where('profile_id', '==', uid).limit(1).get();
    if (workerSnap.empty) redirect('/dashboard');
    const worker = { id: workerSnap.docs[0].id, ...workerSnap.docs[0].data() };

    // 3. Fetch all active Jobs
    const jobsSnap = await adminDb.collection('jobs').where('is_active', '==', true).get();

    // 4. Fetch the jobs this worker has ALREADY applied to
    const appsSnap = await adminDb.collection('applications').where('worker_id', '==', worker.id).get();
    const appliedJobIds = new Set(appsSnap.docs.map(doc => doc.data().job_id));

    const jobs = await Promise.all(jobsSnap.docs.map(async (doc) => {
        const data = doc.data();
        // Fetch restaurant details for each job
        const restaurantSnap = await adminDb.collection('restaurant_profiles').where('profile_id', '==', data.restaurant_id).limit(1).get();
        const restaurant = !restaurantSnap.empty ? restaurantSnap.docs[0].data() : null;

        return {
            id: doc.id,
            ...data,
            restaurant_profiles: restaurant
        };
    }));

    // In-memory sort by created_at desc
    jobs.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

    return (
        <div className="container max-w-6xl mx-auto py-12 px-4">
            <div className="mb-6">
                <Link href="/dashboard" className="inline-flex items-center text-zinc-500 hover:text-zinc-900 transition-colors font-medium text-sm">
                    <ArrowLeft className="w-4 h-4 mr-2" /> Back to Dashboard
                </Link>
            </div>

            <header className="mb-10">
                <h1 className="text-3xl font-bold text-zinc-900 tracking-tight mb-2">Explore Jobs</h1>
                <p className="text-zinc-500">Find open shifts and full-time positions from top restaurants in your area.</p>
            </header>

            {(!jobs || jobs.length === 0) ? (
                <EmptyState
                    icon={<ChefHat className="h-8 w-8" />}
                    title="No jobs available right now"
                    description="Check back later. Restaurants are constantly posting new positions."
                />
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {jobs.map((job) => {
                        const hasApplied = appliedJobIds.has(job.id);
                        const restaurant = job.restaurant_profiles;

                        return (
                            <Card key={job.id} className="flex flex-col overflow-hidden border-zinc-200 shadow-sm transition-all hover:shadow-md">
                                <CardContent className="p-6 flex-1 flex flex-col">
                                    <div className="flex justify-between items-start gap-4 mb-3">
                                        <h3 className="text-xl font-bold text-zinc-900 m-0 line-clamp-2 leading-tight">{job.title}</h3>
                                        <Badge variant="secondary" className="shrink-0 bg-primary/10 text-primary hover:bg-primary/20 uppercase font-semibold text-[10px] tracking-wider py-1 px-2.5 shadow-sm">
                                            {job.role_type.replace('_', ' ')}
                                        </Badge>
                                    </div>

                                    <div className="mb-5 flex items-start gap-2 text-zinc-700">
                                        <Building2 className="w-4 h-4 mt-0.5 shrink-0 text-zinc-400" />
                                        <span className="font-semibold text-sm leading-tight">{restaurant?.restaurant_name || 'Restaurant'}</span>
                                    </div>

                                    <div className="grid grid-cols-2 gap-y-3 gap-x-2 mb-5">
                                        <div className="flex items-center gap-2 text-sm text-zinc-600">
                                            <div className="w-6 h-6 rounded bg-zinc-100 flex items-center justify-center shrink-0">
                                                <Clock className="w-3.5 h-3.5 text-zinc-500" />
                                            </div>
                                            <span className="capitalize font-medium truncate">{job.job_type.replace('_', ' ')}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-sm text-zinc-600">
                                            <div className="w-6 h-6 rounded bg-zinc-100 flex items-center justify-center shrink-0">
                                                <Calendar className="w-3.5 h-3.5 text-zinc-500" />
                                            </div>
                                            <span className="capitalize font-medium truncate">{job.shift.replace('_', ' ')} Shift</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-sm text-zinc-600">
                                            <div className="w-6 h-6 rounded bg-zinc-100 flex items-center justify-center shrink-0">
                                                <Star className="w-3.5 h-3.5 text-zinc-500" />
                                            </div>
                                            <span className="font-medium truncate">{job.experience_required}+ yrs exp</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-sm text-zinc-600">
                                            <div className="w-6 h-6 rounded bg-zinc-100 flex items-center justify-center shrink-0">
                                                <Banknote className="w-3.5 h-3.5 text-zinc-500" />
                                            </div>
                                            <span className="font-medium truncate">₹{job.salary_min || '?'}{job.salary_max ? ` - ${job.salary_max}` : '+'}</span>
                                        </div>
                                    </div>

                                    <div className="mb-6 flex-1">
                                        <p className="text-sm text-zinc-500 leading-relaxed line-clamp-3 m-0">
                                            {job.description}
                                        </p>
                                    </div>

                                    <div className="mt-auto pt-5 border-t border-zinc-100 flex items-center justify-between gap-4">
                                        <span className="text-xs font-medium text-zinc-400">
                                            Posted {new Date(job.created_at).toLocaleDateString()}
                                        </span>
                                        <div className="shrink-0 max-w-[140px]">
                                            <ApplyButton jobId={job.id} workerId={worker.id} hasAppliedInitially={hasApplied} />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
