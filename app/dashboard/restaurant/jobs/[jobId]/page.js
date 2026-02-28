import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import EmptyState from "@/components/ui/empty-state";
import { ArrowLeft, User, Mail, Phone, Clock, FileText, CheckCircle2, XCircle, Ghost } from "lucide-react";

export default async function JobApplicantsPage({ params }) {
    const resolvedParams = await params;
    const jobId = resolvedParams.jobId;

    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) redirect('/login');

    const { data: restaurant } = await supabase
        .from('restaurant_profiles')
        .select('id')
        .eq('profile_id', user.id)
        .single();

    if (!restaurant) redirect('/dashboard');

    // Verify the job belongs to this restaurant and get job details
    const { data: job } = await supabase
        .from('jobs')
        .select('*')
        .eq('id', jobId)
        .eq('restaurant_id', restaurant.id)
        .single();

    if (!job) redirect('/dashboard/restaurant/jobs');

    // Fetch applications for this job joined with worker profile data
    const { data: applications, error } = await supabase
        .from('applications')
        .select(`
      id,
      status,
      created_at,
      worker_id,
      worker_profiles (
        role_type,
        years_experience,
        availability,
        profiles (
          full_name,
          phone,
          email,
          status
        )
      )
    `)
        .eq('job_id', jobId)
        .order('created_at', { ascending: true });

    if (error) {
        console.error("Error fetching applicants:", error);
    }

    return (
        <div className="container max-w-4xl mx-auto py-12 px-4">
            <div className="mb-6">
                <Link href="/dashboard/restaurant/jobs" className="inline-flex items-center text-zinc-500 hover:text-zinc-900 transition-colors font-medium text-sm">
                    <ArrowLeft className="w-4 h-4 mr-2" /> Back to Active Jobs
                </Link>
            </div>

            <header className="mb-10">
                <h1 className="text-3xl font-bold text-zinc-900 tracking-tight mb-2">Applicants: {job.title}</h1>
                <p className="text-zinc-500">Review the workers who applied for this position and make your hiring decision.</p>
            </header>

            {(!applications || applications.length === 0) ? (
                <EmptyState
                    icon={<Ghost className="h-8 w-8" />}
                    title="No applicants yet"
                    description="Your job posting is live, but no one has applied yet. Give it some time."
                />
            ) : (
                <div className="grid gap-6">
                    {applications.map((app) => {
                        const workerData = app.worker_profiles;
                        const profileData = workerData?.profiles;

                        return (
                            <Card key={app.id} className="overflow-hidden border-zinc-200 shadow-sm transition-all hover:shadow-md">
                                <CardContent className="p-0">
                                    <div className="p-6 md:p-8 flex flex-col md:flex-row justify-between items-start gap-6">
                                        <div className="flex gap-4 md:gap-6">
                                            <div className="w-14 h-14 shrink-0 rounded-full bg-primary/10 flex items-center justify-center">
                                                <User className="w-6 h-6 text-primary" />
                                            </div>
                                            <div className="space-y-3">
                                                <div>
                                                    <h3 className="text-xl font-bold text-zinc-900 m-0 flex items-center flex-wrap gap-2">
                                                        {profileData?.full_name || 'Anonymous Worker'}
                                                        {profileData?.status === 'approved' && (
                                                            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 font-medium">
                                                                <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Verified Background
                                                            </Badge>
                                                        )}
                                                    </h3>
                                                </div>
                                                <div className="flex flex-wrap gap-x-4 gap-y-2 text-sm text-zinc-600 font-medium">
                                                    <span className="capitalize">{workerData?.role_type.replace('_', ' ')}</span>
                                                    <span className="text-zinc-300">•</span>
                                                    <span>{workerData?.years_experience}+ Yrs Exp</span>
                                                    <span className="text-zinc-300">•</span>
                                                    <span className="capitalize">{workerData?.availability.replace('_', ' ')} Schedule</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex flex-col items-start md:items-end gap-2 w-full md:w-auto">
                                            <Badge variant="outline" className={`
                                                px-3 py-1 font-semibold uppercase tracking-wider text-xs
                                                ${app.status === 'pending' ? 'bg-amber-50 text-amber-700 border-amber-200' : ''}
                                                ${app.status === 'hired' ? 'bg-green-50 text-green-700 border-green-200' : ''}
                                                ${app.status === 'rejected' ? 'bg-red-50 text-red-700 border-red-200' : ''}
                                            `}>
                                                {app.status === 'rejected' ? 'Passed' : app.status}
                                            </Badge>
                                            <span className="text-xs text-zinc-500 font-medium flex items-center">
                                                <Clock className="w-3.5 h-3.5 mr-1" />
                                                Applied {new Date(app.created_at).toLocaleDateString()}
                                            </span>
                                        </div>
                                    </div>

                                    {app.status === 'pending' && (
                                        <div className="border-t border-zinc-100 bg-zinc-50/50 p-4 md:px-8 flex flex-col sm:flex-row justify-end gap-3">
                                            <form action="/api/restaurant/application" method="POST" className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                                                <input type="hidden" name="applicationId" value={app.id} />
                                                <input type="hidden" name="jobId" value={jobId} />
                                                <Button type="submit" name="action" value="reject" variant="outline" className="text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700 w-full sm:w-auto">
                                                    <XCircle className="w-4 h-4 mr-2" /> Pass App
                                                </Button>
                                                <Button type="submit" name="action" value="hire" className="bg-green-600 hover:bg-green-700 text-white w-full sm:w-auto">
                                                    <CheckCircle2 className="w-4 h-4 mr-2" /> Hire Applicant
                                                </Button>
                                            </form>
                                        </div>
                                    )}

                                    {app.status === 'hired' && (
                                        <div className="border-t border-zinc-100 bg-primary/5 p-6 md:px-8">
                                            <h4 className="font-semibold text-primary flex items-center gap-2 mb-4">
                                                <CheckCircle2 className="w-5 h-5" /> Contact Information Unlocked
                                            </h4>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                <a href={`mailto:${profileData?.email}`} className="flex items-center gap-3 p-3 rounded-lg bg-white border border-zinc-200 hover:border-primary/30 transition-colors">
                                                    <Mail className="w-5 h-5 text-zinc-400" />
                                                    <span className="text-sm font-medium text-zinc-700">{profileData?.email}</span>
                                                </a>
                                                <a href={`tel:${profileData?.phone}`} className="flex items-center gap-3 p-3 rounded-lg bg-white border border-zinc-200 hover:border-primary/30 transition-colors">
                                                    <Phone className="w-5 h-5 text-zinc-400" />
                                                    <span className="text-sm font-medium text-zinc-700">{profileData?.phone || 'Not provided'}</span>
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
