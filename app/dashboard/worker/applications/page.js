import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, FileText, Building2, Calendar, Clock, CheckCircle2, XCircle, Search } from "lucide-react";

export default async function WorkerApplicationsPage() {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) redirect('/login');

    const { data: worker } = await supabase
        .from('worker_profiles')
        .select('id')
        .eq('profile_id', user.id)
        .single();

    if (!worker) redirect('/dashboard');

    // Fetch applications with joined job and restaurant data
    const { data: applications, error } = await supabase
        .from('applications')
        .select(`
      id,
      status,
      created_at,
      jobs (
        title,
        salary_min,
        salary_max,
        restaurant_profiles (
          restaurant_name
        )
      )
    `)
        .eq('worker_id', worker.id)
        .order('created_at', { ascending: false });

    if (error) {
        console.error("Error fetching applications:", error);
    }

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
                <Card className="border-dashed border-2 border-zinc-200">
                    <CardContent className="flex flex-col items-center justify-center p-16 text-center">
                        <div className="w-16 h-16 bg-zinc-100 rounded-full flex items-center justify-center mb-6">
                            <FileText className="w-8 h-8 text-zinc-400" />
                        </div>
                        <h3 className="text-xl font-bold text-zinc-900 mb-2">No Applications Yet</h3>
                        <p className="text-zinc-500 max-w-sm mb-6">You haven't applied to any jobs yet. Browse open listings to get started!</p>
                        <Link href="/dashboard/worker/jobs">
                            <Button className="shadow-sm">Browse Open Jobs</Button>
                        </Link>
                    </CardContent>
                </Card>
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
