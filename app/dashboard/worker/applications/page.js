import { adminAuth, adminDb } from "@/lib/firebase/admin";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import EmptyState from "@/components/ui/empty-state";
import { ArrowLeft, FileText, Building2, Calendar, Clock, CheckCircle2, XCircle, Search } from "lucide-react";

export default async function WorkerApplicationsPage() {
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

    const workerSnap = await adminDb.collection('worker_profiles').where('profile_id', '==', uid).limit(1).get();
    if (workerSnap.empty) redirect('/dashboard');
    const worker = { id: workerSnap.docs[0].id, ...workerSnap.docs[0].data() };

    // Fetch applications
    const appsSnap = await adminDb.collection('applications')
        .where('worker_id', '==', worker.id)
        .get();

    const applications = await Promise.all(appsSnap.docs.map(async (doc) => {
        const appData = doc.data();

        // Fetch job details
        const jobSnap = await adminDb.collection('jobs').doc(appData.job_id).get();
        const jobData = jobSnap.exists ? jobSnap.data() : null;

        let restaurantData = null;
        if (jobData?.restaurant_id) {
            const resSnap = await adminDb.collection('restaurant_profiles')
                .where('profile_id', '==', jobData.restaurant_id)
                .limit(1)
                .get();
            restaurantData = !resSnap.empty ? resSnap.docs[0].data() : null;
        }

        return {
            id: doc.id,
            ...appData,
            jobs: {
                ...jobData,
                restaurant_profiles: restaurantData
            }
        };
    }));

    // In-memory sort
    applications.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

    return (
        <div className="container max-w-4xl mx-auto py-12 px-4">
            <div className="mb-6">
                <Link href="/dashboard" className="inline-flex items-center text-zinc-500 hover:text-zinc-900 transition-colors font-medium text-sm">
                    <ArrowLeft className="w-4 h-4 mr-2" /> Back to Dashboard
                </Link>
            </div>

            <header className="mb-10 flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-zinc-900 tracking-tight mb-2">My Applications</h1>
                    <p className="text-zinc-500">Track the status of the jobs you have applied to.</p>
                </div>
                <Link href="/dashboard/worker/jobs">
                    <Button variant="outline" className="shadow-sm hidden sm:flex">
                        <Search className="w-4 h-4 mr-2" /> Browse Jobs
                    </Button>
                </Link>
            </header>

            {(!applications || applications.length === 0) ? (
                <EmptyState
                    icon={<FileText className="h-8 w-8" />}
                    title="No applications yet"
                    description="You haven&apos;t applied to any jobs yet. Browse open listings to get started."
                    actionHref="/dashboard/worker/jobs"
                    actionLabel="Browse Open Jobs"
                />
            ) : (
                <div className="grid gap-4">
                    {applications.map((app) => {
                        const job = app.jobs;
                        const restaurant = job?.restaurant_profiles;

                        return (
                            <Card key={app.id} className="transition-all hover:shadow-md border-zinc-200">
                                <CardContent className="p-6 sm:p-8 flex flex-col sm:flex-row gap-6 justify-between items-start sm:items-center">
                                    <div className="space-y-3 flex-1">
                                        <h3 className="text-xl font-bold text-zinc-900 m-0">{job?.title || 'Unknown Job'}</h3>
                                        <div className="flex flex-wrap gap-4 text-sm text-zinc-600 font-medium">
                                            <span className="flex items-center gap-1.5 text-zinc-800">
                                                <Building2 className="w-4 h-4 text-zinc-400" />
                                                {restaurant?.restaurant_name || 'Restaurant'}
                                            </span>
                                            <span className="flex items-center gap-1.5">
                                                <Calendar className="w-4 h-4 text-zinc-400" />
                                                Applied on {new Date(app.created_at).toLocaleDateString()}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="w-full sm:w-auto mt-4 sm:mt-0 flex justify-end">
                                        <Badge variant="outline" className={`
                                            px-4 py-1.5 font-semibold text-sm rounded-full
                                            ${app.status === 'pending' ? 'bg-amber-50 text-amber-700 border-amber-200' : ''}
                                            ${app.status === 'hired' ? 'bg-green-50 text-green-700 border-green-200' : ''}
                                            ${app.status === 'rejected' ? 'bg-red-50 text-red-700 border-red-200' : ''}
                                        `}>
                                            {app.status === 'pending' ? (
                                                <><Clock className="w-3.5 h-3.5 mr-1.5" /> Under Review</>
                                            ) : app.status === 'hired' ? (
                                                <><CheckCircle2 className="w-3.5 h-3.5 mr-1.5" /> Selected!</>
                                            ) : (
                                                <><XCircle className="w-3.5 h-3.5 mr-1.5" /> Rejected</>
                                            )}
                                        </Badge>
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
