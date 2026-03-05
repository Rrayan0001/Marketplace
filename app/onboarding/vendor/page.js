"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { auth, db, storage } from "@/lib/firebase/config";
import { doc, setDoc, addDoc, collection } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { TriangleAlert, ScanFace } from "lucide-react";
import {
    VALIDATION_LIMITS,
    getDescriptionLength,
    isValidDescriptionLength,
    isValidGst,
    isValidIndianPhone,
    normalizeGst,
    normalizeIndianPhone,
} from "@/lib/validation";

export default function VendorOnboardingPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [file, setFile] = useState(null);
    const [errorMessage, setErrorMessage] = useState("");

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
        setErrorMessage("");

        try {
            const normalizedPhone = normalizeIndianPhone(formData.phone);
            if (!isValidIndianPhone(normalizedPhone)) {
                throw new Error("Enter a valid 10-digit phone number starting with 6, 7, 8, or 9.");
            }

            const normalizedGst = normalizeGst(formData.gstNumber);
            if (!isValidGst(normalizedGst)) {
                throw new Error("Enter a valid 15-character GST number (GSTIN).");
            }

            if (!isValidDescriptionLength(formData.description, VALIDATION_LIMITS.vendorDescription)) {
                throw new Error(
                    `Business description must be ${VALIDATION_LIMITS.vendorDescription.min}-${VALIDATION_LIMITS.vendorDescription.max} characters.`
                );
            }

            const user = auth.currentUser;
            if (!user) throw new Error("Not authenticated");

            let documentUrl = "";

            // 1. Upload File to Firebase Storage
            if (file) {
                const fileExt = file.name.split('.').pop();
                const fileName = `documents/${user.uid}_gst_${Date.now()}.${fileExt}`;
                const storageRef = ref(storage, fileName);
                await uploadBytes(storageRef, file);
                documentUrl = await getDownloadURL(storageRef);
            }

            // 2. Create base Profile
            await setDoc(doc(db, 'profiles', user.uid), {
                id: user.uid,
                email: user.email,
                role: 'vendor',
                full_name: formData.ownerName,
                phone: normalizedPhone,
                status: 'pending',
                created_at: new Date().toISOString(),
            });

            // 3. Create Vendor Profile
            await setDoc(doc(db, 'vendor_profiles', user.uid), {
                profile_id: user.uid,
                business_name: formData.businessName,
                service_category: formData.serviceCategory,
                gst_number: normalizedGst,
                gst_certificate_url: documentUrl,
                description: formData.description.trim(),
                created_at: new Date().toISOString(),
            });

            // 4. Create AI Document entry
            if (documentUrl) {
                const docRef = await addDoc(collection(db, 'documents'), {
                    profile_id: user.uid,
                    document_type: 'gst_certificate',
                    file_url: documentUrl,
                    ai_status: 'pending',
                    created_at: new Date().toISOString(),
                });

                fetch('/api/verify-document', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ documentId: docRef.id, profileId: user.uid })
                }).catch(err => console.error("Failed to trigger AI verification:", err));
            }

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
                    <div className="text-5xl mb-4">📦</div>
                    <CardTitle className="text-3xl font-bold text-zinc-900">Vendor Registration</CardTitle>
                    <CardDescription className="text-zinc-500 text-base mt-2">Set up your vendor business to supply local restaurants.</CardDescription>
                </CardHeader>

                <CardContent className="px-6 md:px-12 pb-12">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {errorMessage ? (
                            <Alert variant="destructive">
                                <TriangleAlert className="h-4 w-4" />
                                <AlertTitle>Couldn&apos;t submit application</AlertTitle>
                                <AlertDescription>{errorMessage}</AlertDescription>
                            </Alert>
                        ) : null}

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label className="text-zinc-700 font-medium">Owner Full Name <span className="text-red-500">*</span></Label>
                                <Input type="text" required value={formData.ownerName} onChange={e => setFormData({ ...formData, ownerName: e.target.value })} className="h-11" />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-zinc-700 font-medium">Phone Number <span className="text-red-500">*</span></Label>
                                <Input
                                    type="tel" required
                                    value={formData.phone}
                                    onChange={e => setFormData({ ...formData, phone: normalizeIndianPhone(e.target.value) })}
                                    inputMode="numeric" maxLength={10}
                                    pattern="[6-9][0-9]{9}"
                                    title="Enter a valid 10-digit phone number starting with 6, 7, 8, or 9."
                                    className="h-11"
                                />
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
                                    <option value="maintenance">Maintenance &amp; Repair</option>
                                </select>
                            </div>
                            <div className="space-y-2">
                                <Label className="text-zinc-700 font-medium">GST Number <span className="text-red-500">*</span></Label>
                                <Input
                                    type="text" required
                                    value={formData.gstNumber}
                                    onChange={e => setFormData({ ...formData, gstNumber: normalizeGst(e.target.value).slice(0, 15) })}
                                    maxLength={15}
                                    pattern="[0-9]{2}[A-Za-z]{5}[0-9]{4}[A-Za-z][A-Za-z0-9]Z[A-Za-z0-9]"
                                    title="Enter a valid 15-character GST number (GSTIN)."
                                    className="h-11 uppercase"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label className="text-zinc-700 font-medium">Business Description <span className="text-red-500">*</span></Label>
                            <textarea
                                className="flex min-h-[80px] w-full rounded-md border border-zinc-200 bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-zinc-500 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-zinc-950 disabled:cursor-not-allowed disabled:opacity-50"
                                rows="3" required
                                value={formData.description}
                                onChange={e => setFormData({ ...formData, description: e.target.value })}
                                minLength={VALIDATION_LIMITS.vendorDescription.min}
                                maxLength={VALIDATION_LIMITS.vendorDescription.max}
                            />
                            <p className="text-xs text-zinc-500">
                                {getDescriptionLength(formData.description)}/{VALIDATION_LIMITS.vendorDescription.max} characters
                                {" "}({VALIDATION_LIMITS.vendorDescription.min}+ required)
                            </p>
                        </div>

                        <div className="space-y-4 pt-4 border-t border-zinc-100">
                            <div>
                                <Label className="text-zinc-700 font-medium text-lg">Upload GST Certificate <span className="text-red-500">*</span></Label>
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
                                type="file" accept="image/*,.pdf"
                                onChange={e => setFile(e.target.files[0])}
                                required
                                className="pt-2.5 pb-2 h-auto text-zinc-600 cursor-pointer bg-zinc-50 hover:bg-zinc-100 transition-colors"
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
