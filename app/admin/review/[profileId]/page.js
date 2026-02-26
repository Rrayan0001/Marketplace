import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Image from 'next/image';

export default async function ReviewProfilePage({ params }) {
    // Await the entire params object before destruction per Next.js 15+ convention for dynamic routes
    const resolvedParams = await params;
    const profileId = resolvedParams.profileId;

    const supabase = await createClient();

    // 1. Fetch Profile Data
    const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', profileId)
        .single();

    if (!profile || profile.status !== 'pending') {
        redirect('/admin');
    }

    // 2. Fetch Role-Specific Data
    let roleData = null;
    if (profile.role === 'restaurant') {
        const { data } = await supabase.from('restaurant_profiles').select('*').eq('profile_id', profileId).single();
        roleData = data;
    } else if (profile.role === 'worker') {
        const { data } = await supabase.from('worker_profiles').select('*').eq('profile_id', profileId).single();
        roleData = data;
    } else if (profile.role === 'vendor') {
        const { data } = await supabase.from('vendor_profiles').select('*').eq('profile_id', profileId).single();
        roleData = data;
    }

    // 3. Fetch Document & AI Data
    const { data: documents } = await supabase.from('documents').select('*').eq('profile_id', profileId).order('created_at', { ascending: false }).limit(1);
    const doc = documents?.[0] || null;

    return (
        <div className="container" style={{ paddingBottom: '80px', maxWidth: '1000px' }}>
            <div style={{ marginBottom: '24px' }}>
                <a href="/admin" style={{ color: 'var(--brand-primary)', textDecoration: 'none', fontWeight: 600 }}>← Back to Queue</a>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px' }}>

                {/* LEFT COLUMN: Data */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

                    <div style={{ background: 'white', padding: '24px', borderRadius: '12px', border: '1px solid var(--brand-border)' }}>
                        <h2 style={{ marginBottom: '16px' }}>User Details</h2>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                            <div>
                                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '4px' }}>Full Name</p>
                                <p style={{ fontWeight: 500 }}>{profile.full_name}</p>
                            </div>
                            <div>
                                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '4px' }}>Email</p>
                                <p style={{ fontWeight: 500 }}>{profile.email}</p>
                            </div>
                            <div>
                                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '4px' }}>Phone</p>
                                <p style={{ fontWeight: 500 }}>{profile.phone}</p>
                            </div>
                            <div>
                                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '4px' }}>Role</p>
                                <p style={{ fontWeight: 500, textTransform: 'capitalize' }}>{profile.role}</p>
                            </div>
                        </div>
                    </div>

                    {roleData && (
                        <div style={{ background: 'white', padding: '24px', borderRadius: '12px', border: '1px solid var(--brand-border)' }}>
                            <h2 style={{ marginBottom: '16px', textTransform: 'capitalize' }}>{profile.role} Specific Data</h2>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                                {Object.entries(roleData).map(([key, value]) => {
                                    if (['id', 'profile_id', 'created_at', 'updated_at', 'food_license_url', 'aadhaar_url', 'gst_certificate_url', 'ai_verification_data'].includes(key)) return null;
                                    return (
                                        <div key={key}>
                                            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '4px', textTransform: 'capitalize' }}>{key.replace(/_/g, ' ')}</p>
                                            <p style={{ fontWeight: 500 }}>{String(value || 'N/A')}</p>
                                        </div>
                                    )
                                })}
                            </div>
                        </div>
                    )}

                    <div style={{ background: 'var(--bg-subtle)', padding: '24px', borderRadius: '12px', border: '1px solid var(--brand-border)' }}>
                        <h2 style={{ marginBottom: '16px' }}>Action Panel</h2>
                        <form action="/api/admin/review" method="POST">
                            <input type="hidden" name="profileId" value={profileId} />

                            <div className="form-group" style={{ marginBottom: '16px' }}>
                                <label className="form-label">Admin Notes (Required for rejection)</label>
                                <textarea name="adminNotes" className="form-input" rows="3" placeholder="Enter reason if rejecting..."></textarea>
                            </div>

                            <div style={{ display: 'flex', gap: '16px' }}>
                                <button type="submit" name="action" value="approve" className="btn btn-primary" style={{ flex: 1, background: '#4CAF50', borderColor: '#4CAF50' }}>Approve</button>
                                <button type="submit" name="action" value="reject" className="btn btn-outline" style={{ flex: 1, color: '#d32f2f', borderColor: '#d32f2f' }}>Reject</button>
                            </div>
                        </form>
                    </div>
                </div>

                {/* RIGHT COLUMN: Document & AI */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                    {doc ? (
                        <>
                            <div style={{ background: 'white', padding: '24px', borderRadius: '12px', border: '1px solid var(--brand-border)' }}>
                                <h2 style={{ marginBottom: '16px' }}>Uploaded Document</h2>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                                    <span style={{ fontWeight: 500, textTransform: 'capitalize' }}>Type: {doc.document_type.replace('_', ' ')}</span>
                                    <span>AI:
                                        {doc.ai_status === 'passed' ? <span style={{ color: '#4CAF50', fontWeight: 'bold' }}> Passed</span> :
                                            doc.ai_status === 'flagged' ? <span style={{ color: '#d32f2f', fontWeight: 'bold' }}> Flagged</span> :
                                                <span style={{ color: '#E8720C', fontWeight: 'bold' }}> {doc.ai_status}</span>}
                                    </span>
                                </div>

                                {doc.file_url ? (
                                    <div style={{ position: 'relative', width: '100%', height: '300px', background: '#f5f5f5', borderRadius: '8px', overflow: 'hidden' }}>
                                        {/* We use an img tag instead of next/image here because we don't know the remote patterns of the bucket beforehand without next.config.js updates */}
                                        <img src={doc.file_url} alt="Document" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                                    </div>
                                ) : (
                                    <p>No document URL found.</p>
                                )}
                            </div>

                            <div style={{ background: '#1e1e1e', color: '#fff', padding: '24px', borderRadius: '12px', fontFamily: 'monospace', overflowX: 'auto' }}>
                                <h3 style={{ borderBottom: '1px solid #333', paddingBottom: '12px', marginBottom: '16px', color: '#E8720C' }}>Groq Vision AI Output</h3>
                                {doc.ai_extracted_data ? (
                                    <pre style={{ fontSize: '0.9rem', lineHeight: 1.5 }}>
                                        {JSON.stringify(doc.ai_extracted_data, null, 2)}
                                    </pre>
                                ) : (
                                    <p style={{ color: '#888' }}>{doc.ai_status === 'processing' ? 'Waiting for AI...' : 'No AI data available.'}</p>
                                )}
                                {doc.ai_flags && doc.ai_flags.length > 0 && (
                                    <div style={{ marginTop: '16px', padding: '12px', background: '#3b1c1c', borderRadius: '6px', color: '#ffb3b3' }}>
                                        <strong>Flags:</strong>
                                        <ul style={{ margin: '8px 0 0 16px' }}>
                                            {doc.ai_flags.map((flag, idx) => <li key={idx}>{flag}</li>)}
                                        </ul>
                                    </div>
                                )}
                            </div>
                        </>
                    ) : (
                        <div style={{ background: 'white', padding: '24px', borderRadius: '12px', border: '1px solid var(--brand-border)' }}>
                            <h3>No Document Uploaded</h3>
                            <p style={{ color: 'var(--text-secondary)' }}>This profile doesn't have any attached verification documents.</p>
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
}
