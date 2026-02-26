import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';

export default async function AdminDashboardPage() {
    const supabase = await createClient();

    // Fetch all pending profiles with their latest document
    const { data: pendingProfiles, error } = await supabase
        .from('profiles')
        .select(`
      id,
      email,
      role,
      full_name,
      status,
      created_at,
      documents (
        id,
        document_type,
        ai_status,
        ai_confidence_score
      )
    `)
        .eq('status', 'pending')
        .order('created_at', { ascending: true });

    if (error) {
        console.error("Error fetching pending profiles:", error);
    }

    const pendingCount = pendingProfiles?.length || 0;

    return (
        <div className="container" style={{ paddingBottom: '80px' }}>
            <header style={{ marginBottom: '40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h1 style={{ fontSize: '2rem', marginBottom: '8px' }}>Approval Queue</h1>
                    <p style={{ color: 'var(--text-secondary)' }}>You have {pendingCount} profiles waiting for manual review.</p>
                </div>
            </header>

            {pendingCount === 0 ? (
                <div style={{ textAlign: 'center', padding: '60px', background: 'white', borderRadius: '12px', border: '1px solid var(--brand-border)' }}>
                    <div style={{ fontSize: '3rem', marginBottom: '16px' }}>🎉</div>
                    <h3>All caught up!</h3>
                    <p style={{ color: 'var(--text-secondary)' }}>There are no pending profiles to review at the moment.</p>
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {pendingProfiles?.map((profile) => {
                        const latestDoc = profile.documents?.[0]; // Assume the first returned is what we need for simplicity
                        return (
                            <div
                                key={profile.id}
                                style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    padding: '24px',
                                    background: 'white',
                                    borderRadius: '12px',
                                    border: '1px solid var(--brand-border)',
                                    boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
                                }}
                            >
                                <div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                                        <h3 style={{ margin: 0 }}>{profile.full_name || 'Anonymous User'}</h3>
                                        <span style={{
                                            fontSize: '0.8rem',
                                            padding: '4px 8px',
                                            background: 'var(--bg-warm)',
                                            borderRadius: '4px',
                                            textTransform: 'uppercase',
                                            fontWeight: 600,
                                            color: 'var(--text-secondary)'
                                        }}>
                                            {profile.role}
                                        </span>
                                    </div>
                                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '12px' }}>{profile.email} • Applied on {new Date(profile.created_at).toLocaleDateString()}</p>

                                    {latestDoc ? (
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem' }}>
                                            <span style={{ color: 'var(--text-muted)' }}>AI Status:</span>
                                            {latestDoc.ai_status === 'passed' ? (
                                                <span style={{ color: '#4CAF50', fontWeight: 600 }}>✅ Verified ({Math.round(latestDoc.ai_confidence_score * 100)}%)</span>
                                            ) : latestDoc.ai_status === 'flagged' ? (
                                                <span style={{ color: '#d32f2f', fontWeight: 600 }}>⚠️ Flagged</span>
                                            ) : (
                                                <span style={{ color: '#E8720C', fontWeight: 600 }}>🔄 Processing</span>
                                            )}
                                        </div>
                                    ) : (
                                        <span style={{ color: '#E8720C', fontSize: '0.9rem', fontWeight: 500 }}>No documents uploaded</span>
                                    )}
                                </div>
                                <div>
                                    <Link href={`/admin/review/${profile.id}`} className="btn btn-primary">
                                        Review Profile
                                    </Link>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
