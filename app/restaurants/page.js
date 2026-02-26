import Link from "next/link";
import styles from "./page.module.css";

export const metadata = {
    title: "For Restaurants — Margros",
    description: "Hire verified workers, post jobs, and source vendors in your local zone. Margros makes restaurant staffing simple.",
};

export default function RestaurantsPage() {
    return (
        <>
            {/* HERO */}
            <section className={styles.hero}>
                <div className={styles.heroBg} />
                <div className={`container ${styles.heroContent}`}>
                    <div className={styles.heroBadge}>🍽️ For Restaurants</div>
                    <h1>
                        Hire Verified Staff{" "}
                        <span className="text-gradient">In Your Zone</span>
                    </h1>
                    <p className={styles.heroSub}>
                        Post job requirements, browse vetted worker profiles, and source from curated vendors — all hyperlocally matched to your area.
                    </p>
                    <div className={styles.heroCtas}>
                        <Link href="/register?role=restaurant" className="btn btn-primary btn-lg">
                            Start Hiring
                            <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                <path d="M5 12h14M12 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        </Link>
                        <Link href="#preview" className="btn btn-outline btn-lg">
                            Preview Jobs
                        </Link>
                    </div>
                </div>
            </section>

            {/* FEATURES */}
            <section className={`section ${styles.features}`}>
                <div className="container">
                    <div className="section-header">
                        <h2>Everything a Restaurant Needs</h2>
                        <p>From posting your first job to managing your workforce — we handle the heavy lifting.</p>
                    </div>
                    <div className={styles.featureGrid}>
                        {[
                            { icon: "📋", title: "Post Jobs Instantly", desc: "Define role, salary, shift timings, and experience level. Get matched with workers in minutes." },
                            { icon: "🔍", title: "Browse Worker Profiles", desc: "Filter by role (chef, waiter, cleaner), experience, availability, and zone. View verified badges." },
                            { icon: "🛡️", title: "Verified Candidates", desc: "Every worker is AI-screened and admin-approved. See Aadhaar verification and experience proof." },
                            { icon: "📦", title: "Vendor Marketplace", desc: "Source kitchen equipment, cleaning supplies, and services from admin-approved vendors." },
                            { icon: "📍", title: "Zone-Based Matching", desc: "Only see workers and vendors within your geographic zone for hyperlocal efficiency." },
                            { icon: "📊", title: "Hire Dashboard", desc: "Track all your job posts, applications, active hires, and placement history in one place." },
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

            {/* PREVIEW: SAMPLE JOBS */}
            <section id="preview" className={`section ${styles.preview}`}>
                <div className="container">
                    <div className="section-header">
                        <div className={styles.sectionBadge}>Preview Mode</div>
                        <h2>Sample Job Posts</h2>
                        <p>Here&apos;s what job postings look like on Margros. Sign up to post your own!</p>
                    </div>
                    <div className={styles.jobGrid}>
                        {[
                            { role: "Head Chef", salary: "₹35,000/mo", shift: "Morning", zone: "Yelahanka", exp: "5+ years", type: "Full-Time" },
                            { role: "Waiter/Server", salary: "₹18,000/mo", shift: "Evening", zone: "Koramangala", exp: "1+ year", type: "Full-Time" },
                            { role: "Kitchen Helper", salary: "₹12,000/mo", shift: "Flexible", zone: "Indiranagar", exp: "Fresher OK", type: "Part-Time" },
                        ].map((job, i) => (
                            <div key={i} className={styles.jobCard}>
                                <div className={styles.jobHeader}>
                                    <h4>{job.role}</h4>
                                    <span className={styles.jobType}>{job.type}</span>
                                </div>
                                <div className={styles.jobMeta}>
                                    <div className={styles.jobDetail}>
                                        <span className={styles.jobLabel}>💰 Salary</span>
                                        <span className={styles.jobValue}>{job.salary}</span>
                                    </div>
                                    <div className={styles.jobDetail}>
                                        <span className={styles.jobLabel}>🕐 Shift</span>
                                        <span className={styles.jobValue}>{job.shift}</span>
                                    </div>
                                    <div className={styles.jobDetail}>
                                        <span className={styles.jobLabel}>📍 Zone</span>
                                        <span className={styles.jobValue}>{job.zone}</span>
                                    </div>
                                    <div className={styles.jobDetail}>
                                        <span className={styles.jobLabel}>⭐ Exp</span>
                                        <span className={styles.jobValue}>{job.exp}</span>
                                    </div>
                                </div>
                                <Link href="/register?role=restaurant" className="btn btn-outline btn-sm" style={{ width: "100%", marginTop: "16px" }}>
                                    Sign Up to Post Like This
                                </Link>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className={styles.cta}>
                <div className={`container ${styles.ctaContent}`}>
                    <h2>Ready to Build Your Team?</h2>
                    <p>Join Margros and start hiring verified staff in your zone today.</p>
                    <Link href="/register?role=restaurant" className="btn btn-primary btn-lg">
                        Create Restaurant Account
                    </Link>
                </div>
            </section>
        </>
    );
}
