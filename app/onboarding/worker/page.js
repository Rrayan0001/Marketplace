"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { TriangleAlert, ScanFace } from "lucide-react";
import { isValidIndianPhone, normalizeIndianPhone } from "@/lib/validation";

export default function WorkerOnboardingPage() {
    const router = useRouter();
    const supabase = createClient();
    const [loading, setLoading] = useState(false);
    const [file, setFile] = useState(null);
    const [errorMessage, setErrorMessage] = useState("");

    const [formData, setFormData] = useState({
        fullName: "",
        phone: "",
        workerRole: "waiter",
        yearsExperience: 0,
        currentLocation: "",
        availability: "full_time"
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setErrorMessage("");

        try {
            const normalizedPhone = normalizeIndianPhone(formData.phone);
            if (!isValidIndianPhone(normalizedPhone)) {
                throw new Error("Enter a valid 10-digit phone number starting with 6, 7, 8, or 9.");
            }

            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error("Not authenticated");

            let documentUrl = "";

            // 1. Upload File to Supabase Storage
            if (file) {
                const fileExt = file.name.split('.').pop();
                const fileName = `${user.id}_aadhaar_${Date.now()}.${fileExt}`;

                const { error: uploadError, data } = await supabase.storage
                    .from('documents')
                    .upload(fileName, file);

                if (uploadError) throw uploadError;

                const { data: publicData } = supabase.storage
                    .from('documents')
                    .getPublicUrl(fileName);

                documentUrl = publicData.publicUrl;
            }

            // 2. Create Profile in 'profiles' table first
            const { error: profileError } = await supabase.from('profiles').insert({
                id: user.id,
                email: user.email,
                role: 'worker',
                full_name: formData.fullName,
                phone: normalizedPhone,
                status: 'pending'
            });
            if (profileError) throw profileError;

            // 3. Create role-specific 'worker_profiles' entry
            const { error: workerError } = await supabase.from('worker_profiles').insert({
                profile_id: user.id,
                worker_role: formData.workerRole,
                years_experience: parseInt(formData.yearsExperience),
                current_location: formData.currentLocation,
                availability: formData.availability,
                aadhaar_url: documentUrl
            });
            if (workerError) throw workerError;

            // 4. Create document entry for AI Verification Pipeline
            if (documentUrl) {
                const { data: docData, error: docError } = await supabase.from('documents').insert({
                    profile_id: user.id,
                    document_type: 'aadhaar',
                    file_url: documentUrl,
                    ai_status: 'pending' // Ready for Phase 3!
                }).select('id').single();
                if (docError) throw docError;

                // Trigger AI Verification in the background (fire and forget)
                if (docData?.id) {
                    fetch('/api/verify-document', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ documentId: docData.id, profileId: user.id })
                    }).catch(err => console.error("Failed to trigger AI verification:", err));
                }
            }

            // Redirect to dashboard (will show pending state)
            router.push("/dashboard");
        } catch (error) {
            setErrorMessage(error.message);
            setLoading(false);
        }
    };

    return (
        <div className="container max-w-3xl mx-auto py-12 px-4">
            <Card className="shadow-lg border-zinc-200">
                <CardHeader className="text-center pb-8 pt-10">
                    <div className="text-5xl mb-4">👨‍🍳</div>
                    <CardTitle className="text-3xl font-bold text-zinc-900">Worker Profile Setup</CardTitle>
                    <CardDescription className="text-zinc-500 text-base mt-2">Complete your profile to start finding jobs in your zone.</CardDescription>
                </CardHeader>

                <CardContent className="px-6 md:px-12 pb-12">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {errorMessage ? (
                            <Alert variant="destructive">
                                <TriangleAlert className="h-4 w-4" />
                                <AlertTitle>Couldn&apos;t submit profile</AlertTitle>
                                <AlertDescription>{errorMessage}</AlertDescription>
                            </Alert>
                        ) : null}

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label className="text-zinc-700 font-medium">Full Name <span className="text-red-500">*</span></Label>
                                <Input type="text" required value={formData.fullName} onChange={(e) => setFormData({ ...formData, fullName: e.target.value })} className="h-11" />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-zinc-700 font-medium">Phone Number <span className="text-red-500">*</span></Label>
                                <Input
                                    type="tel"
                                    required
                                    value={formData.phone}
                                    onChange={(e) => setFormData({ ...formData, phone: normalizeIndianPhone(e.target.value) })}
                                    inputMode="numeric"
                                    maxLength={10}
                                    pattern="[6-9][0-9]{9}"
                                    title="Enter a valid 10-digit phone number starting with 6, 7, 8, or 9."
                                    className="h-11"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label className="text-zinc-700 font-medium">Role <span className="text-red-500">*</span></Label>
                                <select
                                    className="flex h-11 w-full rounded-md border border-zinc-200 bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-zinc-500 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-zinc-950 disabled:cursor-not-allowed disabled:opacity-50"
                                    value={formData.workerRole}
                                    onChange={(e) => setFormData({ ...formData, workerRole: e.target.value })}
                                >
                                    <option value="chef">Chef / Cook</option>
                                    <option value="waiter">Waiter / Server</option>
                                    <option value="cleaner">Cleaner</option>
                                    <option value="kitchen_helper">Kitchen Helper</option>
                                    <option value="manager">Restaurant Manager</option>
                                </select>
                            </div>
                            <div className="space-y-2">
                                <Label className="text-zinc-700 font-medium">Years of Experience <span className="text-red-500">*</span></Label>
                                <Input type="number" min="0" required value={formData.yearsExperience} onChange={(e) => setFormData({ ...formData, yearsExperience: e.target.value })} className="h-11" />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label className="text-zinc-700 font-medium">Current Zone / City <span className="text-red-500">*</span></Label>
                                <Input type="text" required value={formData.currentLocation} onChange={(e) => setFormData({ ...formData, currentLocation: e.target.value })} className="h-11" />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-zinc-700 font-medium">Availability <span className="text-red-500">*</span></Label>
                                <select
                                    className="flex h-11 w-full rounded-md border border-zinc-200 bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-zinc-500 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-zinc-950 disabled:cursor-not-allowed disabled:opacity-50"
                                    value={formData.availability}
                                    onChange={(e) => setFormData({ ...formData, availability: e.target.value })}
                                >
                                    <option value="full_time">Full Time</option>
                                    <option value="part_time">Part Time</option>
                                    <option value="flexible">Flexible</option>
                                    <option value="morning">Morning Shift</option>
                                    <option value="evening">Evening Shift</option>
                                    <option value="night">Night Shift</option>
                                </select>
                            </div>
                        </div>

                        <div className="space-y-4 pt-4 border-t border-zinc-100">
                            <div>
                                <Label className="text-zinc-700 font-medium text-lg">Upload Aadhaar / ID Proof <span className="text-red-500">*</span></Label>
                                <p className="text-sm text-zinc-500 mt-1">This will be scanned by our AI for verification.</p>
                            </div>

                            <Alert className="bg-blue-50/50 border-blue-200">
                                <ScanFace className="h-5 w-5 text-blue-600" />
                                <AlertTitle className="text-blue-900 font-semibold ml-2">AI Verification Guidelines</AlertTitle>
                                <AlertDescription className="text-blue-800 ml-2 mt-2">
                                    <ul className="list-disc leading-relaxed pl-4 space-y-1">
                                        <li>Ensure text is highly clear and readable without blur.</li>
                                        <li>Avoid glare or reflections from camera flash.</li>
                                        <li>Ensure all 4 corners of the document are visible inside the frame.</li>
                                    </ul>
                                </AlertDescription>
                            </Alert>

                            <Input
                                type="file"
                                accept="image/*,.pdf"
                                onChange={(e) => setFile(e.target.files[0])}
                                required
                                className="pt-2.5 pb-2 h-auto text-zinc-600 cursor-pointer bg-zinc-50 hover:bg-zinc-100 transition-colors"
                            />
                        </div>

                        <div className="pt-6">
                            <Button type="submit" className="w-full h-12 text-base font-medium" disabled={loading}>
                                {loading ? "Saving Profile..." : "Submit Profile for Review"}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
