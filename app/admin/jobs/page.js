import { adminDb } from "@/lib/firebase/admin";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Briefcase } from "lucide-react";
import JobActions from "./JobActions";

export default async function JobModerationPage() {
    const jobsSnap = await adminDb.collection("jobs").get();

    const jobs = await Promise.all(
        jobsSnap.docs.map(async (doc) => {
            const data = doc.data();

            // Get application count for each job
            const appsSnap = await adminDb.collection("applications")
                .where("job_id", "==", doc.id)
                .get();

            // Get restaurant name
            let restaurantName = "Unknown";
            if (data.restaurant_id) {
                const restSnap = await adminDb.collection("profiles").doc(data.restaurant_id).get();
                if (restSnap.exists) {
                    restaurantName = restSnap.data()?.full_name || "Unknown";
                }
            }

            return {
                id: doc.id,
                ...data,
                applicationCount: appsSnap.size,
                restaurantName,
            };
        })
    );

    // Sort by creation date, newest first
    jobs.sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0));

    return (
        <div>
            <header className="mb-6">
                <div className="flex items-center gap-3 mb-1">
                    <div className="w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center">
                        <Briefcase className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-zinc-900">Job Moderation</h1>
                        <p className="text-sm text-zinc-500">{jobs.length} total job postings</p>
                    </div>
                </div>
            </header>

            <JobActions initialJobs={JSON.parse(JSON.stringify(jobs))} />
        </div>
    );
}
