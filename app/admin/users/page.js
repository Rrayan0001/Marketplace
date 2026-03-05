import { adminDb } from "@/lib/firebase/admin";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users } from "lucide-react";
import UserActions from "./UserActions";

export default async function UsersDirectoryPage() {
    const profilesSnap = await adminDb.collection("profiles").get();

    const profiles = profilesSnap.docs
        .map(doc => ({ id: doc.id, ...doc.data() }))
        .filter(p => p.role !== "admin")
        .sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0));

    return (
        <div>
            <header className="mb-6">
                <div className="flex items-center gap-3 mb-1">
                    <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
                        <Users className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-zinc-900">User Directory</h1>
                        <p className="text-sm text-zinc-500">{profiles.length} total users</p>
                    </div>
                </div>
            </header>

            <UserActions initialUsers={JSON.parse(JSON.stringify(profiles))} />
        </div>
    );
}
