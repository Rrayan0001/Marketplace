"use client";

import { useState } from "react";
import { db, auth } from "@/lib/firebase/config";
import { addDoc, collection } from "firebase/firestore";

export default function ApplyButton({ jobId, workerId, hasAppliedInitially }) {
    const [hasApplied, setHasApplied] = useState(hasAppliedInitially);
    const [loading, setLoading] = useState(false);

    const handleApply = async () => {
        if (loading || hasApplied) return;
        setLoading(true);

        try {
            await addDoc(collection(db, 'applications'), {
                job_id: jobId,
                worker_id: workerId,
                restaurant_id: null, // populated server-side if needed
                status: 'pending',
                created_at: new Date().toISOString(),
            });
            setHasApplied(true);
        } catch (err) {
            alert("Error applying to job: " + err.message);
        } finally {
            setLoading(false);
        }
    };

    if (hasApplied) {
        return (
            <button className="btn btn-outline" disabled style={{ color: '#4CAF50', borderColor: '#4CAF50' }}>
                ✓ Applied
            </button>
        );
    }

    return (
        <button
            className="btn btn-primary"
            onClick={handleApply}
            disabled={loading}
        >
            {loading ? "Applying..." : "Apply Now"}
        </button>
    );
}
