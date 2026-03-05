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

        const { userId, action } = await request.json();

        if (!userId || !["suspend", "unsuspend"].includes(action)) {
            return NextResponse.json({ error: "Invalid request" }, { status: 400 });
        }

        const newStatus = action === "suspend" ? "suspended" : "approved";

        await adminDb.collection("profiles").doc(userId).update({ status: newStatus });

        // Log the action
        await adminDb.collection("admin_logs").add({
            admin_id: decodedToken.uid,
            admin_email: adminProfile.email || decodedToken.email,
            action: action === "suspend" ? "user_suspended" : "user_unsuspended",
            target_id: userId,
            target_type: "user",
            timestamp: new Date().toISOString(),
        });

        return NextResponse.json({ success: true, status: newStatus });
    } catch (error) {
        console.error("Suspend API error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
