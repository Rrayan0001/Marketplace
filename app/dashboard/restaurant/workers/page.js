import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import EmptyState from "@/components/ui/empty-state";
import { ArrowLeft, User, CheckCircle2, MessageSquare, ChefHat } from "lucide-react";

export default async function WorkerDirectoryPage() {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) redirect('/login');

    const { data: restaurant } = await supabase
        .from('restaurant_profiles')
        .select('id')
        .eq('profile_id', user.id)
        .single();

    if (!restaurant) redirect('/dashboard');

    // Fetch workers whose profiles are approved AND they are actively available
    const { data: workers, error } = await supabase
        .from('worker_profiles')
        .select(`
      id,
      role_type,
      years_experience,
      availability,
      is_actively_available,
      profiles!inner (
        full_name,
        status,
        created_at
      )
    `)
        .eq('is_actively_available', true)
        .eq('profiles.status', 'approved')
        .order('profiles(created_at)', { ascending: false });

    if (error) {
        console.error("Error fetching worker directory:", error);
    }

    return (
        <div className="container max-w-6xl mx-auto py-12 px-4">
            <div className="mb-6">
                <Link href="/dashboard" className="inline-flex items-center text-zinc-500 hover:text-zinc-900 transition-colors font-medium text-sm">
                    <ArrowLeft className="w-4 h-4 mr-2" /> Back to Dashboard
                </Link>
            </div>

            <header className="mb-10">
                <h1 className="text-3xl font-bold text-zinc-900 tracking-tight mb-2">Active Worker Directory</h1>
                <p className="text-zinc-500">Browse verified, active workers in your area ready to be hired today.</p>
            </header>

            {(!workers || workers.length === 0) ? (
                <EmptyState
                    icon={<ChefHat className="h-8 w-8" />}
                    title="No workers available right now"
                    description="Workers in your area might be fully booked. Check back soon."
                />
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {workers.map((workerObj) => (
                        <Card key={workerObj.id} className="flex flex-col overflow-hidden border-zinc-200 shadow-sm transition-all hover:shadow-md">
                            <CardContent className="p-6 flex-1 flex flex-col">
                                <div className="flex items-start gap-4 mb-5">
                                    <div className="w-12 h-12 shrink-0 rounded-full bg-primary/10 flex items-center justify-center">
                                        <User className="w-5 h-5 text-primary" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold text-zinc-900 m-0 mb-1 line-clamp-1">{workerObj.profiles?.full_name || 'Anonymous'}</h3>
                                        <div className="flex items-center text-green-600 text-xs font-semibold">
                                            <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Verified Background
                                        </div>
                                    </div>
                                </div>

                                <div className="flex flex-wrap gap-2 mb-6">
                                    <Badge variant="secondary" className="bg-primary/10 text-primary hover:bg-primary/20 capitalize font-semibold shadow-sm">
                                        {workerObj.role_type.replace('_', ' ')}
                                    </Badge>
                                    <Badge variant="outline" className="bg-zinc-50 text-zinc-600 border-zinc-200 font-medium">
                                        {workerObj.years_experience}+ Yrs Exp
                                    </Badge>
                                    <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 capitalize font-medium">
                                        {workerObj.availability.replace('_', ' ')}
                                    </Badge>
                                </div>

                                <div className="mt-auto pt-6 border-t border-zinc-100">
                                    {/* Normally we'd pass a specific worker ID into a messaging modal or custom invite flow */}
                                    <Button variant="outline" className="w-full h-10 shadow-sm">
                                        <MessageSquare className="w-4 h-4 mr-2" /> Message / Invite
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
