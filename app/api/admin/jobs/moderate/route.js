import { NextResponse } from "next/server";
import { adminAuth, adminDb } from "@/lib/firebase/admin";
import { cookies } from "next/headers";

export async function POST(request) {
    try {
        const cookieStore = await cookies();
        const session = cookieStore.get("session")?.value;

        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const decodedToken = await adminAuth.verifySessionCookie(session, true);
        const adminProfileSnap = await adminDb.collection("profiles").doc(decodedToken.uid).get();
        const adminProfile = adminProfileSnap.data();

        if (adminProfile?.role !== "admin") {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        const { jobId, action } = await request.json();

        if (!jobId || !["deactivate", "delete"].includes(action)) {
            return NextResponse.json({ error: "Invalid request" }, { status: 400 });
        }

        if (action === "deactivate") {
            await adminDb.collection("jobs").doc(jobId).update({ is_active: false });
        } else if (action === "delete") {
            await adminDb.collection("jobs").doc(jobId).delete();
        }

        // Log the action
        await adminDb.collection("admin_logs").add({
            admin_id: decodedToken.uid,
            admin_email: adminProfile.email || decodedToken.email,
            action: action === "deactivate" ? "job_deactivated" : "job_deleted",
            target_id: jobId,
            target_type: "job",
            timestamp: new Date().toISOString(),
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Job moderation API error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
