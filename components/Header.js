"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import styles from "./Header.module.css";
import { createClient } from "@/lib/supabase/client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LogOut, LayoutDashboard, User } from "lucide-react";

export default function Header() {
    const [scrolled, setScrolled] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);
    const [user, setUser] = useState(null);
    const [profile, setProfile] = useState(null);

    const router = useRouter();
    const supabase = createClient();

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    useEffect(() => {
        const fetchUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                setUser(user);
                const { data } = await supabase.from('profiles').select('*').eq('id', user.id).limit(1);
                if (data && data.length > 0) setProfile(data[0]);
            }
        };

        fetchUser();

        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
            if (session?.user) {
                setUser(session.user);
                fetchUser();
            } else {
                setUser(null);
                setProfile(null);
            }
        });

        return () => subscription.unsubscribe();
    }, [supabase]);

    const handleSignOut = async () => {
        await supabase.auth.signOut();
        router.push("/");
    };

    return (
        <header className={`${styles.header} ${scrolled ? styles.scrolled : ""}`}>
            <div className={styles.container}>
                <Link href="/" className={styles.logo}>
                    <Image src="/logo.png" alt="Margros" width={44} height={44} />
                    <span className={styles.logoText}>Margros</span>
                </Link>

                <nav className={`${styles.nav} ${mobileOpen ? styles.navOpen : ""}`}>
                    <Link href="/restaurants" className={styles.navLink} onClick={() => setMobileOpen(false)}>
                        For Restaurants
                    </Link>
                    <Link href="/workers" className={styles.navLink} onClick={() => setMobileOpen(false)}>
                        For Workers
                    </Link>
                    <Link href="/vendors" className={styles.navLink} onClick={() => setMobileOpen(false)}>
                        For Vendors
                    </Link>
                </nav>

                <div className={styles.actions}>
                    {user ? (
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <button className={`${styles.avatarTrigger} outline-none flex items-center gap-2 rounded-full focus:ring-2 focus:ring-primary focus:ring-offset-2 transition-all`}>
                                    <Avatar className="h-10 w-10 border-2 border-zinc-100 hover:border-primary/50 transition-colors">
                                        <AvatarImage src="" alt={profile?.full_name || user.email} />
                                        <AvatarFallback className="bg-primary/10 text-primary font-medium">
                                            {profile?.full_name ? profile.full_name.charAt(0).toUpperCase() : user.email.charAt(0).toUpperCase()}
                                        </AvatarFallback>
                                    </Avatar>
                                </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-56 mt-2">
                                <DropdownMenuLabel className="font-normal">
                                    <div className="flex flex-col space-y-1">
                                        <p className="text-sm font-medium leading-none text-zinc-900">{profile?.full_name || "Account"}</p>
                                        <p className="text-xs leading-none text-zinc-500">{user.email}</p>
                                        {profile?.role && (
                                            <p className="text-xs font-semibold uppercase tracking-wider text-primary mt-1">
                                                {profile.role.replace('_', ' ')}
                                            </p>
                                        )}
                                    </div>
                                </DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem asChild>
                                    <Link href="/dashboard" className="cursor-pointer py-2">
                                        <LayoutDashboard className="mr-2 h-4 w-4 text-zinc-500" />
                                        <span>Dashboard</span>
                                    </Link>
                                </DropdownMenuItem>
                                {profile?.role === 'admin' && (
                                    <DropdownMenuItem asChild>
                                        <Link href="/admin" className="cursor-pointer py-2">
                                            <User className="mr-2 h-4 w-4 text-zinc-500" />
                                            <span>Admin Panel</span>
                                        </Link>
                                    </DropdownMenuItem>
                                )}
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer py-2 text-red-600 focus:text-red-700 focus:bg-red-50">
                                    <LogOut className="mr-2 h-4 w-4" />
                                    <span>Sign out</span>
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    ) : (
                        <>
                            <Link href="/login" className={`btn btn-ghost btn-sm ${styles.navAction}`}>
                                Sign In
                            </Link>
                            <Link href="/register" className={`btn btn-primary btn-sm ${styles.navAction}`}>
                                Get Started
                            </Link>
                        </>
                    )}
                </div>

                <button
                    className={`${styles.burger} ${mobileOpen ? styles.burgerOpen : ""}`}
                    onClick={() => setMobileOpen(!mobileOpen)}
                    aria-label="Toggle menu"
                >
                    <span />
                    <span />
                    <span />
                </button>
            </div>

            {mobileOpen && (
                <div className={styles.mobileMenu}>
                    <nav className={styles.mobileNav}>
                        <Link href="/restaurants" className={styles.mobileNavLink} onClick={() => setMobileOpen(false)}>
                            For Restaurants
                        </Link>
                        <Link href="/workers" className={styles.mobileNavLink} onClick={() => setMobileOpen(false)}>
                            For Workers
                        </Link>
                        <Link href="/vendors" className={styles.mobileNavLink} onClick={() => setMobileOpen(false)}>
                            For Vendors
                        </Link>
                    </nav>
                    <div className={styles.mobileActions}>
                        {user ? (
                            <div className="flex flex-col gap-3 w-full">
                                <div className="flex items-center gap-3 p-3 bg-zinc-50 rounded-xl mb-2 border border-zinc-100">
                                    <Avatar className="h-10 w-10 border border-zinc-200 shadow-sm">
                                        <AvatarFallback className="bg-primary/10 text-primary font-medium">
                                            {profile?.full_name ? profile.full_name.charAt(0).toUpperCase() : user.email.charAt(0).toUpperCase()}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="flex flex-col overflow-hidden">
                                        <span className="text-sm font-medium text-zinc-900 truncate pb-0.5">{profile?.full_name || "Welcome Back"}</span>
                                        <span className="text-xs text-zinc-500 truncate">{user.email}</span>
                                    </div>
                                </div>
                                <Link href="/dashboard" className="btn btn-outline" style={{ width: "100%", justifyContent: "center" }} onClick={() => setMobileOpen(false)}>
                                    <LayoutDashboard className="mr-2 h-4 w-4" /> Dashboard
                                </Link>
                                <button className="btn btn-ghost text-red-600 hover:text-red-700 hover:bg-red-50" style={{ width: "100%", justifyContent: "center" }} onClick={() => { handleSignOut(); setMobileOpen(false); }}>
                                    <LogOut className="mr-2 h-4 w-4" /> Sign Out
                                </button>
                            </div>
                        ) : (
                            <>
                                <Link href="/login" className="btn btn-outline" style={{ width: "100%", justifyContent: "center" }} onClick={() => setMobileOpen(false)}>
                                    Sign In
                                </Link>
                                <Link href="/register" className="btn btn-primary" style={{ width: "100%", justifyContent: "center" }} onClick={() => setMobileOpen(false)}>
                                    Get Started
                                </Link>
                            </>
                        )}
                    </div>
                </div>
            )}
        </header>
    );
}
