import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import EmptyState from "@/components/ui/empty-state";
import { ArrowLeft, Store, CheckCircle2, PackageSearch } from "lucide-react";
import RequestQuoteModal from "@/components/vendor/RequestQuoteModal";

export default async function RestaurantVendorsDirectory() {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) redirect('/login');

    const { data: restaurant } = await supabase
        .from('restaurant_profiles')
        .select('id')
        .eq('profile_id', user.id)
        .single();

    if (!restaurant) redirect('/dashboard');

    // Fetch approved vendors
    const { data: vendors, error } = await supabase
        .from('vendor_profiles')
        .select(`
      id,
      business_name,
      service_category,
      description,
      profiles!inner (
        full_name,
        status,
        created_at
      )
    `)
        .eq('profiles.status', 'approved')
        .order('profiles(created_at)', { ascending: false });

    if (error) {
        console.error("Error fetching vendors:", error);
    }

    return (
        <div className="container max-w-6xl mx-auto py-12 px-4">
            <div className="mb-6">
                <Link href="/dashboard" className="inline-flex items-center text-zinc-500 hover:text-zinc-900 transition-colors font-medium text-sm">
                    <ArrowLeft className="w-4 h-4 mr-2" /> Back to Dashboard
                </Link>
            </div>

            <header className="mb-10">
                <h1 className="text-3xl font-bold text-zinc-900 tracking-tight mb-2">B2B Supplier Directory</h1>
                <p className="text-zinc-500">Discover verified local suppliers for equipment, ingredients, and packaging.</p>
            </header>

            {(!vendors || vendors.length === 0) ? (
                <EmptyState
                    icon={<PackageSearch className="h-8 w-8" />}
                    title="No vendors available"
                    description="No B2B suppliers have joined your area yet."
                />
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {vendors.map((vendorObj) => (
                        <Card key={vendorObj.id} className="flex flex-col overflow-hidden border-zinc-200 shadow-sm transition-all hover:shadow-md">
                            <CardContent className="p-6 flex-1 flex flex-col">
                                <div className="flex items-start gap-4 mb-4">
                                    <div className="w-12 h-12 shrink-0 rounded-xl bg-zinc-100 border border-zinc-200 flex items-center justify-center">
                                        <Store className="w-5 h-5 text-zinc-500" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold text-zinc-900 m-0 mb-1 line-clamp-2">{vendorObj.business_name || vendorObj.profiles?.full_name}</h3>
                                        <div className="flex items-center text-green-600 text-xs font-semibold">
                                            <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Verified Business
                                        </div>
                                    </div>
                                </div>

                                <div className="mb-4">
                                    <Badge variant="secondary" className="bg-zinc-100 text-zinc-600 hover:bg-zinc-200 uppercase font-semibold text-[10px] tracking-wider py-1 px-2.5 shadow-sm border border-zinc-200/50">
                                        {vendorObj.service_category.replace('_', ' ')}
                                    </Badge>
                                </div>

                                <p className="text-sm text-zinc-500 leading-relaxed mb-6 flex-1 line-clamp-4">
                                    {vendorObj.description}
                                </p>

                                <div className="mt-auto pt-6 border-t border-zinc-100">
                                    <RequestQuoteModal vendorId={vendorObj.id} restaurantId={restaurant.id} vendorName={vendorObj.business_name} />
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
