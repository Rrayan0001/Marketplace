"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function ApplyButton({ jobId, workerId, hasAppliedInitially }) {
    const [hasApplied, setHasApplied] = useState(hasAppliedInitially);
    const [loading, setLoading] = useState(false);
    const supabase = createClient();

    const handleApply = async () => {
        if (loading || hasApplied) return;
        setLoading(true);

        try {
            const { error } = await supabase.from('applications').insert({
                job_id: jobId,
                worker_id: workerId,
                status: 'pending'
            });

            if (error) {
                if (error.code === '23505') {
                    // Unique violation - already applied
                    setHasApplied(true);
                } else {
                    throw error;
                }
            } else {
                setHasApplied(true);
            }
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
