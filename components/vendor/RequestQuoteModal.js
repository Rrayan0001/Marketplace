"use client";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function RequestQuoteModal({ vendorId, restaurantId, vendorName }) {
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [details, setDetails] = useState("");
    const [success, setSuccess] = useState(false);
    const supabase = createClient();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const { error } = await supabase.from('quote_requests').insert({
                restaurant_id: restaurantId,
                vendor_id: vendorId,
                details: details,
                status: 'pending'
            });

            if (error) throw error;
            setSuccess(true);
            setTimeout(() => {
                setIsOpen(false);
                setSuccess(false);
                setDetails("");
            }, 2000);
        } catch (err) {
            alert("Error sending request: " + err.message);
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) {
        return (
            <button className="btn btn-primary" onClick={() => setIsOpen(true)} style={{ width: '100%' }}>
                Request Quote
            </button>
        );
    }

    return (
        <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(0,0,0,0.5)', zIndex: 1000,
            display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px'
        }}>
            <div style={{ background: 'white', padding: '32px', borderRadius: '16px', maxWidth: '500px', width: '100%' }}>
                {success ? (
                    <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '3rem', marginBottom: '16px' }}>✅</div>
                        <h3>Request Sent!</h3>
                        <p style={{ color: 'var(--text-secondary)' }}>The vendor has been notified and will contact you directly.</p>
                    </div>
                ) : (
                    <>
                        <h2 style={{ marginBottom: '8px' }}>Request Quote</h2>
                        <p style={{ color: 'var(--text-secondary)', marginBottom: '24px' }}>Send a direct inquiry to <strong>{vendorName}</strong>.</p>

                        <form onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label className="form-label">What do you need?</label>
                                <textarea
                                    className="form-input"
                                    rows="4"
                                    placeholder="e.g., We need 500 custom branded pizza boxes. What is the estimated cost and delivery time?"
                                    required
                                    value={details}
                                    onChange={e => setDetails(e.target.value)}
                                    autoFocus
                                ></textarea>
                            </div>
                            <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
                                <button type="button" className="btn btn-outline" onClick={() => setIsOpen(false)} style={{ flex: 1 }}>Cancel</button>
                                <button type="submit" className="btn btn-primary" disabled={loading} style={{ flex: 1 }}>
                                    {loading ? "Sending..." : "Send Request"}
                                </button>
                            </div>
                        </form>
                    </>
                )}
            </div>
        </div>
    );
}
