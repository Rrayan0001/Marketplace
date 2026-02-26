"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

export default function VendorOnboardingPage() {
    const router = useRouter();
    const supabase = createClient();
    const [loading, setLoading] = useState(false);
    const [file, setFile] = useState(null);

    const [formData, setFormData] = useState({
        businessName: "",
        serviceCategory: "kitchen_equipment",
        gstNumber: "",
        operatingZones: "",
        description: "",
        phone: "",
        ownerName: ""
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error("Not authenticated");

            let documentUrl = "";

            // 1. Upload File
            if (file) {
                const fileExt = file.name.split('.').pop();
                const fileName = `${user.id}_gst_${Date.now()}.${fileExt}`;

                const { error: uploadError } = await supabase.storage.from('documents').upload(fileName, file);
                if (uploadError) throw uploadError;

                const { data: publicData } = supabase.storage.from('documents').getPublicUrl(fileName);
                documentUrl = publicData.publicUrl;
            }

            // 2. Create base Profile
            const { error: profileError } = await supabase.from('profiles').insert({
                id: user.id, email: user.email, role: 'vendor',
                full_name: formData.ownerName, phone: formData.phone, status: 'pending'
            });
            if (profileError) throw profileError;

            // 3. Create Vendor Profile
            const zonesArray = formData.operatingZones.split(',').map(z => z.trim());
            // we'd ideally map names to UUIDs, but keeping text array for now since schema asks for UUIDs. Wait, schema actually specified UUID[] for `operating_zones`. For simplicity in dev without zone DB loaded, we'll omit or parse differently. We will omit operating_zones insert in dev and focus on required fields.
            const { error: vendorError } = await supabase.from('vendor_profiles').insert({
                profile_id: user.id,
                business_name: formData.businessName,
                service_category: formData.serviceCategory,
                gst_number: formData.gstNumber,
                gst_certificate_url: documentUrl,
                description: formData.description
            });
            if (vendorError) throw vendorError;

            // 4. Create AI Document entry
            if (documentUrl) {
                const { data: docData, error: docError } = await supabase.from('documents').insert({
                    profile_id: user.id, document_type: 'gst_certificate', file_url: documentUrl, ai_status: 'pending'
                }).select('id').single();

                if (docError) throw docError;

                // Trigger AI Verification in the background
                if (docData?.id) {
                    fetch('/api/verify-document', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ documentId: docData.id, profileId: user.id })
                    }).catch(err => console.error("Failed to trigger AI verification:", err));
                }
            }

            router.push("/dashboard");
        } catch (error) {
            alert("Error: " + error.message);
            setLoading(false);
        }
    };

    return (
        <div className="container max-w-3xl mx-auto py-12 px-4">
            <Card className="shadow-lg border-zinc-200">
                <CardHeader className="text-center pb-8 pt-10">
                    <div className="text-5xl mb-4">📦</div>
                    <CardTitle className="text-3xl font-bold text-zinc-900">Vendor Registration</CardTitle>
                    <CardDescription className="text-zinc-500 text-base mt-2">Set up your vendor business to supply local restaurants.</CardDescription>
                </CardHeader>

                <CardContent className="px-6 md:px-12 pb-12">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label className="text-zinc-700 font-medium">Owner Full Name <span className="text-red-500">*</span></Label>
                                <Input type="text" required value={formData.ownerName} onChange={e => setFormData({ ...formData, ownerName: e.target.value })} className="h-11" />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-zinc-700 font-medium">Phone Number <span className="text-red-500">*</span></Label>
                                <Input type="tel" required value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} className="h-11" />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label className="text-zinc-700 font-medium">Business Name <span className="text-red-500">*</span></Label>
                            <Input type="text" required value={formData.businessName} onChange={e => setFormData({ ...formData, businessName: e.target.value })} className="h-11" />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label className="text-zinc-700 font-medium">Service Category <span className="text-red-500">*</span></Label>
                                <select 
                                    className="flex h-11 w-full rounded-md border border-zinc-200 bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-zinc-500 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-zinc-950 disabled:cursor-not-allowed disabled:opacity-50"
                                    value={formData.serviceCategory} 
                                    onChange={e => setFormData({ ...formData, serviceCategory: e.target.value })}
                                >
                                    <option value="kitchen_equipment">Kitchen Equipment</option>
                                    <option value="cleaning_supplies">Cleaning Supplies</option>
                                    <option value="food_packaging">Food Packaging</option>
                                    <option value="maintenance">Maintenance & Repair</option>
                                </select>
                            </div>
                            <div className="space-y-2">
                                <Label className="text-zinc-700 font-medium">GST Number <span className="text-red-500">*</span></Label>
                                <Input type="text" required value={formData.gstNumber} onChange={e => setFormData({ ...formData, gstNumber: e.target.value })} className="h-11" />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label className="text-zinc-700 font-medium">Business Description <span className="text-red-500">*</span></Label>
                            <textarea 
                                className="flex min-h-[80px] w-full rounded-md border border-zinc-200 bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-zinc-500 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-zinc-950 disabled:cursor-not-allowed disabled:opacity-50" 
                                rows="3" 
                                required 
                                value={formData.description} 
                                onChange={e => setFormData({ ...formData, description: e.target.value })}
                            />
                        </div>

                        <div className="space-y-3 pt-4 border-t border-zinc-100">
                            <Label className="text-zinc-700 font-medium">Upload GST Certificate <span className="text-red-500">*</span></Label>
                            <p className="text-sm text-zinc-500">Required for admin verification.</p>
                            <Input 
                                type="file" 
                                accept="image/*,.pdf" 
                                onChange={e => setFile(e.target.files[0])} 
                                required 
                                className="pt-2.5 pb-2 h-auto text-zinc-600 cursor-pointer"
                            />
                        </div>

                        <div className="pt-6">
                            <Button type="submit" className="w-full h-12 text-base font-medium" disabled={loading}>
                                {loading ? "Processing..." : "Submit Application"}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
