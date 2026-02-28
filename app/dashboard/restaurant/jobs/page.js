import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import EmptyState from "@/components/ui/empty-state";
import { ArrowLeft, Plus, FileText, Calendar, Clock, Users } from "lucide-react";

export default async function RestaurantJobsPage() {
    const supabase = await createClient();

    // 1. Get current user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) redirect('/login');

    // 2. Get restaurant profile
    const { data: restaurant } = await supabase
        .from('restaurant_profiles')
        .select('id')
        .eq('profile_id', user.id)
        .single();

    if (!restaurant) redirect('/dashboard');

    // 3. Fetch jobs posted by this restaurant, including applications count
    const { data: jobs, error } = await supabase
        .from('jobs')
        .select(`
      id,
      title,
      role_type,
      job_type,
      shift,
      is_active,
      created_at,
      applications ( count )
    `)
        .eq('restaurant_id', restaurant.id)
        .order('created_at', { ascending: false });

    if (error) {
        console.error("Error fetching jobs:", error);
    }

    return (
        <div className="container max-w-5xl mx-auto py-12 px-4">
            <div className="mb-6">
                <Link href="/dashboard" className="inline-flex items-center text-zinc-500 hover:text-zinc-900 transition-colors font-medium text-sm">
                    <ArrowLeft className="w-4 h-4 mr-2" /> Back to Dashboard
                </Link>
            </div>

            <header className="mb-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-zinc-900 tracking-tight mb-2">Manage Jobs</h1>
                    <p className="text-zinc-500">Review your active postings and manage applicants.</p>
                </div>
                <Link href="/dashboard/restaurant/post-job">
                    <Button className="shadow-sm">
                        <Plus className="w-4 h-4 mr-2" /> Post New Job
                    </Button>
                </Link>
            </header>

            {(!jobs || jobs.length === 0) ? (
                <EmptyState
                    icon={<FileText className="h-8 w-8" />}
                    title="No jobs posted yet"
                    description="Create your first listing to start hiring verified workers."
                    actionHref="/dashboard/restaurant/post-job"
                    actionLabel="Create Job Post"
                />
            ) : (
                <div className="grid gap-4">
                    {jobs.map((job) => (
                        <Card key={job.id} className="transition-all hover:shadow-md border-zinc-200">
                            <CardContent className="p-6 md:p-8 flex flex-col md:flex-row gap-6 justify-between items-start md:items-center">
                                <div className="space-y-4 flex-1">
                                    <div>
                                        <div className="flex items-center gap-3 mb-2">
                                            <h3 className="text-xl font-bold text-zinc-900 m-0">{job.title}</h3>
                                            <Badge variant={job.is_active ? "default" : "secondary"} className={job.is_active ? "bg-primary/10 text-primary hover:bg-primary/20" : ""}>
                                                {job.is_active ? 'Active' : 'Closed'}
                                            </Badge>
                                        </div>
                                        <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-zinc-500 font-medium">
                                            <span className="flex items-center gap-1.5 capitalize">
                                                <BriefcaseIcon className="w-4 h-4 text-zinc-400" />
                                                {job.role_type.replace('_', ' ')}
                                            </span>
                                            <span className="flex items-center gap-1.5 capitalize">
                                                <Clock className="w-4 h-4 text-zinc-400" />
                                                {job.job_type.replace('_', ' ')} • {job.shift.replace('_', ' ')}
                                            </span>
                                            <span className="flex items-center gap-1.5">
                                                <Calendar className="w-4 h-4 text-zinc-400" />
                                                Posted {new Date(job.created_at).toLocaleDateString()}
                                            </span>
                                        </div>
                                    </div>
                                    <div>
                                        <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 text-sm font-semibold px-3 py-1">
                                            <Users className="w-4 h-4 mr-1.5" />
                                            {job.applications[0]?.count || 0} Applicants
                                        </Badge>
                                    </div>
                                </div>
                                <div className="w-full md:w-auto mt-4 md:mt-0">
                                    {job.applications[0]?.count > 0 ? (
                                        <Link href={`/dashboard/restaurant/jobs/${job.id}`}>
                                            <Button className="w-full md:w-auto h-11 px-6 shadow-sm">
                                                View Applicants
                                            </Button>
                                        </Link>
                                    ) : (
                                        <Button variant="outline" disabled className="w-full md:w-auto h-11 px-6">
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

function BriefcaseIcon(props) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M16 20V4a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
      <rect width="20" height="14" x="2" y="6" rx="2" />
    </svg>
  )
}
