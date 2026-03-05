import { adminAuth, adminDb } from "@/lib/firebase/admin";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import EmptyState from "@/components/ui/empty-state";
import { ArrowLeft02Icon, UserIcon, Mail01Icon, CallIcon, Clock01Icon, TickDouble02Icon, Cancel01Icon, AiChat02Icon } from "hugeicons-react";

export default async function JobApplicantsPage({ params }) {
    const resolvedParams = await params;
    const jobId = resolvedParams.jobId;

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

    const restaurantSnap = await adminDb.collection('restaurant_profiles').where('profile_id', '==', uid).limit(1).get();
    if (restaurantSnap.empty) redirect('/dashboard');
    const restaurant = { id: restaurantSnap.docs[0].id, ...restaurantSnap.docs[0].data() };

    // Verify the job belongs to this restaurant and get job details
    const jobSnap = await adminDb.collection('jobs').doc(jobId).get();
    const job = jobSnap.exists ? { id: jobSnap.id, ...jobSnap.data() } : null;

    if (!job || job.restaurant_id !== uid) {
        redirect('/dashboard/restaurant/jobs');
    }

    // Fetch applications for this job
    const appsSnap = await adminDb.collection('applications')
        .where('job_id', '==', jobId)
        .get();

    const applications = await Promise.all(appsSnap.docs.map(async (doc) => {
        const appData = doc.data();

        // Fetch worker profile
        const workerSnap = await adminDb.collection('worker_profiles').doc(appData.worker_id).get();
        const workerData = workerSnap.exists ? workerSnap.data() : null;

        let profileData = null;
        if (workerData?.profile_id) {
            const profileSnap = await adminDb.collection('profiles').doc(workerData.profile_id).get();
            profileData = profileSnap.exists ? profileSnap.data() : null;
        }

        return {
            id: doc.id,
            ...appData,
            worker_profiles: {
                ...workerData,
                profiles: profileData
            }
        };
    }));

    // In-memory sort
    applications.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));

    return (
        <div className="container max-w-4xl mx-auto py-8 md:py-12 px-4">
            <div className="mb-4 md:mb-6">
                <Link href="/dashboard/restaurant/jobs" className="inline-flex items-center text-zinc-500 hover:text-zinc-900 transition-colors font-medium text-sm">
                    <ArrowLeft02Icon className="w-4 h-4 mr-2" /> Back to Active Jobs
                </Link>
            </div>

            <header className="mb-6 md:mb-10">
                <h1 className="text-2xl md:text-3xl font-bold text-zinc-900 tracking-tight mb-1 md:mb-2">Applicants: {job.title}</h1>
                <p className="text-sm md:text-base text-zinc-500">Review the workers who applied for this position and make your hiring decision.</p>
            </header>

            {(!applications || applications.length === 0) ? (
                <EmptyState
                    icon={<AiChat02Icon className="h-8 w-8 text-primary" />}
                    title="No applicants yet"
                    description="Your job posting is live, but no one has applied yet. Give it some time."
                />
            ) : (
                <div className="grid gap-4 md:gap-6">
                    {applications.map((app) => {
                        const workerData = app.worker_profiles;
                        const profileData = workerData?.profiles;

                        return (
                            <Card key={app.id} className="overflow-hidden border-zinc-200 shadow-sm transition-all hover:shadow-md hover:border-zinc-300 group">
                                <CardContent className="p-0">
                                    <div className="p-5 md:p-8 flex flex-col md:flex-row justify-between items-start gap-4 md:gap-6">
                                        <div className="flex gap-3 md:gap-6">
                                            <div className="w-11 h-11 md:w-14 md:h-14 shrink-0 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/15 transition-colors">
                                                <UserIcon className="w-5 h-5 md:w-6 md:h-6 text-primary" />
                                            </div>
                                            <div className="space-y-2 md:space-y-3">
                                                <div>
                                                    <div className="text-lg md:text-xl font-bold text-zinc-900 m-0 flex items-center flex-wrap gap-2">
                                                        {profileData?.full_name || 'Anonymous Worker'}
                                                        {profileData?.status === 'approved' && (
                                                            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 font-medium text-[10px] md:text-xs">
                                                                <TickDouble02Icon className="w-3 h-3 md:w-3.5 md:h-3.5 mr-1" /> Verified
                                                            </Badge>
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="flex flex-wrap gap-x-3 md:gap-x-4 gap-y-1.5 text-xs md:text-sm text-zinc-600 font-medium">
                                                    <span className="capitalize">{workerData?.role_type.replace('_', ' ')}</span>
                                                    <span className="text-zinc-300">•</span>
                                                    <span>{workerData?.years_experience}+ Yrs Exp</span>
                                                    <span className="text-zinc-300">•</span>
                                                    <span className="capitalize">{workerData?.availability.replace('_', ' ')} Schedule</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex flex-row md:flex-col items-center md:items-end gap-2 w-full md:w-auto">
                                            <Badge variant="outline" className={`
                                                px-2.5 md:px-3 py-1 font-semibold uppercase tracking-wider text-[10px] md:text-xs
                                                ${app.status === 'pending' ? 'bg-amber-50 text-amber-700 border-amber-200' : ''}
                                                ${app.status === 'hired' ? 'bg-green-50 text-green-700 border-green-200' : ''}
                                                ${app.status === 'rejected' ? 'bg-red-50 text-red-700 border-red-200' : ''}
                                            `}>
                                                {app.status === 'rejected' ? 'Passed' : app.status}
                                            </Badge>
                                            <span className="text-[11px] md:text-xs text-zinc-500 font-medium flex items-center">
                                                <Clock01Icon className="w-3 h-3 md:w-3.5 md:h-3.5 mr-1" />
                                                Applied {new Date(app.created_at).toLocaleDateString()}
                                            </span>
                                        </div>
                                    </div>

                                    {app.status === 'pending' && (
                                        <div className="border-t border-zinc-100 bg-zinc-50/50 p-4 md:px-8 flex flex-col sm:flex-row justify-end gap-3">
                                            <form action="/api/restaurant/application" method="POST" className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                                                <input type="hidden" name="applicationId" value={app.id} />
                                                <input type="hidden" name="jobId" value={jobId} />
                                                <Button type="submit" name="action" value="reject" variant="outline" className="text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700 w-full sm:w-auto h-9 md:h-10 text-sm">
                                                    <Cancel01Icon className="w-4 h-4 mr-2" /> Pass App
                                                </Button>
                                                <Button type="submit" name="action" value="hire" className="bg-green-600 hover:bg-green-700 text-white w-full sm:w-auto h-9 md:h-10 text-sm">
                                                    <TickDouble02Icon className="w-4 h-4 mr-2" /> Hire Applicant
                                                </Button>
                                            </form>
                                        </div>
                                    )}

                                    {app.status === 'hired' && (
                                        <div className="border-t border-zinc-100 bg-primary/5 p-5 md:p-6 md:px-8">
                                            <h4 className="font-semibold text-primary flex items-center gap-2 mb-3 md:mb-4 text-sm md:text-base">
                                                <TickDouble02Icon className="w-4 h-4 md:w-5 md:h-5" /> Contact Information Unlocked
                                            </h4>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
                                                <a href={`mailto:${profileData?.email}`} className="flex items-center gap-3 p-3 rounded-lg bg-white border border-zinc-200 hover:border-primary/30 transition-colors">
                                                    <Mail01Icon className="w-4 h-4 md:w-5 md:h-5 text-zinc-400" />
                                                    <span className="text-xs md:text-sm font-medium text-zinc-700 truncate">{profileData?.email}</span>
                                                </a>
                                                <a href={`tel:${profileData?.phone}`} className="flex items-center gap-3 p-3 rounded-lg bg-white border border-zinc-200 hover:border-primary/30 transition-colors">
                                                    <CallIcon className="w-4 h-4 md:w-5 md:h-5 text-zinc-400" />
                                                    <span className="text-xs md:text-sm font-medium text-zinc-700 truncate">{profileData?.phone || 'Not provided'}</span>
                                                </a>
                                            </div>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
