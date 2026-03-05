"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import styles from "./AdminSidebar.module.css";
import {
    DashboardSquare01Icon,
    ClipboardIcon,
    UserGroupIcon,
    Briefcase02Icon,
    ScrollIcon,
    UserIcon,
} from "hugeicons-react";

const navItems = [
    { href: "/admin", label: "Dashboard", icon: DashboardSquare01Icon },
    { href: "/admin/queue", label: "Approval Queue", icon: ClipboardIcon },
    { href: "/admin/users", label: "User Directory", icon: UserGroupIcon },
    { href: "/admin/jobs", label: "Job Moderation", icon: Briefcase02Icon },
    { href: "/admin/logs", label: "Audit Logs", icon: ScrollIcon },
    { href: "/admin/profile", label: "My Profile", icon: UserIcon },
];

export default function AdminSidebar() {
    const pathname = usePathname();

    return (
        <aside className={styles.sidebar}>
            <nav className={styles.nav}>
                {navItems.map((item) => {
                    const isActive =
                        item.href === "/admin"
                            ? pathname === "/admin"
                            : pathname.startsWith(item.href);
                    const Icon = item.icon;
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`${styles.navItem} ${isActive ? styles.active : ""}`}
                        >
                            <Icon className={styles.icon} />
                            <span>{item.label}</span>
                        </Link>
                    );
                })}
            </nav>
        </aside>
    );
}
