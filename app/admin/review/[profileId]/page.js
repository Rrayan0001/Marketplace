import Link from "next/link";
import { redirect } from "next/navigation";
import { adminDb } from "@/lib/firebase/admin";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import EmptyState from "@/components/ui/empty-state";
import { ArrowLeft, FileText, ScanSearch, UserRound, AlertTriangle, CheckCircle2, Clock3 } from "lucide-react";

function formatValue(value) {
  if (value === null || value === undefined || value === "") {
    return "N/A";
  }
  if (typeof value === "boolean") {
    return value ? "Yes" : "No";
  }
  return String(value);
}

function toLabel(text) {
  return text.replace(/_/g, " ").replace(/\b\w/g, (m) => m.toUpperCase());
}

function renderAiStatus(doc) {
  if (!doc) {
    return (
      <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
        Missing document
      </Badge>
    );
  }

  if (doc.ai_status === "passed") {
    return (
      <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
        Passed
      </Badge>
    );
  }

  if (doc.ai_status === "flagged") {
    return (
      <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
        Flagged
      </Badge>
    );
  }

  return (
    <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
      Processing
    </Badge>
  );
}

export default async function ReviewProfilePage({ params }) {
  const resolvedParams = await params;
  const profileId = resolvedParams.profileId;

  const profileSnap = await adminDb.collection("profiles").doc(profileId).get();
  const profile = profileSnap.exists ? { id: profileSnap.id, ...profileSnap.data() } : null;

  if (!profile || profile.status !== "pending") {
    redirect("/admin");
  }

  let roleData = null;
  const roleCollection =
    profile.role === "restaurant" ? "restaurant_profiles" :
      profile.role === "worker" ? "worker_profiles" :
        profile.role === "vendor" ? "vendor_profiles" : null;

  if (roleCollection) {
    const roleSnap = await adminDb.collection(roleCollection)
      .where("profile_id", "==", profileId)
      .limit(1)
      .get();

    if (!roleSnap.empty) {
      roleData = roleSnap.docs[0].data();
    }
  }

  const docsSnap = await adminDb.collection("documents")
    .where("profile_id", "==", profileId)
    .get();

  const documents = docsSnap.docs
    .map(d => ({ id: d.id, ...d.data() }))
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

  const doc = documents?.[0] || null;

  const roleEntries = roleData
    ? Object.entries(roleData).filter(
      ([key]) =>
        ![
          "id",
          "profile_id",
          "created_at",
          "updated_at",
          "food_license_url",
          "aadhaar_url",
          "gst_certificate_url",
          "ai_verification_data",
        ].includes(key)
    )
    : [];

  return (
    <div className="container max-w-7xl mx-auto py-10 px-4">
      <div className="mb-6">
        <Button asChild variant="ghost" className="pl-0 text-zinc-600 hover:text-zinc-900">
          <Link href="/admin">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Queue
          </Link>
        </Button>
      </div>

      <header className="mb-8 rounded-2xl border border-zinc-200 bg-gradient-to-r from-orange-50 via-white to-green-50 p-6 md:p-8">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-orange-200 bg-orange-50 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-orange-700">
              <ScanSearch className="h-3.5 w-3.5" />
              Manual Review
            </div>
            <h1 className="mt-3 text-3xl font-bold tracking-tight text-zinc-900">
              Review Profile Submission
            </h1>
            <p className="mt-2 text-zinc-600">
              Validate user details, inspect AI extraction, and approve or reject the profile.
            </p>
          </div>
          <Badge variant="secondary" className="capitalize">
            {profile.role}
          </Badge>
        </div>
      </header>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <div className="space-y-6">
          <Card className="border-zinc-200 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-zinc-900">
                <UserRound className="w-5 h-5 text-zinc-500" />
                User Details
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <p className="text-xs uppercase tracking-wider font-semibold text-zinc-500 mb-1">Full Name</p>
                <p className="font-medium text-zinc-900">{formatValue(profile.full_name)}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wider font-semibold text-zinc-500 mb-1">Email</p>
                <p className="font-medium text-zinc-900 break-all">{formatValue(profile.email)}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wider font-semibold text-zinc-500 mb-1">Phone</p>
                <p className="font-medium text-zinc-900">{formatValue(profile.phone)}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wider font-semibold text-zinc-500 mb-1">Current Status</p>
                <Badge variant="outline" className="capitalize bg-amber-50 text-amber-700 border-amber-200">
                  {profile.status}
                </Badge>
              </div>
            </CardContent>
          </Card>

          {roleEntries.length > 0 && (
            <Card className="border-zinc-200 shadow-sm">
              <CardHeader>
                <CardTitle className="capitalize">{profile.role} Details</CardTitle>
                <CardDescription>Role-specific fields submitted by the user.</CardDescription>
              </CardHeader>
              <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {roleEntries.map(([key, value]) => (
                  <div key={key}>
                    <p className="text-xs uppercase tracking-wider font-semibold text-zinc-500 mb-1">{toLabel(key)}</p>
                    <p className="font-medium text-zinc-900">{formatValue(value)}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          <Card className="border-zinc-200 shadow-sm">
            <CardHeader>
              <CardTitle>Action Panel</CardTitle>
              <CardDescription>Admin notes are required when rejecting a profile.</CardDescription>
            </CardHeader>
            <CardContent>
              <form action="/api/admin/review" method="POST" className="space-y-4">
                <input type="hidden" name="profileId" value={profileId} />
                <div className="space-y-2">
                  <label htmlFor="admin-notes" className="text-sm font-medium text-zinc-700">
                    Admin Notes
                  </label>
                  <textarea
                    id="admin-notes"
                    name="adminNotes"
                    rows="4"
                    placeholder="Add context for your decision. Required for rejection."
                    className="w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
                  />
                </div>
                <div className="flex flex-col sm:flex-row gap-3">
                  <Button type="submit" name="action" value="approve" className="bg-green-600 hover:bg-green-700 flex-1">
                    <CheckCircle2 className="w-4 h-4 mr-2" />
                    Approve
                  </Button>
                  <Button type="submit" name="action" value="reject" variant="outline" className="text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700 flex-1">
                    <AlertTriangle className="w-4 h-4 mr-2" />
                    Reject
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          {doc ? (
            <>
              <Card className="border-zinc-200 shadow-sm">
                <CardHeader>
                  <div className="flex items-start justify-between gap-3 flex-wrap">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <FileText className="w-5 h-5 text-zinc-500" />
                        Uploaded Document
                      </CardTitle>
                      <CardDescription className="capitalize mt-1">
                        {doc.document_type?.replace("_", " ")}
                      </CardDescription>
                    </div>
                    {renderAiStatus(doc)}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {doc.file_url ? (
                    <div className="rounded-xl border border-zinc-200 bg-zinc-50 overflow-hidden">
                      {doc.file_url.toLowerCase().split('?')[0].endsWith('.pdf') || doc.file_url.toLowerCase().includes('%2fpdf') || doc.file_url.toLowerCase().includes('.pdf') ? (
                        <iframe
                          src={doc.file_url}
                          title="Verification document PDF preview"
                          className="w-full h-[600px] border-0"
                        />
                      ) : (
                        <img
                          src={doc.file_url}
                          alt="Verification document preview"
                          className="w-full h-[320px] object-contain"
                        />
                      )}
                    </div>
                  ) : (
                    <EmptyState
                      icon={<FileText className="h-8 w-8" />}
                      title="No file URL found"
                      description="The document metadata exists, but a file URL is missing for preview."
                    />
                  )}

                  <div className="text-sm text-zinc-600">
                    <span className="font-medium text-zinc-700">AI confidence:</span>{" "}
                    {doc.ai_confidence_score ? `${Math.round(doc.ai_confidence_score * 100)}%` : "N/A"}
                  </div>
                </CardContent>
              </Card>

              <Card className="border-zinc-800 bg-zinc-950 text-zinc-100 shadow-sm">
                <CardHeader>
                  <CardTitle className="text-orange-300">Groq Vision AI Output</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {doc.ai_extracted_data ? (
                    <pre className="rounded-lg bg-zinc-900 border border-zinc-800 p-4 text-xs leading-6 overflow-x-auto">
                      {JSON.stringify(doc.ai_extracted_data, null, 2)}
                    </pre>
                  ) : (
                    <div className="rounded-lg border border-zinc-800 bg-zinc-900 px-4 py-3 text-zinc-400 text-sm flex items-center gap-2">
                      <Clock3 className="w-4 h-4" />
                      {doc.ai_status === "processing" ? "Waiting for AI processing..." : "No AI data available."}
                    </div>
                  )}

                  {doc.ai_flags && doc.ai_flags.length > 0 ? (
                    <div className="rounded-lg border border-red-700/40 bg-red-950/40 p-4">
                      <p className="font-semibold text-red-200 mb-2">Flags</p>
                      <ul className="list-disc list-inside text-sm text-red-100 space-y-1">
                        {doc.ai_flags.map((flag, idx) => (
                          <li key={idx}>{flag}</li>
                        ))}
                      </ul>
                    </div>
                  ) : null}
                </CardContent>
              </Card>
            </>
          ) : (
            <EmptyState
              icon={<FileText className="h-8 w-8" />}
              title="No document uploaded"
              description="This profile doesn&apos;t have any attached verification documents yet."
            />
          )}
        </div>
      </div>
    </div>
  );
}
