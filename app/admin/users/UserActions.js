"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Search01Icon, Cancel01Icon, Tick02Icon, ViewIcon } from "hugeicons-react";

export default function UserActions({ initialUsers }) {
    const [users, setUsers] = useState(initialUsers);
    const [search, setSearch] = useState("");
    const [roleFilter, setRoleFilter] = useState("all");
    const [statusFilter, setStatusFilter] = useState("all");
    const [loading, setLoading] = useState(null);

    const filteredUsers = users.filter(u => {
        const matchesSearch =
            !search ||
            u.full_name?.toLowerCase().includes(search.toLowerCase()) ||
            u.email?.toLowerCase().includes(search.toLowerCase());
        const matchesRole = roleFilter === "all" || u.role === roleFilter;
        const matchesStatus = statusFilter === "all" || u.status === statusFilter;
        return matchesSearch && matchesRole && matchesStatus;
    });

    const handleSuspend = async (userId) => {
        if (!confirm("Are you sure you want to suspend this user?")) return;
        setLoading(userId);
        try {
            const res = await fetch("/api/admin/users/suspend", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ userId, action: "suspend" }),
            });
            if (res.ok) {
                setUsers(prev =>
                    prev.map(u => (u.id === userId ? { ...u, status: "suspended" } : u))
                );
            }
        } catch (e) {
            alert("Failed to suspend user");
        }
        setLoading(null);
    };

    const handleUnsuspend = async (userId) => {
        setLoading(userId);
        try {
            const res = await fetch("/api/admin/users/suspend", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ userId, action: "unsuspend" }),
            });
            if (res.ok) {
                setUsers(prev =>
                    prev.map(u => (u.id === userId ? { ...u, status: "approved" } : u))
                );
            }
        } catch (e) {
            alert("Failed to unsuspend user");
        }
        setLoading(null);
    };

    const statusBadge = (status) => {
        const map = {
            approved: "bg-green-50 text-green-700 border-green-200",
            pending: "bg-amber-50 text-amber-700 border-amber-200",
            rejected: "bg-red-50 text-red-700 border-red-200",
            suspended: "bg-zinc-100 text-zinc-600 border-zinc-300",
            blocked: "bg-red-100 text-red-800 border-red-300",
        };
        return map[status] || "bg-zinc-50 text-zinc-600 border-zinc-200";
    };

    return (
        <div>
            {/* Filters */}
            <div className="flex flex-col md:flex-row gap-3 mb-6">
                <div className="relative flex-1">
                    <Search01Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                    <input
                        type="text"
                        placeholder="Search by name or email..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-zinc-200 bg-white text-sm focus:border-primary focus:ring-2 focus:ring-primary/10 outline-none transition-all"
                    />
                </div>
                <select
                    value={roleFilter}
                    onChange={(e) => setRoleFilter(e.target.value)}
                    className="px-4 py-2.5 rounded-lg border border-zinc-200 bg-white text-sm outline-none"
                >
                    <option value="all">All Roles</option>
                    <option value="worker">Workers</option>
                    <option value="restaurant">Restaurants</option>
                    <option value="vendor">Vendors</option>
                </select>
                <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="px-4 py-2.5 rounded-lg border border-zinc-200 bg-white text-sm outline-none"
                >
                    <option value="all">All Status</option>
                    <option value="approved">Approved</option>
                    <option value="pending">Pending</option>
                    <option value="suspended">Suspended</option>
                    <option value="rejected">Rejected</option>
                </select>
            </div>

            {/* User List */}
            <Card className="shadow-sm border-zinc-200">
                <CardContent className="p-0">
                    {filteredUsers.length === 0 ? (
                        <div className="p-12 text-center text-zinc-500">No users found matching your criteria.</div>
                    ) : (
                        <div className="divide-y divide-zinc-100">
                            {filteredUsers.map((user) => (
                                <div key={user.id} className="flex flex-col md:flex-row md:items-center justify-between gap-4 px-5 py-4 hover:bg-zinc-50/50 transition-colors">
                                    <div className="flex items-center gap-3 min-w-0">
                                        <div className="w-10 h-10 rounded-full bg-zinc-100 flex items-center justify-center text-sm font-semibold text-zinc-600 shrink-0">
                                            {user.full_name ? user.full_name.charAt(0).toUpperCase() : "?"}
                                        </div>
                                        <div className="min-w-0">
                                            <p className="font-medium text-zinc-900 truncate">{user.full_name || "Unknown"}</p>
                                            <p className="text-xs text-zinc-500 truncate">{user.email}</p>
                                        </div>
                                    </div>
                                    <div className="flex flex-wrap items-center gap-2 shrink-0">
                                        <Badge variant="secondary" className="capitalize text-xs">{user.role}</Badge>
                                        <Badge variant="outline" className={`text-xs capitalize ${statusBadge(user.status)}`}>
                                            {user.status}
                                        </Badge>
                                        {user.status === "suspended" ? (
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                className="h-8 text-xs text-green-700 border-green-200 hover:bg-green-50"
                                                onClick={() => handleUnsuspend(user.id)}
                                                disabled={loading === user.id}
                                            >
                                                <Tick02Icon className="w-3.5 h-3.5 mr-1" />
                                                Unsuspend
                                            </Button>
                                        ) : user.status === "approved" ? (
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                className="h-8 text-xs text-red-700 border-red-200 hover:bg-red-50"
                                                onClick={() => handleSuspend(user.id)}
                                                disabled={loading === user.id}
                                            >
                                                <Cancel01Icon className="w-3.5 h-3.5 mr-1" />
                                                Suspend
                                            </Button>
                                        ) : null}
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
