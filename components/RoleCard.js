import Link from "next/link";
import styles from "./RoleCard.module.css";

export default function RoleCard({ icon, title, description, features, href, color = "orange" }) {
    return (
        <Link href={href} className={`${styles.card} ${styles[color]}`}>
            <div className={styles.iconWrap}>
                <span className={styles.icon}>{icon}</span>
            </div>
            <h3 className={styles.title}>{title}</h3>
            <p className={styles.description}>{description}</p>
            <ul className={styles.features}>
                {features.map((f, i) => (
                    <li key={i}>
                        <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                            <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        {f}
                    </li>
                ))}
            </ul>
            <div className={styles.cta}>
                Explore
                <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path d="M5 12h14M12 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
            </div>
        </Link>
    );
}
