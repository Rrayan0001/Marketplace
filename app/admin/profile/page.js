import { cookies } from "next/headers";
import { adminAuth, adminDb } from "@/lib/firebase/admin";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { User, Mail, Shield, Calendar } from "lucide-react";

export default async function AdminProfilePage() {
    const cookieStore = await cookies();
    const session = cookieStore.get("session")?.value;

    if (!session) {
        redirect("/login");
    }

    let decodedToken;
    try {
        decodedToken = await adminAuth.verifySessionCookie(session, true);
    } catch (error) {
        redirect("/login");
    }

    const uid = decodedToken.uid;
    const profileSnap = await adminDb.collection("profiles").doc(uid).get();

    if (!profileSnap.exists) {
        redirect("/dashboard");
    }

    const profile = profileSnap.data();

    return (
        <div className="container max-w-4xl mx-auto py-12 px-4">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-zinc-900">My Admin Profile</h1>
                <p className="text-zinc-500 mt-2">Manage your administrative account details.</p>
            </div>

            <div className="grid gap-6">
                <Card className="border-zinc-200 shadow-sm overflow-hidden">
                    <div className="h-2 w-full bg-gradient-to-r from-orange-400 to-green-400" />
                    <CardHeader className="pb-4">
                        <div className="flex items-center gap-4">
                            <div className="w-16 h-16 bg-zinc-100 rounded-full flex items-center justify-center border border-zinc-200 shadow-inner">
                                <User className="w-8 h-8 text-zinc-400" />
                            </div>
                            <div>
                                <CardTitle className="text-2xl">{profile.full_name || "Admin User"}</CardTitle>
                                <Badge variant="outline" className="mt-1 bg-zinc-50 text-zinc-700 capitalize">
                                    {profile.role}
                                </Badge>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="grid gap-6 pt-4">
                        <div className="grid sm:grid-cols-2 gap-6">
                            <div className="space-y-1">
                                <div className="flex items-center text-sm font-medium text-zinc-500 gap-2">
                                    <Mail className="w-4 h-4" />
                                    Email Address
                                </div>
                                <p className="text-zinc-900 font-medium pl-6">{profile.email}</p>
                            </div>
                            <div className="space-y-1">
                                <div className="flex items-center text-sm font-medium text-zinc-500 gap-2">
                                    <Shield className="w-4 h-4" />
                                    Account Status
                                </div>
                                <div className="pl-6">
                                    <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 capitalize">
                                        {profile.status || "Active"}
                                    </Badge>
                                </div>
                            </div>
                            <div className="space-y-1">
                                <div className="flex items-center text-sm font-medium text-zinc-500 gap-2">
                                    <Calendar className="w-4 h-4" />
                                    Member Since
                                </div>
                                <p className="text-zinc-900 font-medium pl-6">
                                    {profile.created_at ? new Date(profile.created_at).toLocaleDateString() : "N/A"}
                                </p>
                            </div>
                        </div>

                        <div className="pt-6 border-t border-zinc-100">
                            <h3 className="text-sm font-semibold text-zinc-900 uppercase tracking-wider mb-4">Permissions</h3>
                            <div className="flex flex-wrap gap-2">
                                <Badge variant="secondary">User Verification</Badge>
                                <Badge variant="secondary">Platform Management</Badge>
                                <Badge variant="secondary">AI Oversight</Badge>
                                <Badge variant="secondary">System Configuration</Badge>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-zinc-200 bg-zinc-50/50">
                    <CardHeader>
                        <CardTitle className="text-sm font-semibold text-zinc-900 uppercase tracking-wider">Account Security</CardTitle>
                        <CardDescription>Administrative access is protected by session verification.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-zinc-600">
                            Your current session is verified by the platform security layer. To update your password or authentication methods, please use the standard account recovery flow.
                        </p>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
