import Link from "next/link";
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
                    <div className={styles.heroBadge}>📦 For Vendors</div>
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
                        <Link href="#preview" className="btn btn-outline btn-lg">
                            Browse Categories
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
                            { icon: "📋", title: "Curated Categories", desc: "Get listed under kitchen equipment, cleaning supplies, food packaging, and more." },
                            { icon: "💬", title: "Quote Requests", desc: "Restaurants send you direct quote requests. Respond and convert leads to sales." },
                            { icon: "🛡️", title: "Admin Verified", desc: "Upload your GST certificate or registration. After approval, earn the 'Verified Vendor' badge." },
                            { icon: "📍", title: "Zone Targeting", desc: "Define your operating zones and get visible only to restaurants in those areas." },
                            { icon: "📊", title: "Track Leads", desc: "Monitor incoming leads, conversion rates, and sales performance in your dashboard." },
                            { icon: "🌟", title: "Build Reputation", desc: "Collect ratings and reviews from restaurants. Higher ratings mean more visibility." },
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

            {/* PREVIEW: VENDOR CATEGORIES */}
            <section id="preview" className={`section ${styles.preview}`}>
                <div className="container">
                    <div className="section-header">
                        <div className={styles.sectionBadge}>Preview Mode</div>
                        <h2>Sample Vendor Listings</h2>
                        <p>Here&apos;s what vendor profiles look like. Sign up to create yours!</p>
                    </div>
                    <div className={styles.vendorGrid}>
                        {[
                            { name: "Fresh Kitchen Supplies", category: "Kitchen Equipment", icon: "🔧", desc: "Commercial-grade kitchen tools, utensils, and cookware for restaurants.", tags: ["Yelahanka", "Koramangala"], zone: "Bengaluru North" },
                            { name: "CleanPro Services", category: "Cleaning Supplies", icon: "🧹", desc: "Industrial cleaning chemicals, tools, and hygiene supplies for food establishments.", tags: ["Indiranagar", "HSR Layout"], zone: "Bengaluru East" },
                            { name: "PackRight Solutions", category: "Food Packaging", icon: "📦", desc: "Eco-friendly takeaway containers, bags, and packaging materials for restaurants.", tags: ["JP Nagar", "Whitefield"], zone: "Bengaluru South" },
                        ].map((v, i) => (
                            <div key={i} className={styles.vendorCard}>
                                <div className={styles.vendorIcon}>{v.icon}</div>
                                <h4>{v.name}</h4>
                                <div className={styles.vendorCategory}>{v.category}</div>
                                <p>{v.desc}</p>
                                <div className={styles.vendorTags}>
                                    {v.tags.map((t, j) => (
                                        <span key={j} className={styles.vendorTag}>📍 {t}</span>
                                    ))}
                                </div>
                                <Link href="/register?role=vendor" className="btn btn-outline btn-sm" style={{ width: "100%" }}>
                                    Request Quote
                                </Link>
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
