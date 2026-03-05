"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Search01Icon, Delete01Icon, ShutDownIcon, Location01Icon, Calendar03Icon, UserMultipleIcon } from "hugeicons-react";

export default function JobActions({ initialJobs }) {
    const [jobs, setJobs] = useState(initialJobs);
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [loading, setLoading] = useState(null);

    const filteredJobs = jobs.filter(j => {
        const matchesSearch =
            !search ||
            j.title?.toLowerCase().includes(search.toLowerCase()) ||
            j.restaurantName?.toLowerCase().includes(search.toLowerCase());
        const matchesStatus =
            statusFilter === "all" ||
            (statusFilter === "active" && j.is_active) ||
            (statusFilter === "inactive" && !j.is_active);
        return matchesSearch && matchesStatus;
    });

    const handleAction = async (jobId, action) => {
        const message = action === "delete"
            ? "Permanently delete this job? This cannot be undone."
            : "Deactivate this job listing?";
        if (!confirm(message)) return;

        setLoading(jobId);
        try {
            const res = await fetch("/api/admin/jobs/moderate", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ jobId, action }),
            });
            if (res.ok) {
                if (action === "delete") {
                    setJobs(prev => prev.filter(j => j.id !== jobId));
                } else {
                    setJobs(prev =>
                        prev.map(j => (j.id === jobId ? { ...j, is_active: false } : j))
                    );
                }
            }
        } catch (e) {
            alert("Action failed");
        }
        setLoading(null);
    };

    return (
        <div>
            {/* Filters */}
            <div className="flex flex-col md:flex-row gap-3 mb-6">
                <div className="relative flex-1">
                    <Search01Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                    <input
                        type="text"
                        placeholder="Search by job title or restaurant..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-zinc-200 bg-white text-sm focus:border-primary focus:ring-2 focus:ring-primary/10 outline-none transition-all"
                    />
                </div>
                <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="px-4 py-2.5 rounded-lg border border-zinc-200 bg-white text-sm outline-none"
                >
                    <option value="all">All Jobs</option>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                </select>
            </div>

            {/* Job List */}
            <Card className="shadow-sm border-zinc-200">
                <CardContent className="p-0">
                    {filteredJobs.length === 0 ? (
                        <div className="p-12 text-center text-zinc-500">No jobs found.</div>
                    ) : (
                        <div className="divide-y divide-zinc-100">
                            {filteredJobs.map((job) => (
                                <div key={job.id} className="px-5 py-4 hover:bg-zinc-50/50 transition-colors">
                                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                                        <div className="min-w-0 flex-1">
                                            <div className="flex items-center gap-2 mb-1">
                                                <p className="font-semibold text-zinc-900 truncate">{job.title || "Untitled Job"}</p>
                                                <Badge
                                                    variant="outline"
                                                    className={`text-xs shrink-0 ${job.is_active
                                                        ? "bg-green-50 text-green-700 border-green-200"
                                                        : "bg-zinc-100 text-zinc-500 border-zinc-200"
                                                        }`}
                                                >
                                                    {job.is_active ? "Active" : "Inactive"}
                                                </Badge>
                                            </div>
                                            <div className="flex items-center gap-4 text-xs text-zinc-500 flex-wrap">
                                                <span className="flex items-center gap-1">
                                                    <UserMultipleIcon className="w-3 h-3" />
                                                    {job.restaurantName}
                                                </span>
                                                {job.location && (
                                                    <span className="flex items-center gap-1">
                                                        <Location01Icon className="w-3 h-3" />
                                                        {job.location}
                                                    </span>
                                                )}
                                                {job.created_at && (
                                                    <span className="flex items-center gap-1">
                                                        <Calendar03Icon className="w-3 h-3" />
                                                        {new Date(job.created_at).toLocaleDateString()}
                                                    </span>
                                                )}
                                                <Badge variant="secondary" className="text-xs">
                                                    {job.applicationCount} application{job.applicationCount !== 1 ? "s" : ""}
                                                </Badge>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2 shrink-0 md:mt-0 mt-3">
                                            {job.is_active && (
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    className="h-8 text-xs text-amber-700 border-amber-200 hover:bg-amber-50"
                                                    onClick={() => handleAction(job.id, "deactivate")}
                                                    disabled={loading === job.id}
                                                >
                                                    <ShutDownIcon className="w-3.5 h-3.5 mr-1" />
                                                    Deactivate
                                                </Button>
                                            )}
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                className="h-8 text-xs text-red-700 border-red-200 hover:bg-red-50"
                                                onClick={() => handleAction(job.id, "delete")}
                                                disabled={loading === job.id}
                                            >
                                                <Delete01Icon className="w-3.5 h-3.5 mr-1" />
                                                Delete
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
