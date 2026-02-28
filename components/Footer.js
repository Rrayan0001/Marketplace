import Link from "next/link";
import Image from "next/image";
import { Twitter, Linkedin, Instagram, Mail } from "lucide-react";
import styles from "./Footer.module.css";

export default function Footer() {
    return (
        <footer className={styles.footer}>
            <div className={styles.container}>
                <div className={styles.grid}>
                    <div className={styles.brand}>
                        <Link href="/" className={styles.logo}>
                            <Image src="/logo.png" alt="Margros" width={40} height={40} />
                            <span className={styles.logoText}>Margros</span>
                        </Link>
                        <p className={styles.tagline}>
                            The hyperlocal marketplace connecting restaurants, workers, and
                            vendors — all verified, all local.
                        </p>
                    </div>

                    <div className={styles.links}>
                        <h4>Platform</h4>
                        <Link href="/restaurants">For Restaurants</Link>
                        <Link href="/workers">For Workers</Link>
                        <Link href="/vendors">For Vendors</Link>
                    </div>

                    <div className={styles.links}>
                        <h4>Support</h4>
                        <Link href="/login">Sign In</Link>
                        <Link href="/register">Create Account</Link>
                        <a href="mailto:support@margros.local">Contact Us</a>
                    </div>
                </div>

                <div className={styles.bottom}>
                    <p>© {new Date().getFullYear()} Margros. All rights reserved.</p>
                    <div className={styles.socials}>
                        <a href="#" aria-label="Twitter" className={styles.social}>
                            <Twitter size={20} />
                        </a>
                        <a href="#" aria-label="LinkedIn" className={styles.social}>
                            <Linkedin size={20} />
                        </a>
                        <a href="#" aria-label="Instagram" className={styles.social}>
                            <Instagram size={20} />
                        </a>
                        <a href="mailto:support@margros.local" aria-label="Email" className={styles.social}>
                            <Mail size={20} />
                        </a>
                    </div>
                </div>
            </div>
        </footer>
    );
}
