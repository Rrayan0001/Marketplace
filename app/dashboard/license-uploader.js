"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { db, storage } from "@/lib/firebase/config";
import { doc, setDoc, getDoc, addDoc, collection } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ScanFace, FileText, Loader2 } from "lucide-react";

export default function LicenseUploader({ uid }) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [file, setFile] = useState(null);
    const [error, setError] = useState("");

    const [formData, setFormData] = useState({
        restaurantName: "",
        cuisineType: "",
        seatingCapacity: 50,
        address: "",
    });

    const handleUpload = async () => {
        if (!file) {
            setError("Please select your food license file.");
            return;
        }
        if (!formData.restaurantName.trim()) {
            setError("Please enter your restaurant name.");
            return;
        }
        if (!formData.address.trim()) {
            setError("Please enter your restaurant address.");
            return;
        }

        setLoading(true);
        setError("");

        try {
            // Upload file to Firebase Storage
            const fileExt = file.name.split('.').pop();
            const fileName = `documents/${uid}_food_license_${Date.now()}.${fileExt}`;
            const storageRef = ref(storage, fileName);
            await uploadBytes(storageRef, file);
            const documentUrl = await getDownloadURL(storageRef);

            // Create or update restaurant_profiles
            const rpRef = doc(db, 'restaurant_profiles', uid);
            const rpSnap = await getDoc(rpRef);
            const rpData = {
                profile_id: uid,
                restaurant_name: formData.restaurantName.trim(),
                cuisine_type: formData.cuisineType.trim(),
                seating_capacity: parseInt(formData.seatingCapacity) || 50,
                address: formData.address.trim(),
                food_license_url: documentUrl,
                updated_at: new Date().toISOString(),
            };
            if (!rpSnap.exists()) {
                rpData.created_at = new Date().toISOString();
            }
            await setDoc(rpRef, rpData, { merge: true });

            // Create AI Document entry
            const docRef = await addDoc(collection(db, 'documents'), {
                profile_id: uid,
                document_type: 'food_license',
                file_url: documentUrl,
                ai_status: 'pending',
                created_at: new Date().toISOString(),
            });

            fetch('/api/verify-document', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ documentId: docRef.id, profileId: uid })
            }).catch(err => console.error("Failed to trigger AI verification:", err));

            // Refresh the server component to pick up the new document
            router.refresh();
        } catch (err) {
            console.error(err);
            setError(err.message || "Failed to upload document.");
            setLoading(false);
        }
    };

    return (
        <div className="mt-5 bg-white/60 rounded-xl p-5 border border-amber-200/80 shadow-sm w-full">
            <h4 className="text-sm font-semibold text-amber-900 mb-4 flex items-center gap-2">
                <FileText className="w-4 h-4" /> Complete Your Restaurant Profile & Upload License
            </h4>

            {error && <p className="text-red-500 text-sm mb-3 font-medium">{error}</p>}

            <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                        <Label htmlFor="restaurantName" className="text-xs font-semibold text-zinc-600">Restaurant Name *</Label>
                        <Input
                            id="restaurantName"
                            placeholder="e.g. Royal Biryani House"
                            value={formData.restaurantName}
                            onChange={e => setFormData(prev => ({ ...prev, restaurantName: e.target.value }))}
                            disabled={loading}
                            className="h-10 bg-white"
                        />
                    </div>
                    <div className="space-y-1.5">
                        <Label htmlFor="cuisineType" className="text-xs font-semibold text-zinc-600">Cuisine Type</Label>
                        <Input
                            id="cuisineType"
                            placeholder="e.g. South Indian, Chinese"
                            value={formData.cuisineType}
                            onChange={e => setFormData(prev => ({ ...prev, cuisineType: e.target.value }))}
                            disabled={loading}
                            className="h-10 bg-white"
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                        <Label htmlFor="seatingCapacity" className="text-xs font-semibold text-zinc-600">Seating Capacity</Label>
                        <Input
                            id="seatingCapacity"
                            type="number"
                            min="1"
                            placeholder="50"
                            value={formData.seatingCapacity}
                            onChange={e => setFormData(prev => ({ ...prev, seatingCapacity: e.target.value }))}
                            disabled={loading}
                            className="h-10 bg-white"
                        />
                    </div>
                    <div className="space-y-1.5">
                        <Label htmlFor="address" className="text-xs font-semibold text-zinc-600">Address *</Label>
                        <Input
                            id="address"
                            placeholder="Street, City, State"
                            value={formData.address}
                            onChange={e => setFormData(prev => ({ ...prev, address: e.target.value }))}
                            disabled={loading}
                            className="h-10 bg-white"
                        />
                    </div>
                </div>

                <div className="space-y-1.5">
                    <Label className="text-xs font-semibold text-zinc-600">Food License (Image or PDF) *</Label>
                    <Alert className="bg-blue-50/50 border-blue-200 mb-2">
                        <ScanFace className="h-4 w-4 text-blue-600" />
                        <AlertTitle className="text-blue-900 font-semibold text-xs ml-2">Verification Guidelines</AlertTitle>
                        <AlertDescription className="text-blue-800 text-xs ml-2 mt-0.5">
                            Clear, readable text. No glare. All 4 corners visible.
                        </AlertDescription>
                    </Alert>
                    <div className="flex flex-col sm:flex-row gap-3">
                        <Input
                            type="file" accept="image/*,.pdf"
                            onChange={e => setFile(e.target.files[0])}
                            className="flex-1 bg-white cursor-pointer h-10"
                            disabled={loading}
                        />
                        <Button
                            onClick={handleUpload}
                            disabled={loading || !file}
                            className="sm:w-40 h-10"
                        >
                            {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                            {loading ? "Submitting..." : "Submit for Review"}
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
