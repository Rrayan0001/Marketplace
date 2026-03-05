import Link from "next/link";
import { adminDb } from "@/lib/firebase/admin";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  UserMultipleIcon,
  Briefcase02Icon,
  Store01Icon,
  PackageIcon,
  ClipboardIcon,
  ArrowUpRight01Icon,
  ArrowRight01Icon,
  UserAdd01Icon,
  Shield02Icon
} from "hugeicons-react";

export default async function AdminDashboardPage() {
  // Fetch platform-wide metrics
  const [
    allProfilesSnap,
    pendingSnap,
    activeJobsSnap,
    applicationsSnap,
    leadsSnap,
  ] = await Promise.all([
    adminDb.collection("profiles").get(),
    adminDb.collection("profiles").where("status", "==", "pending").get(),
    adminDb.collection("jobs").where("is_active", "==", true).get(),
    adminDb.collection("applications").get(),
    adminDb.collection("quote_requests").get(),
  ]);

  const allProfiles = allProfilesSnap.docs.map(d => d.data());
  const totalWorkers = allProfiles.filter(p => p.role === "worker" && p.status === "approved").length;
  const totalRestaurants = allProfiles.filter(p => p.role === "restaurant" && p.status === "approved").length;
  const totalVendors = allProfiles.filter(p => p.role === "vendor" && p.status === "approved").length;
  const pendingCount = pendingSnap.size;
  const activeJobs = activeJobsSnap.size;
  const totalApplications = applicationsSnap.size;
  const totalLeads = leadsSnap.size;

  // Recent registrations (last 10)
  const recentProfiles = allProfiles
    .filter(p => p.created_at)
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    .slice(0, 8);

  const metrics = [
    { label: "Total Workers", value: totalWorkers, icon: UserMultipleIcon, color: "text-blue-600", bg: "bg-blue-50", border: "border-blue-100" },
    { label: "Total Restaurants", value: totalRestaurants, icon: Store01Icon, color: "text-orange-600", bg: "bg-orange-50", border: "border-orange-100" },
    { label: "Total Vendors", value: totalVendors, icon: PackageIcon, color: "text-purple-600", bg: "bg-purple-50", border: "border-purple-100" },
    { label: "Active Jobs", value: activeJobs, icon: Briefcase02Icon, color: "text-green-600", bg: "bg-green-50", border: "border-green-100" },
    { label: "Total Applications", value: totalApplications, icon: ArrowUpRight01Icon, color: "text-indigo-600", bg: "bg-indigo-50", border: "border-indigo-100" },
    { label: "B2B Leads", value: totalLeads, icon: PackageIcon, color: "text-teal-600", bg: "bg-teal-50", border: "border-teal-100" },
  ];

  return (
    <div>
      {/* Pending alert */}
      {pendingCount > 0 && (
        <Link href="/admin/queue">
          <div className="mb-6 p-4 rounded-xl border border-amber-200 bg-amber-50 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-amber-100 transition-colors cursor-pointer">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center shrink-0">
                <ClipboardIcon className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <p className="font-semibold text-amber-900">{pendingCount} profile{pendingCount > 1 ? "s" : ""} awaiting approval</p>
                <p className="text-sm text-amber-700">Click to review the approval queue</p>
              </div>
            </div>
            <ArrowRight01Icon className="hidden md:block w-5 h-5 text-amber-600 shrink-0" />
          </div>
        </Link>
      )}

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
        {metrics.map((metric) => {
          const Icon = metric.icon;
          return (
            <Card key={metric.label} className={`shadow-sm border ${metric.border} hover:shadow-md transition-shadow`}>
              <CardContent className="p-4 md:p-5">
                <div className="flex items-center gap-3 mb-3">
                  <div className={`w-10 h-10 rounded-lg ${metric.bg} flex items-center justify-center shrink-0`}>
                    <Icon className={`w-5 h-5 ${metric.color}`} />
                  </div>
                </div>
                <p className={`text-2xl md:text-3xl font-bold tracking-tight ${metric.color}`}>{metric.value}</p>
                <p className="text-xs md:text-sm font-medium text-zinc-500 mt-1">{metric.label}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Quick Actions */}
      <h2 className="text-lg font-bold text-zinc-900 mb-4">Quick Actions</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <Link href="/admin/queue">
          <Card className="shadow-sm border-zinc-200 hover:shadow-md hover:border-orange-200 transition-all cursor-pointer group">
            <CardContent className="p-4 md:p-5 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-orange-50 flex items-center justify-center shrink-0 group-hover:bg-orange-100 transition-colors">
                <ClipboardIcon className="w-6 h-6 text-orange-600" />
              </div>
              <div className="min-w-0">
                <p className="font-semibold text-zinc-900 truncate">Approval Queue</p>
                <p className="text-xs md:text-sm text-zinc-500 truncate">Review pending profiles</p>
              </div>
              <ArrowRight01Icon className="w-4 h-4 text-zinc-400 ml-auto shrink-0" />
            </CardContent>
          </Card>
        </Link>
        <Link href="/admin/users">
          <Card className="shadow-sm border-zinc-200 hover:shadow-md hover:border-blue-200 transition-all cursor-pointer group">
            <CardContent className="p-4 md:p-5 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center shrink-0 group-hover:bg-blue-100 transition-colors">
                <UserMultipleIcon className="w-6 h-6 text-blue-600" />
              </div>
              <div className="min-w-0">
                <p className="font-semibold text-zinc-900 truncate">User Directory</p>
                <p className="text-xs md:text-sm text-zinc-500 truncate">Manage all accounts</p>
              </div>
              <ArrowRight01Icon className="w-4 h-4 text-zinc-400 ml-auto shrink-0" />
            </CardContent>
          </Card>
        </Link>
        <Link href="/admin/jobs">
          <Card className="shadow-sm border-zinc-200 hover:shadow-md hover:border-green-200 transition-all cursor-pointer group">
            <CardContent className="p-4 md:p-5 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-green-50 flex items-center justify-center shrink-0 group-hover:bg-green-100 transition-colors">
                <Briefcase02Icon className="w-6 h-6 text-green-600" />
              </div>
              <div className="min-w-0">
                <p className="font-semibold text-zinc-900 truncate">Job Moderation</p>
                <p className="text-xs md:text-sm text-zinc-500 truncate">Oversee job listings</p>
              </div>
              <ArrowRight01Icon className="w-4 h-4 text-zinc-400 ml-auto shrink-0" />
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Recent Activity */}
      <h2 className="text-lg font-bold text-zinc-900 mb-4">Recent Registrations</h2>
      <Card className="shadow-sm border-zinc-200">
        <CardContent className="p-0">
          {recentProfiles.length === 0 ? (
            <div className="p-12 text-center">
              <div className="mx-auto w-12 h-12 rounded-full bg-zinc-100 flex items-center justify-center mb-4">
                <UserAdd01Icon className="w-6 h-6 text-zinc-400" />
              </div>
              <p className="text-zinc-500 font-medium">No registrations yet.</p>
            </div>
          ) : (
            <div className="divide-y divide-zinc-100">
              {recentProfiles.map((profile, i) => (
                <div key={i} className="flex items-center justify-between gap-4 px-5 py-4 hover:bg-zinc-50/50 transition-colors">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-full bg-zinc-100 flex items-center justify-center text-sm font-semibold text-zinc-600 shrink-0">
                      {profile.full_name ? profile.full_name.charAt(0).toUpperCase() : "?"}
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium text-zinc-900 truncate">{profile.full_name || "Unknown"}</p>
                      <p className="text-xs text-zinc-500 truncate">{profile.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Badge variant="secondary" className="capitalize text-xs">{profile.role}</Badge>
                    <Badge
                      variant="outline"
                      className={`text-xs ${profile.status === "approved"
                        ? "bg-green-50 text-green-700 border-green-200"
                        : profile.status === "pending"
                          ? "bg-amber-50 text-amber-700 border-amber-200"
                          : "bg-red-50 text-red-700 border-red-200"
                        }`}
                    >
                      {profile.status}
                    </Badge>
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
