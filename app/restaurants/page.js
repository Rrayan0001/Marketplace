import Link from "next/link";
import { Utensils, ClipboardList, Search, ShieldCheck, PackageOpen, MapPin, BarChart3, Clock } from "lucide-react";
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
                    <div className={styles.heroBadge}>
                        <Utensils size={16} className="text-orange-500" />
                        For Restaurants
                    </div>
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
                            { icon: <ClipboardList size={28} className="text-orange-500" />, title: "Post Jobs Instantly", desc: "Define role, salary, shift timings, and experience level. Get matched with workers in minutes." },
                            { icon: <Search size={28} className="text-blue-500" />, title: "Browse Worker Profiles", desc: "Filter by role (chef, waiter, cleaner), experience, availability, and zone. View verified badges." },
                            { icon: <ShieldCheck size={28} className="text-emerald-500" />, title: "Verified Candidates", desc: "Every worker is AI-screened and admin-approved. See Aadhaar verification and experience proof." },
                            { icon: <PackageOpen size={28} className="text-amber-600" />, title: "Vendor Marketplace", desc: "Source kitchen equipment, cleaning supplies, and services from admin-approved vendors." },
                            { icon: <MapPin size={28} className="text-red-500" />, title: "Zone-Based Matching", desc: "Only see workers and vendors within your geographic zone for hyperlocal efficiency." },
                            { icon: <BarChart3 size={28} className="text-indigo-500" />, title: "Hire Dashboard", desc: "Track all your job posts, applications, active hires, and placement history in one place." },
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
