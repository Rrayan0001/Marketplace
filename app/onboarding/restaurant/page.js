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
import { isValidIndianPhone, normalizeIndianPhone } from "@/lib/validation";

export default function RestaurantOnboardingPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [file, setFile] = useState(null);
    const [errorMessage, setErrorMessage] = useState("");

    const [formData, setFormData] = useState({
        ownerName: "",
        phone: "",
        restaurantName: "",
        cuisineType: "",
        seatingCapacity: 50,
        address: ""
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

            const user = auth.currentUser;
            if (!user) throw new Error("Not authenticated");

            let documentUrl = "";

            // 1. Upload File to Firebase Storage
            if (file) {
                const fileExt = file.name.split('.').pop();
                const fileName = `documents/${user.uid}_food_license_${Date.now()}.${fileExt}`;
                const storageRef = ref(storage, fileName);
                await uploadBytes(storageRef, file);
                documentUrl = await getDownloadURL(storageRef);
            }

            // 2. Create base Profile
            await setDoc(doc(db, 'profiles', user.uid), {
                id: user.uid,
                email: user.email,
                role: 'restaurant',
                full_name: formData.ownerName,
                phone: normalizedPhone,
                status: 'pending',
                created_at: new Date().toISOString(),
            });

            // 3. Create Restaurant Profile
            await setDoc(doc(db, 'restaurant_profiles', user.uid), {
                profile_id: user.uid,
                restaurant_name: formData.restaurantName,
                cuisine_type: formData.cuisineType,
                seating_capacity: parseInt(formData.seatingCapacity),
                address: formData.address,
                food_license_url: documentUrl,
                created_at: new Date().toISOString(),
            });

            // 4. Create AI Document entry
            if (documentUrl) {
                const docRef = await addDoc(collection(db, 'documents'), {
                    profile_id: user.uid,
                    document_type: 'food_license',
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
                    <div className="text-5xl mb-4">🍽️</div>
                    <CardTitle className="text-3xl font-bold text-zinc-900">Restaurant Setup</CardTitle>
                    <CardDescription className="text-zinc-500 text-base mt-2">Set up your restaurant to start hiring verified staff.</CardDescription>
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
                            <Label className="text-zinc-700 font-medium">Restaurant Name <span className="text-red-500">*</span></Label>
                            <Input type="text" required value={formData.restaurantName} onChange={e => setFormData({ ...formData, restaurantName: e.target.value })} className="h-11" />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label className="text-zinc-700 font-medium">Cuisine Type <span className="text-red-500">*</span></Label>
                                <Input type="text" placeholder="e.g. North Indian, Italian" required value={formData.cuisineType} onChange={e => setFormData({ ...formData, cuisineType: e.target.value })} className="h-11" />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-zinc-700 font-medium">Seating Capacity <span className="text-red-500">*</span></Label>
                                <Input type="number" required value={formData.seatingCapacity} onChange={e => setFormData({ ...formData, seatingCapacity: e.target.value })} className="h-11" />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label className="text-zinc-700 font-medium">Full Address &amp; Zone <span className="text-red-500">*</span></Label>
                            <textarea
                                className="flex min-h-[80px] w-full rounded-md border border-zinc-200 bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-zinc-500 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-zinc-950 disabled:cursor-not-allowed disabled:opacity-50"
                                rows="3" required
                                value={formData.address}
                                onChange={e => setFormData({ ...formData, address: e.target.value })}
                            />
                        </div>

                        <div className="space-y-4 pt-4 border-t border-zinc-100">
                            <div>
                                <Label className="text-zinc-700 font-medium text-lg">Upload Food License <span className="text-red-500">*</span></Label>
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
                                {loading ? "Processing..." : "Submit for Verification"}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
