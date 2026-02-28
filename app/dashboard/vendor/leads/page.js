import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import EmptyState from "@/components/ui/empty-state";
import { ArrowLeft, Inbox, MapPin, Calendar, CheckCircle2, XCircle, Mail, Phone, Building2 } from "lucide-react";

export default async function VendorLeadsPage() {
    const supabase = await createClient();

    // 1. Get current user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) redirect('/login');

    // 2. Get vendor profile
    const { data: vendor } = await supabase
        .from('vendor_profiles')
        .select('id')
        .eq('profile_id', user.id)
        .single();

    if (!vendor) redirect('/dashboard');

    // 3. Fetch incoming quote requests
    const { data: leads, error } = await supabase
        .from('quote_requests')
        .select(`
      id,
      details,
      status,
      created_at,
      restaurant_id,
      restaurant_profiles (
        restaurant_name,
        address,
        profiles (
          full_name,
          email,
          phone
        )
      )
    `)
        .eq('vendor_id', vendor.id)
        .order('created_at', { ascending: false });

    if (error) {
        console.error("Error fetching leads:", error);
    }

    return (
        <div className="container max-w-4xl mx-auto py-12 px-4">
            <div className="mb-6">
                <Link href="/dashboard" className="inline-flex items-center text-zinc-500 hover:text-zinc-900 transition-colors font-medium text-sm">
                    <ArrowLeft className="w-4 h-4 mr-2" /> Back to Dashboard
                </Link>
            </div>

            <header className="mb-10">
                <h1 className="text-3xl font-bold text-zinc-900 tracking-tight mb-2">Incoming Leads</h1>
                <p className="text-zinc-500">Review quote requests from local restaurants and expand your B2B network.</p>
            </header>

            {(!leads || leads.length === 0) ? (
                <EmptyState
                    icon={<Inbox className="h-8 w-8" />}
                    title="No new leads yet"
                    description="Keep your profile updated. Local restaurants will send requests here when they need your services."
                />
            ) : (
                <div className="grid gap-6">
                    {leads.map((lead) => {
                        const restaurantData = lead.restaurant_profiles;
                        const profileData = restaurantData?.profiles;

                        return (
                            <Card key={lead.id} className={`overflow-hidden transition-all shadow-sm ${lead.status === 'pending' ? 'border-primary/50 shadow-primary/5' : 'border-zinc-200 hover:shadow-md'}`}>
                                <CardContent className="p-0">
                                    <div className="p-6 md:p-8">
                                        <div className="flex flex-col md:flex-row justify-between items-start gap-4 mb-6">
                                            <div className="space-y-3">
                                                <h3 className="text-xl font-bold text-zinc-900 flex items-center gap-2">
                                                    <Building2 className="w-5 h-5 text-zinc-400" />
                                                    {restaurantData?.restaurant_name || 'Restaurant'}
                                                </h3>
                                                <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-zinc-600 font-medium">
                                                    <span className="flex items-center gap-1.5">
                                                        <MapPin className="w-4 h-4 text-zinc-400" />
                                                        {restaurantData?.address || 'Local area'}
                                                    </span>
                                                    <span className="flex items-center gap-1.5">
                                                        <Calendar className="w-4 h-4 text-zinc-400" />
                                                        Requested: {new Date(lead.created_at).toLocaleDateString()}
                                                    </span>
                                                </div>
                                            </div>
                                            <div>
                                                <Badge variant="outline" className={`
                                                    px-3 py-1 font-semibold uppercase tracking-wider text-xs
                                                    ${lead.status === 'pending' ? 'bg-amber-50 text-amber-700 border-amber-200' : ''}
                                                    ${lead.status === 'accepted' ? 'bg-green-50 text-green-700 border-green-200' : ''}
                                                    ${lead.status === 'declined' ? 'bg-red-50 text-red-700 border-red-200' : ''}
                                                `}>
                                                    {lead.status === 'pending' ? '⏳ Action Required' : lead.status}
                                                </Badge>
                                            </div>
                                        </div>

                                        <div className="bg-zinc-50 rounded-lg p-5 border border-zinc-100 mb-6">
                                            <p className="text-xs uppercase tracking-wider font-bold text-zinc-500 mb-2">Requirements / Details</p>
                                            <p className="text-zinc-800 leading-relaxed m-0 italic">&ldquo;{lead.details}&rdquo;</p>
                                        </div>
                                    </div>

                                    {lead.status === 'pending' && (
                                        <div className="border-t border-zinc-100 bg-zinc-50/50 p-4 md:px-8 flex flex-col sm:flex-row justify-end gap-3">
                                            <form action="/api/vendor/lead" method="POST" className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                                                <input type="hidden" name="leadId" value={lead.id} />
                                                <Button type="submit" name="action" value="declined" variant="outline" className="text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700 w-full sm:w-auto">
                                                    <XCircle className="w-4 h-4 mr-2" /> Decline Request
                                                </Button>
                                                <Button type="submit" name="action" value="accepted" className="bg-green-600 hover:bg-green-700 text-white w-full sm:w-auto">
                                                    <CheckCircle2 className="w-4 h-4 mr-2" /> Accept Lead & View Contacts
                                                </Button>
                                            </form>
                                        </div>
                                    )}

                                    {lead.status === 'accepted' && (
                                        <div className="border-t border-zinc-100 bg-green-50/50 p-6 md:px-8">
                                            <h4 className="font-semibold text-green-700 flex items-center gap-2 mb-4">
                                                <CheckCircle2 className="w-5 h-5" /> Lead Accepted - Contact Information Unlocked
                                            </h4>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                                <div className="flex items-center gap-3 p-3 rounded-lg bg-white border border-green-100">
                                                    <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center shrink-0">
                                                        <span className="font-bold text-green-700 text-sm align-middle leading-none">{profileData?.full_name?.charAt(0) || 'U'}</span>
                                                    </div>
                                                    <div>
                                                        <p className="text-xs text-zinc-500 font-medium leading-none mb-1">Contact Name</p>
                                                        <p className="text-sm font-semibold text-zinc-900 leading-none">{profileData?.full_name}</p>
                                                    </div>
                                                </div>
                                                <a href={`mailto:${profileData?.email}`} className="flex items-center gap-3 p-3 rounded-lg bg-white border border-green-100 hover:border-green-300 transition-colors">
                                                    <Mail className="w-5 h-5 text-green-600/70" />
                                                    <div>
                                                        <p className="text-xs text-zinc-500 font-medium leading-none mb-1">Email Address</p>
                                                        <span className="text-sm font-semibold text-zinc-900 leading-none block truncate">{profileData?.email}</span>
                                                    </div>
                                                </a>
                                                <a href={`tel:${profileData?.phone}`} className="flex items-center gap-3 p-3 rounded-lg bg-white border border-green-100 hover:border-green-300 transition-colors">
                                                    <Phone className="w-5 h-5 text-green-600/70" />
                                                    <div>
                                                        <p className="text-xs text-zinc-500 font-medium leading-none mb-1">Phone Number</p>
                                                        <span className="text-sm font-semibold text-zinc-900 leading-none">{profileData?.phone || 'Not provided'}</span>
                                                    </div>
                                                </a>
                                            </div>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
