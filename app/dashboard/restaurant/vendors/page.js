import { adminAuth, adminDb } from "@/lib/firebase/admin";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import EmptyState from "@/components/ui/empty-state";
import { ArrowLeft02Icon, Store01Icon, TickDouble02Icon, PackageIcon } from "hugeicons-react";
import RequestQuoteModal from "@/components/vendor/RequestQuoteModal";

export default async function RestaurantVendorsDirectory() {
    const cookieStore = await cookies();
    const session = cookieStore.get("session")?.value;
    if (!session) redirect('/login');

    let decodedToken;
    try {
        decodedToken = await adminAuth.verifySessionCookie(session, true);
    } catch {
        redirect('/login');
    }

    const uid = decodedToken.uid;

    const restaurantSnap = await adminDb.collection('restaurant_profiles').where('profile_id', '==', uid).limit(1).get();
    if (restaurantSnap.empty) redirect('/dashboard');
    const restaurant = { id: restaurantSnap.docs[0].id, ...restaurantSnap.docs[0].data() };

    // Fetch approved vendors
    const vendorProfilesSnap = await adminDb.collection('vendor_profiles').get();

    const vendorsPromises = vendorProfilesSnap.docs.map(async (doc) => {
        const vendorData = doc.data();
        const profileSnap = await adminDb.collection('profiles').doc(vendorData.profile_id).get();
        const profileData = profileSnap.exists ? profileSnap.data() : null;

        if (profileData?.status !== 'approved') return null;

        return {
            id: doc.id,
            ...vendorData,
            profiles: profileData
        };
    });

    const vendors = (await Promise.all(vendorsPromises))
        .filter(Boolean)
        .sort((a, b) => new Date(b.profiles.created_at) - new Date(a.profiles.created_at));

    return (
        <div className="container max-w-6xl mx-auto py-12 px-4">
            <div className="mb-4 md:mb-6">
                <Link href="/dashboard" className="inline-flex items-center text-zinc-500 hover:text-zinc-900 transition-colors font-medium text-sm">
                    <ArrowLeft02Icon className="w-4 h-4 mr-2" /> Back to Dashboard
                </Link>
            </div>

            <header className="mb-6 md:mb-10">
                <h1 className="text-2xl md:text-3xl font-bold text-zinc-900 tracking-tight mb-1 md:mb-2">B2B Supplier Directory</h1>
                <p className="text-sm md:text-base text-zinc-500">Discover verified local suppliers for equipment, ingredients, and packaging.</p>
            </header>

            {(!vendors || vendors.length === 0) ? (
                <EmptyState
                    icon={<PackageIcon className="h-8 w-8 text-primary" />}
                    title="No vendors available"
                    description="No B2B suppliers have joined your area yet."
                />
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                    {vendors.map((vendorObj) => (
                        <Card key={vendorObj.id} className="flex flex-col overflow-hidden border-zinc-200 shadow-sm hover:shadow-md hover:border-zinc-300 transition-all group">
                            <CardContent className="p-5 md:p-6 flex-1 flex flex-col">
                                <div className="flex items-start gap-3 md:gap-4 mb-3 md:mb-4">
                                    <div className="w-10 h-10 md:w-12 md:h-12 shrink-0 rounded-xl bg-zinc-100 border border-zinc-200 flex items-center justify-center group-hover:bg-primary/5 group-hover:border-primary/20 transition-colors">
                                        <Store01Icon className="w-5 h-5 md:w-5 md:h-5 text-zinc-500 group-hover:text-primary transition-colors" />
                                    </div>
                                    <div>
                                        <h3 className="text-base md:text-lg font-bold text-zinc-900 m-0 mb-1 line-clamp-2">{vendorObj.business_name || vendorObj.profiles?.full_name}</h3>
                                        <div className="flex items-center text-green-600 text-[11px] md:text-xs font-semibold">
                                            <TickDouble02Icon className="w-3.5 h-3.5 mr-1" /> Verified Business
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
