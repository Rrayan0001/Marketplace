"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { db, storage } from "@/lib/firebase/config";
import { doc, updateDoc, addDoc, collection } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ScanFace, FileText, Loader2 } from "lucide-react";

export default function LicenseUploader({ uid }) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [file, setFile] = useState(null);
    const [error, setError] = useState("");

    const handleUpload = async () => {
        if (!file) {
            setError("Please select a file first.");
            return;
        }

        setLoading(true);
        setError("");

        try {
            const fileExt = file.name.split('.').pop();
            const fileName = `documents/${uid}_food_license_${Date.now()}.${fileExt}`;
            const storageRef = ref(storage, fileName);
            await uploadBytes(storageRef, file);
            const documentUrl = await getDownloadURL(storageRef);

            // Update restaurant profile
            await updateDoc(doc(db, 'restaurant_profiles', uid), {
                food_license_url: documentUrl,
                updated_at: new Date().toISOString()
            });

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
            <h4 className="text-sm font-semibold text-amber-900 mb-3 flex items-center gap-2">
                <FileText className="w-4 h-4" /> Upload Document Now
            </h4>

            <Alert className="mb-4 bg-blue-50/50 border-blue-200">
                <ScanFace className="h-4 w-4 text-blue-600" />
                <AlertTitle className="text-blue-900 font-semibold text-sm ml-2">Verification Guidelines</AlertTitle>
                <AlertDescription className="text-blue-800 text-xs ml-2 mt-1">
                    Clear, readable text. No glare. All 4 corners visible.
                </AlertDescription>
            </Alert>

            {error && <p className="text-red-500 text-sm mb-3 font-medium">{error}</p>}

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
                    className="sm:w-32 h-10"
                >
                    {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                    {loading ? "Uploading..." : "Upload"}
                </Button>
            </div>
        </div>
    );
}
