import Link from "next/link";
import styles from "./page.module.css";

export const metadata = {
    title: "For Workers — Margros",
    description: "Find restaurant jobs near you. Build your verified profile, browse openings, and get hired faster on Margros.",
};

export default function WorkersPage() {
    return (
        <>
            {/* HERO */}
            <section className={styles.hero}>
                <div className={styles.heroBg} />
                <div className={`container ${styles.heroContent}`}>
                    <div className={styles.heroBadge}>👨‍🍳 For Workers</div>
                    <h1>
                        Find Restaurant Jobs{" "}
                        <span className="text-gradient">Near You</span>
                    </h1>
                    <p className={styles.heroSub}>
                        Browse openings in your zone, build your verified profile, and get hired by top restaurants. Chefs, waiters, cleaners — all roles welcome.
                    </p>
                    <div className={styles.heroCtas}>
                        <Link href="/register?role=worker" className="btn btn-secondary btn-lg">
                            Find Jobs
                            <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                <path d="M5 12h14M12 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        </Link>
                        <Link href="#preview" className="btn btn-outline btn-lg">
                            Preview Openings
                        </Link>
                    </div>
                </div>
            </section>

            {/* FEATURES */}
            <section className={`section ${styles.features}`}>
                <div className="container">
                    <div className="section-header">
                        <h2>Your Career in Food, Simplified</h2>
                        <p>From your first job to your dream role — Margros helps workers at every stage.</p>
                    </div>
                    <div className={styles.featureGrid}>
                        {[
                            { icon: "🔍", title: "Browse Local Jobs", desc: "See all openings in your zone — chefs, waiters, kitchen helpers, and more." },
                            { icon: "📱", title: "Apply in One Tap", desc: "Found a match? Apply instantly. Or set yourself as 'Actively Available' for restaurants to find you." },
                            { icon: "🛡️", title: "Get Verified", desc: "Upload Aadhaar or work experience. AI screens it, admin approves — get the 'Verified' badge." },
                            { icon: "📊", title: "Track Applications", desc: "See all your applications, their status, and interview schedules in your dashboard." },
                            { icon: "📍", title: "Hyperlocal Matching", desc: "Only see jobs within your zone. No commuting nightmares — work close to home." },
                            { icon: "⭐", title: "Build Your Profile", desc: "Add your skills, availability schedule, and experience. Stand out to restaurants." },
                        ].map((f, i) => (
                            <div key={i} className={styles.featureCard}>
                                <span className={styles.featureIcon}>{f.icon}</span>
                                <h4>{f.title}</h4>
                                <p>{f.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* PREVIEW: SAMPLE WORKERS */}
            <section id="preview" className={`section ${styles.preview}`}>
                <div className="container">
                    <div className="section-header">
                        <div className={styles.sectionBadge}>Preview Mode</div>
                        <h2>Sample Worker Profiles</h2>
                        <p>Here&#39;s what verified profiles look like. Sign up to create yours!</p>
                    </div>
                    <div className={styles.workerGrid}>
                        {[
                            { name: "Ravi Kumar", role: "Head Chef", exp: "8 years", zone: "Koramangala", avatar: "👨‍🍳", avail: "Full-Time" },
                            { name: "Priya S.", role: "Waitress", exp: "3 years", zone: "Yelahanka", avatar: "🙋‍♀️", avail: "Evening Shift" },
                            { name: "Arjun M.", role: "Kitchen Helper", exp: "1 year", zone: "Indiranagar", avatar: "👨‍🔧", avail: "Flexible" },
                        ].map((w, i) => (
                            <div key={i} className={styles.workerCard}>
                                <div className={styles.workerAvatar}>{w.avatar}</div>
                                <h4>{w.name}</h4>
                                <div className={styles.workerRole}>{w.role}</div>
                                <div className={styles.workerStats}>
                                    <div className={styles.workerStat}>
                                        <span className={styles.workerStatValue}>{w.exp}</span>
                                        <span className={styles.workerStatLabel}>Experience</span>
                                    </div>
                                    <div className={styles.workerStat}>
                                        <span className={styles.workerStatValue}>{w.zone}</span>
                                        <span className={styles.workerStatLabel}>Zone</span>
                                    </div>
                                    <div className={styles.workerStat}>
                                        <span className={styles.workerStatValue}>{w.avail}</span>
                                        <span className={styles.workerStatLabel}>Availability</span>
                                    </div>
                                </div>
                                <span className={styles.verifiedBadge}>✅ Verified</span>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className={styles.cta}>
                <div className={`container ${styles.ctaContent}`}>
                    <h2>Start Your Journey Today</h2>
                    <p>Create your free worker profile, get verified, and start applying to jobs in your zone.</p>
                    <Link href="/register?role=worker" className="btn btn-primary btn-lg">
                        Create Worker Profile
                    </Link>
                </div>
            </section>
        </>
    );
}
