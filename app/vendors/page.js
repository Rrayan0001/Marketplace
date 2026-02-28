import Link from "next/link";
import { Package, ClipboardList, MessageSquareText, ShieldCheck, MapPin, BarChart3, Star } from "lucide-react";
import styles from "./page.module.css";

export const metadata = {
    title: "For Vendors — Margros",
    description: "Reach local restaurants, showcase your products, and receive quote requests. Join Margros as a verified vendor.",
};

export default function VendorsPage() {
    return (
        <>
            {/* HERO */}
            <section className={styles.hero}>
                <div className={styles.heroBg} />
                <div className={`container ${styles.heroContent}`}>
                    <div className={styles.heroBadge}>
                        <Package size={16} className="text-blue-500" />
                        For Vendors
                    </div>
                    <h1>
                        Supply to Restaurants{" "}
                        <span className="text-gradient">In Your Zone</span>
                    </h1>
                    <p className={styles.heroSub}>
                        Get listed in curated categories, receive quote requests from local restaurants, and grow your business with admin-approved credibility.
                    </p>
                    <div className={styles.heroCtas}>
                        <Link href="/register?role=vendor" className="btn btn-primary btn-lg">
                            List Your Business
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
                        <h2>Grow Your Vendor Business</h2>
                        <p>Margros connects you directly with restaurants that need your products and services.</p>
                    </div>
                    <div className={styles.featureGrid}>
                        {[
                            { icon: <ClipboardList size={28} className="text-blue-600" />, title: "Curated Categories", desc: "Get listed under kitchen equipment, cleaning supplies, food packaging, and more." },
                            { icon: <MessageSquareText size={28} className="text-emerald-500" />, title: "Quote Requests", desc: "Restaurants send you direct quote requests. Respond and convert leads to sales." },
                            { icon: <ShieldCheck size={28} className="text-teal-600" />, title: "Admin Verified", desc: "Upload your GST certificate or registration. After approval, earn the 'Verified Vendor' badge." },
                            { icon: <MapPin size={28} className="text-red-500" />, title: "Zone Targeting", desc: "Define your operating zones and get visible only to restaurants in those areas." },
                            { icon: <BarChart3 size={28} className="text-indigo-500" />, title: "Track Leads", desc: "Monitor incoming leads, conversion rates, and sales performance in your dashboard." },
                            { icon: <Star size={28} className="text-amber-400" />, title: "Build Reputation", desc: "Collect ratings and reviews from restaurants. Higher ratings mean more visibility." },
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
                    <h2>Ready to Reach More Restaurants?</h2>
                    <p>Join Margros as a verified vendor and start receiving quote requests today.</p>
                    <Link href="/register?role=vendor" className="btn btn-primary btn-lg">
                        Create Vendor Account
                    </Link>
                </div>
            </section>
        </>
    );
}
