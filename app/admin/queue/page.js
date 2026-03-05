import Link from "next/link";
import { adminDb } from "@/lib/firebase/admin";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import EmptyState from "@/components/ui/empty-state";
import { ClipboardIcon, Clock01Icon, Shield02Icon, Alert02Icon, Loading01Icon } from "hugeicons-react";

function getAiBadge(doc) {
    if (!doc) {
        return (
            <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
                No document
            </Badge>
        );
    }

    if (doc.ai_status === "passed") {
        return (
            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                AI Verified {doc.ai_confidence_score ? `(${Math.round(doc.ai_confidence_score * 100)}%)` : ""}
            </Badge>
        );
    }

    if (doc.ai_status === "flagged") {
        return (
            <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                AI Flagged
            </Badge>
        );
    }

    return (
        <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
            Processing
        </Badge>
    );
}

export default async function ApprovalQueuePage() {
    // Fetch pending profiles from Firestore (sort in-memory to avoid index requirement)
    const profilesSnap = await adminDb.collection("profiles")
        .where("status", "==", "pending")
        .get();

    const pendingProfiles = await Promise.all(profilesSnap.docs.map(async (doc) => {
        const data = doc.data();

        // Fetch latest document for this profile
        const docsSnap = await adminDb.collection("documents")
            .where("profile_id", "==", doc.id)
            .get();

        // Sort in memory to avoid index error
        const documents = docsSnap.docs
            .map(d => ({ id: d.id, ...d.data() }))
            .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

        return {
            id: doc.id,
            ...data,
            documents
        };
    }));

    // Sort profiles by creation date (oldest first for the queue)
    pendingProfiles.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));

    const pendingCount = pendingProfiles?.length || 0;

    return (
        <div>
            <header className="mb-8">
                <div className="rounded-2xl border border-zinc-200 bg-gradient-to-r from-orange-50 via-white to-green-50 p-6 md:p-8">
                    <div className="flex items-start justify-between gap-4 flex-wrap">
                        <div>
                            <div className="inline-flex items-center gap-2 rounded-full border border-orange-200 bg-orange-50 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-orange-700">
                                <ClipboardIcon className="h-3.5 w-3.5" />
                                Admin Queue
                            </div>
                            <h1 className="mt-3 text-3xl font-bold tracking-tight text-zinc-900">Approval Queue</h1>
                            <p className="mt-2 text-zinc-600">
                                Review new profiles and finalize onboarding approvals.
                            </p>
                        </div>
                        <Badge variant="outline" className="h-8 px-3 bg-white border-zinc-200 text-zinc-700">
                            {pendingCount} pending
                        </Badge>
                    </div>
                </div>
            </header>

            {pendingCount === 0 ? (
                <EmptyState
                    icon={<Shield02Icon className="h-8 w-8" />}
                    title="All caught up"
                    description="There are no pending profiles to review at the moment."
                />
            ) : (
                <div className="grid gap-4">
                    {pendingProfiles?.map((profile) => {
                        const latestDoc = profile.documents?.[0];
                        return (
                            <Card key={profile.id} className="border-zinc-200 shadow-sm hover:shadow-md transition-shadow">
                                <CardHeader className="pb-3">
                                    <div className="flex items-start justify-between gap-4 flex-wrap">
                                        <div>
                                            <CardTitle className="text-xl text-zinc-900">
                                                {profile.full_name || "Anonymous User"}
                                            </CardTitle>
                                            <CardDescription className="mt-1 text-zinc-600">
                                                {profile.email} • Applied on {new Date(profile.created_at).toLocaleDateString()}
                                            </CardDescription>
                                        </div>
                                        <Badge variant="secondary" className="capitalize">
                                            {profile.role}
                                        </Badge>
                                    </div>
                                </CardHeader>
                                <CardContent className="pt-0 flex items-center justify-between gap-4 flex-wrap">
                                    <div className="flex items-center gap-2 text-sm text-zinc-600">
                                        {latestDoc ? (
                                            <Clock01Icon className="w-4 h-4 text-zinc-400" />
                                        ) : (
                                            <Alert02Icon className="w-4 h-4 text-amber-500" />
                                        )}
                                        <span className="capitalize">
                                            {latestDoc?.document_type?.replace("_", " ") || "No document uploaded"}
                                        </span>
                                        {getAiBadge(latestDoc)}
                                    </div>
                                    <Button asChild>
                                        <Link href={`/admin/review/${profile.id}`}>
                                            <Loading01Icon className="w-4 h-4 mr-2 animate-spin" />
                                            Review Profile
                                        </Link>
                                    </Button>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
