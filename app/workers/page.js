import Link from "next/link";
import { User, Search, MapPin, Handshake, BellRing, Star } from "lucide-react";
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
                    <div className={styles.heroBadge}>
                        <User size={16} className="text-emerald-500" />
                        For Workers
                    </div>
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
                            { icon: <Search size={28} className="text-blue-500" />, title: "Find Local Jobs", desc: "Discover hiring restaurants within your zone. Stop commuting across the city." },
                            { icon: <MapPin size={28} className="text-red-500" />, title: "Zone-Based Matching", desc: "Set your preferred working zones and only get notified for relevant opportunities." },
                            { icon: <Handshake size={28} className="text-orange-500" />, title: "Direct Applications", desc: "Apply directly to restaurants with one click using your verified Margros profile." },
                            { icon: <User size={28} className="text-emerald-600" />, title: "Verified Identity", desc: "Get your Aadhaar and certificates AI-verified instantly to stand out to employers." },
                            { icon: <BellRing size={28} className="text-amber-500" />, title: "Instant Alerts", desc: "Receive immediate notifications when restaurants in your zone post matching jobs." },
                            { icon: <Star size={28} className="text-indigo-500" />, title: "Build Your Career", desc: "Collect positive reviews from past employers to increase your hiring chances." },
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
