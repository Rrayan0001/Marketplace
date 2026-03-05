import { adminDb } from "@/lib/firebase/admin";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollIcon } from "hugeicons-react";

const actionLabels = {
    user_suspended: { label: "Suspended User", color: "bg-red-50 text-red-700 border-red-200" },
    user_unsuspended: { label: "Unsuspended User", color: "bg-green-50 text-green-700 border-green-200" },
    job_deactivated: { label: "Deactivated Job", color: "bg-amber-50 text-amber-700 border-amber-200" },
    job_deleted: { label: "Deleted Job", color: "bg-red-50 text-red-700 border-red-200" },
    profile_approved: { label: "Approved Profile", color: "bg-green-50 text-green-700 border-green-200" },
    profile_rejected: { label: "Rejected Profile", color: "bg-red-50 text-red-700 border-red-200" },
};

export default async function AuditLogsPage() {
    const logsSnap = await adminDb.collection("admin_logs").get();

    const logs = logsSnap.docs
        .map(doc => ({ id: doc.id, ...doc.data() }))
        .sort((a, b) => new Date(b.timestamp || 0) - new Date(a.timestamp || 0));

    return (
        <div>
            <header className="mb-6">
                <div className="flex items-center gap-3 mb-1">
                    <div className="w-10 h-10 rounded-lg bg-zinc-100 flex items-center justify-center">
                        <ScrollIcon className="w-5 h-5 text-zinc-600" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-zinc-900">Audit Logs</h1>
                        <p className="text-sm text-zinc-500">{logs.length} logged actions</p>
                    </div>
                </div>
            </header>

            <Card className="shadow-sm border-zinc-200">
                <CardContent className="p-0">
                    {logs.length === 0 ? (
                        <div className="p-12 text-center">
                            <div className="mx-auto w-12 h-12 rounded-full bg-zinc-100 flex items-center justify-center mb-4">
                                <ScrollIcon className="w-6 h-6 text-zinc-400" />
                            </div>
                            <p className="text-zinc-500 font-medium">No admin actions logged yet.</p>
                            <p className="text-sm text-zinc-400 mt-1">Actions like suspending users or deleting jobs will appear here.</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-zinc-100">
                            {logs.map((log) => {
                                const info = actionLabels[log.action] || { label: log.action, color: "bg-zinc-50 text-zinc-600 border-zinc-200" };
                                return (
                                    <div key={log.id} className="flex flex-col md:flex-row md:items-center justify-between gap-2 md:gap-4 px-5 py-4 hover:bg-zinc-50/50 transition-colors">
                                        <div className="flex items-center gap-3 min-w-0">
                                            <Badge variant="outline" className={`text-xs shrink-0 ${info.color}`}>
                                                {info.label}
                                            </Badge>
                                            <div className="min-w-0">
                                                <p className="text-sm text-zinc-900 truncate">
                                                    <span className="font-medium">{log.admin_email}</span>
                                                    <span className="text-zinc-400 mx-1">→</span>
                                                    <span className="text-zinc-500 font-mono text-xs">{log.target_type}:{log.target_id?.slice(0, 8)}...</span>
                                                </p>
                                            </div>
                                        </div>
                                        <span className="text-xs text-zinc-400 shrink-0 md:text-right mt-1 md:mt-0">
                                            {log.timestamp ? new Date(log.timestamp).toLocaleString() : "—"}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
