"use client";
import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { auth, db } from "@/lib/firebase/config";
import {
    signInWithEmailAndPassword,
    sendPasswordResetEmail,
} from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { TriangleAlert, Eye, EyeOff, Shield, CheckCircle2 } from "lucide-react";

async function createSession(user) {
    const idToken = await user.getIdToken();
    await fetch('/api/auth/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idToken }),
    });
}

export default function AdminLoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const [resetSent, setResetSent] = useState(false);
    const [resetLoading, setResetLoading] = useState(false);

    const handleForgotPassword = async () => {
        if (!email) {
            setErrorMessage("Please enter your admin email first, then click Forgot Password.");
            return;
        }
        setResetLoading(true);
        setErrorMessage("");
        setResetSent(false);
        try {
            await sendPasswordResetEmail(auth, email);
            setResetSent(true);
        } catch (error) {
            if (error.code === 'auth/user-not-found') {
                setErrorMessage("No admin account found with this email.");
            } else {
                setErrorMessage("Failed to send reset email. Please try again.");
            }
        } finally {
            setResetLoading(false);
        }
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setErrorMessage("");

        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);

            // Check if the user is actually an admin
            const profileSnap = await getDoc(doc(db, 'profiles', userCredential.user.uid));
            const profile = profileSnap.data();

            if (!profile || profile.role !== 'admin') {
                // Not an admin — sign them out immediately
                await auth.signOut();
                setErrorMessage("Access restricted. This portal is for administrators only.");
                setLoading(false);
                return;
            }

            // Admin confirmed — create session and redirect
            await createSession(userCredential.user);
            router.push("/admin");
        } catch (error) {
            const msg =
                error.code === 'auth/invalid-credential' || error.code === 'auth/wrong-password'
                    ? 'Invalid email or password. Please try again.'
                    : error.code === 'auth/too-many-requests'
                        ? 'Too many failed attempts. Please try again later.'
                        : 'Something went wrong. Please try again.';
            setErrorMessage(msg);
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4" style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)' }}>
            {/* Subtle grid pattern overlay */}
            <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)', backgroundSize: '40px 40px' }} />

            <Card className="w-full max-w-md shadow-2xl border-zinc-700/50 bg-zinc-900/90 backdrop-blur-xl relative z-10">
                <CardHeader className="space-y-4 text-center pb-6">
                    <div className="flex justify-center mb-2">
                        <div className="relative">
                            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-orange-500 to-amber-600 flex items-center justify-center shadow-lg shadow-orange-500/20">
                                <Shield className="w-8 h-8 text-white" />
                            </div>
                            <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-green-500 border-2 border-zinc-900 flex items-center justify-center">
                                <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                </svg>
                            </div>
                        </div>
                    </div>
                    <div>
                        <CardTitle className="text-2xl font-bold tracking-tight text-white">Admin Portal</CardTitle>
                        <CardDescription className="text-zinc-400 text-sm mt-1">Secure login for Margros administrators</CardDescription>
                    </div>
                </CardHeader>

                <CardContent className="space-y-5">
                    {resetSent && (
                        <Alert className="bg-green-950/40 border-green-800 text-green-200">
                            <CheckCircle2 className="h-4 w-4 !text-green-400" />
                            <AlertTitle className="text-green-200">Reset Email Sent</AlertTitle>
                            <AlertDescription className="text-green-300/80">Check your inbox for a password reset link.</AlertDescription>
                        </Alert>
                    )}

                    {errorMessage && (
                        <Alert variant="destructive" className="bg-red-950/50 border-red-800 text-red-200">
                            <TriangleAlert className="h-4 w-4 !text-red-400" />
                            <AlertTitle className="text-red-200">Access Denied</AlertTitle>
                            <AlertDescription className="text-red-300/80">{errorMessage}</AlertDescription>
                        </Alert>
                    )}

                    <form onSubmit={handleLogin} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="admin-email" className="text-zinc-300 font-medium">Admin Email <span className="text-red-400">*</span></Label>
                            <Input
                                id="admin-email"
                                type="email"
                                placeholder="admin@margros.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                className="h-11 bg-zinc-800/50 border-zinc-700 text-white placeholder:text-zinc-500 focus-visible:ring-orange-500 focus-visible:ring-offset-0 focus-visible:border-orange-500"
                            />
                        </div>

                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <Label htmlFor="admin-password" className="text-zinc-300 font-medium">Password <span className="text-red-400">*</span></Label>
                                <button
                                    type="button"
                                    className="text-xs text-orange-400 hover:text-orange-300 font-medium hover:underline underline-offset-4 transition-colors"
                                    onClick={handleForgotPassword}
                                    disabled={resetLoading}
                                >
                                    {resetLoading ? "Sending..." : "Forgot password?"}
                                </button>
                            </div>
                            <div className="relative">
                                <Input
                                    id="admin-password"
                                    type={showPassword ? "text" : "password"}
                                    placeholder="Enter your password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    className="h-11 pr-10 bg-zinc-800/50 border-zinc-700 text-white placeholder:text-zinc-500 focus-visible:ring-orange-500 focus-visible:ring-offset-0 focus-visible:border-orange-500"
                                />
                                <button
                                    type="button"
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 focus:outline-none"
                                    onClick={() => setShowPassword(!showPassword)}
                                >
                                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </button>
                            </div>
                        </div>

                        <Button
                            type="submit"
                            className="w-full h-11 bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white font-medium text-[15px] transition-all shadow-lg shadow-orange-500/20"
                            disabled={loading}
                        >
                            {loading ? (
                                <span className="flex items-center gap-2">
                                    <span className="h-4 w-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                                    Authenticating...
                                </span>
                            ) : (
                                <span className="flex items-center gap-2">
                                    <Shield className="h-4 w-4" />
                                    Sign In as Admin
                                </span>
                            )}
                        </Button>
                    </form>

                    <div className="text-center pt-2">
                        <p className="text-xs text-zinc-500">
                            Not an admin?{" "}
                            <Link href="/login" className="text-orange-400 hover:text-orange-300 font-medium underline-offset-4 hover:underline">
                                Use the regular login
                            </Link>
                        </p>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
