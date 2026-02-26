import Image from "next/image";
import Link from "next/link";
import RoleCard from "@/components/RoleCard";
import styles from "./page.module.css";

export default function Home() {
  return (
    <>
      {/* ======== HERO ======== */}
      <section className={styles.hero}>
        <div className={styles.heroBg}>
          <div className={styles.heroGlow1} />
          <div className={styles.heroGlow2} />
        </div>
        <div className={`container ${styles.heroContent}`}>
          <div className={styles.heroText}>
            <div className={styles.heroBadge}>
              <span className={styles.heroBadgeDot} />
              Hyperlocal Restaurant Marketplace
            </div>
            <h1>
              Hire Staff. Find Jobs.{" "}
              <span className="text-gradient">Source Vendors.</span>
            </h1>
            <p className={styles.heroSub}>
              Margros connects verified restaurants, skilled workers, and trusted
              vendors — all within your local zone. Admin-governed, AI-verified,
              and built for the food industry.
            </p>
            <div className={styles.heroCtas}>
              <Link href="/register" className="btn btn-primary btn-lg">
                Get Started Free
                <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path d="M5 12h14M12 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </Link>
              <Link href="#roles" className="btn btn-outline btn-lg">
                Explore Roles
              </Link>
            </div>
            <div className={styles.heroStats}>
              <div className={styles.stat}>
                <span className={styles.statNum}>500+</span>
                <span className={styles.statLabel}>Restaurants</span>
              </div>
              <div className={styles.statDivider} />
              <div className={styles.stat}>
                <span className={styles.statNum}>3,000+</span>
                <span className={styles.statLabel}>Workers</span>
              </div>
              <div className={styles.statDivider} />
              <div className={styles.stat}>
                <span className={styles.statNum}>200+</span>
                <span className={styles.statLabel}>Vendors</span>
              </div>
            </div>
          </div>
          <div className={styles.heroVisual}>
            <div className={styles.heroImageWrap}>
              <Image
                src="/logo.png"
                alt="Margros"
                width={380}
                height={380}
                className={styles.heroImage}
                priority
              />
            </div>
          </div>
        </div>
        <div className={styles.heroWave}>
          <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
            <path d="M0 120V60C240 20 480 0 720 20C960 40 1200 80 1440 60V120H0Z" fill="white" />
          </svg>
        </div>
      </section>

      {/* ======== ROLE CARDS ======== */}
      <section id="roles" className={`section ${styles.roles}`}>
        <div className="container">
          <div className="section-header">
            <div className={styles.sectionBadge}>Choose Your Path</div>
            <h2>
              Built for <span className="text-gradient">Every Role</span> in the Food Industry
            </h2>
            <p>
              Whether you run a restaurant, look for work, or supply to the industry — Margros has the right tools for you.
            </p>
          </div>
          <div className={styles.roleGrid}>
            <RoleCard
              icon="🍽️"
              title="For Restaurants"
              description="Post jobs, browse vetted candidates, and source vendors — all in your local zone."
              features={[
                "Post job requirements instantly",
                "Browse verified worker profiles",
                "Access curated vendor marketplace",
                "Zone-based smart matching",
              ]}
              href="/restaurants"
              color="orange"
            />
            <RoleCard
              icon="👨‍🍳"
              title="For Workers"
              description="Find restaurant jobs near you, build your verified profile, and get hired faster."
              features={[
                "Browse jobs in your zone",
                "AI-verified profile badge",
                "Apply or set 'available' status",
                "Track applications in real-time",
              ]}
              href="/workers"
              color="green"
            />
            <RoleCard
              icon="📦"
              title="For Vendors"
              description="Reach restaurants in your area, showcase products, and receive quote requests."
              features={[
                "List in curated categories",
                "Receive direct quote requests",
                "Zone-targeted visibility",
                "Admin-approved credibility",
              ]}
              href="/vendors"
              color="mixed"
            />
          </div>
        </div>
      </section>

      {/* ======== HOW IT WORKS ======== */}
      <section className={`section ${styles.howItWorks}`}>
        <div className="container">
          <div className="section-header">
            <div className={styles.sectionBadge}>Simple Process</div>
            <h2>
              How <span className="text-gradient">Margros</span> Works
            </h2>
            <p>
              From sign-up to your first hire or first job — it takes just a few verified steps.
            </p>
          </div>
          <div className={styles.steps}>
            <div className={styles.step}>
              <div className={`${styles.stepNumber} ${styles.stepOrange}`}>1</div>
              <h4>Choose Your Role</h4>
              <p>Select if you are a restaurant, worker, or vendor and explore the platform.</p>
            </div>
            <div className={styles.stepLine} />
            <div className={styles.step}>
              <div className={`${styles.stepNumber} ${styles.stepOrange}`}>2</div>
              <h4>Sign Up & Verify</h4>
              <p>Create your account, complete your profile, and upload verification documents.</p>
            </div>
            <div className={styles.stepLine} />
            <div className={styles.step}>
              <div className={`${styles.stepNumber} ${styles.stepGreen}`}>3</div>
              <h4>AI Pre-Screening</h4>
              <p>Our AI verifies your documents instantly. Admin gives the final approval.</p>
            </div>
            <div className={styles.stepLine} />
            <div className={styles.step}>
              <div className={`${styles.stepNumber} ${styles.stepGreen}`}>4</div>
              <h4>Start Operating</h4>
              <p>Access your dashboard — hire staff, find jobs, or connect with restaurants.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ======== FEATURES ======== */}
      <section className={`section ${styles.features}`}>
        <div className="container">
          <div className="section-header">
            <div className={styles.sectionBadge}>Platform Features</div>
            <h2>
              Everything You Need,{" "}
              <span className="text-gradient">Nothing You Don&#39;t</span>
            </h2>
            <p>
              Admin-governed, AI-powered, and hyperlocal — Margros is purpose-built for the food industry ecosystem.
            </p>
          </div>
          <div className={styles.featureGrid}>
            {[
              { icon: "🛡️", title: "Verified Profiles", desc: "Every restaurant, worker, and vendor goes through AI + admin verification." },
              { icon: "📍", title: "Hyperlocal Zones", desc: "See only matches in your geographic zone. City-level workforce management." },
              { icon: "🤖", title: "AI Document OCR", desc: "Groq Vision LLM reads licenses, IDs, and certificates — instantly." },
              { icon: "🔄", title: "Two-Way Hiring", desc: "Restaurants search candidates AND workers apply to jobs. Both paths work." },
              { icon: "📊", title: "Admin Control Room", desc: "Comprehensive dashboard for approvals, analytics, zone management, and more." },
              { icon: "⚡", title: "Lightning Fast", desc: "Built on Next.js + Supabase for serverless speed and seamless scalability." },
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

      {/* ======== CTA ======== */}
      <section className={styles.cta}>
        <div className={styles.ctaBg}>
          <div className={styles.ctaGlow1} />
          <div className={styles.ctaGlow2} />
        </div>
        <div className={`container ${styles.ctaContent}`}>
          <h2>Ready to Transform Your Food Business?</h2>
          <p>
            Join hundreds of restaurants, thousands of workers, and growing
            vendors on the most trusted hyperlocal marketplace.
          </p>
          <div className={styles.ctaButtons}>
            <Link href="/register" className="btn btn-primary btn-lg">
              Create Free Account
            </Link>
            <Link href="#roles" className="btn btn-outline-white btn-lg">
              Learn More
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
