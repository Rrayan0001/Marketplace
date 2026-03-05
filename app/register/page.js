"use client";
import { useState, Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { auth } from "@/lib/firebase/config";
import {
    GoogleAuthProvider,
    signInWithPopup,
} from "firebase/auth";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check, TriangleAlert } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

async function setRoleAndSession(user, role) {
    // Set custom role claim
    await fetch('/api/auth/set-role', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ uid: user.uid, role }),
    });
    // Force token refresh to pick up the new claim
    const idToken = await user.getIdToken(true);
    // Create server session cookie
    await fetch('/api/auth/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idToken }),
    });
}

function RegisterForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const preselectedRole = searchParams.get("role") || "";

    const [step, setStep] = useState(1);
    const [role, setRole] = useState(preselectedRole);
    const [loading, setLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");

    const roles = [
        { id: "restaurant", icon: "🍽️", label: "Restaurant", desc: "Hire staff and source vendors" },
        { id: "worker", icon: "👨‍🍳", label: "Worker", desc: "Find restaurant jobs near you" },
        { id: "vendor", icon: "📦", label: "Vendor", desc: "Supply to local restaurants" },
    ];

    const handleRoleNext = (e) => {
        e.preventDefault();
        setErrorMessage("");
        if (!role) {
            setErrorMessage("Please select a role to continue.");
            return;
        }
        setStep(2);
    };

    const handleGoogleRegister = async () => {
        setLoading(true);
        setErrorMessage("");
        try {
            const provider = new GoogleAuthProvider();
            const userCredential = await signInWithPopup(auth, provider);
            await setRoleAndSession(userCredential.user, role);
            router.push("/dashboard");
        } catch (error) {
            if (error.code !== 'auth/popup-closed-by-user') {
                setErrorMessage("Google sign-up failed. Please try again.");
            }
            setLoading(false);
        }
    };

    const stepDescriptions = {
        1: "Choose your role to get started",
        2: "Create your account with Google",
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-zinc-50 p-4">
            <Card className="w-full max-w-lg shadow-lg border-zinc-200">
                <CardHeader className="space-y-3 text-center pb-4">
                    <div className="flex justify-center mb-2">
                        <Link href="/">
                            <Image src="/logo.png" alt="Margros" width={56} height={56} className="rounded-xl shadow-sm" style={{ height: 'auto' }} />
                        </Link>
                    </div>
                    <CardTitle className="text-2xl font-bold tracking-tight text-zinc-900">Create Account</CardTitle>
                    <CardDescription className="text-zinc-500 text-sm">{stepDescriptions[step]}</CardDescription>
                </CardHeader>

                {/* Step Indicator */}
                <div className="flex justify-center gap-2 mb-6">
                    <div className={`h-2 w-10 rounded-full transition-colors ${step >= 1 ? 'bg-primary' : 'bg-zinc-200'}`} />
                    <div className={`h-2 w-10 rounded-full transition-colors ${step >= 2 ? 'bg-primary' : 'bg-zinc-200'}`} />
                </div>

                <CardContent>
                    {errorMessage && (
                        <Alert variant="destructive" className="mb-4">
                            <TriangleAlert className="h-4 w-4" />
                            <AlertTitle>Couldn&apos;t continue</AlertTitle>
                            <AlertDescription>{errorMessage}</AlertDescription>
                        </Alert>
                    )}

                    {/* ── STEP 1: Role Selection ── */}
                    {step === 1 && (
                        <form onSubmit={handleRoleNext} className="space-y-6">
                            <div className="space-y-3">
                                {roles.map((r) => (
                                    <label
                                        key={r.id}
                                        className={`flex items-start p-4 border rounded-xl cursor-pointer transition-all ${role === r.id
                                            ? "border-primary bg-primary/5 ring-1 ring-primary"
                                            : "border-zinc-200 hover:border-primary/40 hover:bg-zinc-50"
                                            }`}
                                    >
                                        <input
                                            type="radio"
                                            name="role"
                                            value={r.id}
                                            checked={role === r.id}
                                            onChange={(e) => setRole(e.target.value)}
                                            className="sr-only"
                                        />
                                        <div className="flex-shrink-0 text-3xl mr-4">{r.icon}</div>
                                        <div className="flex-1">
                                            <h4 className="text-base font-semibold text-zinc-900">{r.label}</h4>
                                            <p className="text-zinc-500 text-sm">{r.desc}</p>
                                        </div>
                                        <div className={`flex-shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center mt-0.5 ${role === r.id ? "border-primary bg-primary text-white" : "border-zinc-300"
                                            }`}>
                                            {role === r.id && <Check className="w-3 h-3" />}
                                        </div>
                                    </label>
                                ))}
                            </div>

                            <Button
                                type="submit"
                                className="w-full h-11 font-medium text-[15px]"
                            >
                                Continue →
                            </Button>
                        </form>
                    )}

                    {/* ── STEP 2: Google Sign-Up ── */}
                    {step === 2 && (
                        <div className="space-y-5">
                            {/* Role badge reminder */}
                            <div className="flex items-center gap-2 text-sm text-zinc-500 bg-zinc-50 border border-zinc-200 px-3 py-2 rounded-lg">
                                <span>{roles.find(r => r.id === role)?.icon}</span>
                                <span>Registering as a <strong className="text-zinc-700">{roles.find(r => r.id === role)?.label}</strong></span>
                                <button
                                    type="button"
                                    onClick={() => { setStep(1); setErrorMessage(""); }}
                                    className="ml-auto text-primary hover:underline text-xs font-medium"
                                >
                                    Change
                                </button>
                            </div>

                            {/* Google Sign-Up */}
                            <Button
                                type="button"
                                variant="outline"
                                className="w-full h-12 font-medium border-zinc-300 hover:bg-zinc-50 flex items-center justify-center gap-3 text-zinc-700 text-[15px] transition-all"
                                onClick={handleGoogleRegister}
                                disabled={loading}
                            >
                                {loading ? (
                                    <span className="h-5 w-5 border-2 border-zinc-400 border-t-transparent rounded-full animate-spin" />
                                ) : (
                                    <svg viewBox="0 0 24 24" width="20" height="20" xmlns="http://www.w3.org/2000/svg">
                                        <g transform="matrix(1, 0, 0, 1, 27.009001, -39.238998)">
                                            <path fill="#4285F4" d="M -3.264 51.509 C -3.264 50.719 -3.334 49.969 -3.454 49.239 L -14.754 49.239 L -14.754 53.749 L -8.284 53.749 C -8.574 55.229 -9.424 56.479 -10.684 57.329 L -10.684 60.329 L -6.824 60.329 C -4.564 58.239 -3.264 55.159 -3.264 51.509 Z" />
                                            <path fill="#34A853" d="M -14.754 63.239 C -11.514 63.239 -8.804 62.159 -6.824 60.329 L -10.684 57.329 C -11.764 58.049 -13.134 58.489 -14.754 58.489 C -17.884 58.489 -20.534 56.379 -21.484 53.529 L -25.464 53.529 L -25.464 56.619 C -23.494 60.539 -19.444 63.239 -14.754 63.239 Z" />
                                            <path fill="#FBBC05" d="M -21.484 53.529 C -21.734 52.809 -21.864 52.039 -21.864 51.239 C -21.864 50.439 -21.724 49.669 -21.484 48.949 L -21.484 45.859 L -25.464 45.859 C -26.284 47.479 -26.754 49.299 -26.754 51.239 C -26.754 53.179 -26.284 54.999 -25.464 56.619 L -21.484 53.529 Z" />
                                            <path fill="#EA4335" d="M -14.754 43.989 C -12.984 43.989 -11.404 44.599 -10.154 45.789 L -6.734 42.369 C -8.804 40.429 -11.514 39.239 -14.754 39.239 C -19.444 39.239 -23.494 41.939 -25.464 45.859 L -21.484 48.949 C -20.534 46.099 -17.884 43.989 -14.754 43.989 Z" />
                                        </g>
                                    </svg>
                                )}
                                {loading ? "Connecting..." : "Sign up with Google"}
                            </Button>

                            <p className="text-xs text-center text-zinc-400 leading-relaxed">
                                By continuing, you agree to our Terms of Service and Privacy Policy.
                            </p>
                        </div>
                    )}
                </CardContent>

                <CardFooter className="flex justify-center pt-2 pb-6">
                    <p className="text-center text-sm text-zinc-600">
                        Already have an account?{" "}
                        <Link href="/login" className="font-semibold text-primary hover:underline underline-offset-4">
                            Sign in
                        </Link>
                    </p>
                </CardFooter>
            </Card>
        </div>
    );
}

export default function RegisterPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center bg-zinc-50 p-4">
                <Card className="w-full max-w-lg shadow-lg border-zinc-200">
                    <CardHeader className="space-y-3 text-center pb-6">
                        <CardTitle className="text-2xl font-bold tracking-tight text-zinc-900 animate-pulse">Loading...</CardTitle>
                    </CardHeader>
                </Card>
            </div>
        }>
            <RegisterForm />
        </Suspense>
    );
}
