"use client";
import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";

function RegisterForm() {
    const router = useRouter();
    const supabase = createClient();
    const searchParams = useSearchParams();
    const preselectedRole = searchParams.get("role") || "";

    const [step, setStep] = useState(1);
    const [role, setRole] = useState(preselectedRole);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [otp, setOtp] = useState("");
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const roles = [
        { id: "restaurant", icon: "🍽️", label: "Restaurant", desc: "Hire staff and source vendors" },
        { id: "worker", icon: "👨‍🍳", label: "Worker", desc: "Find restaurant jobs near you" },
        { id: "vendor", icon: "📦", label: "Vendor", desc: "Supply to local restaurants" },
    ];

    const handleOtpChange = (e) => {
        const value = e.target.value.replace(/\D/g, "");
        if (value.length <= 8) {
            setOtp(value);
        }
    };

    const handleNext = async (e) => {
        e.preventDefault();

        if (step === 1 && !role) {
            alert("Please select a role");
            return;
        }

        if (step === 2) {
            if (password !== confirmPassword) {
                alert("Passwords do not match");
                return;
            }

            setLoading(true);
            const { data, error } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: {
                        role: role // Save intended role to user metadata
                    }
                }
            });

            setLoading(false);

            if (error) {
                alert(error.message);
                return;
            }

            // If we need email confirmation, move to OTP step. 
            // If auto-confirmed (dev), skip to dashboard.
            if (data?.session) {
                router.push("/dashboard");
                return;
            }

            setStep(3);
            return;
        }

        if (step === 3) {
            setLoading(true);
            const token = otp;
            const { data, error } = await supabase.auth.verifyOtp({
                email,
                token,
                type: 'signup'
            });

            setLoading(false);

            if (error) {
                alert(error.message);
                return;
            }

            router.push("/dashboard");
            return;
        }

        setStep(step + 1);
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-zinc-50 p-4">
            <Card className="w-full max-w-lg shadow-lg border-zinc-200">
                <CardHeader className="space-y-3 text-center pb-6">
                    <div className="flex justify-center mb-2">
                        <Link href="/">
                            <Image src="/logo.png" alt="Margros" width={56} height={56} className="rounded-xl shadow-sm" />
                        </Link>
                    </div>
                    <CardTitle className="text-2xl font-bold tracking-tight text-zinc-900">Create Account</CardTitle>
                    <CardDescription className="text-zinc-500 text-sm">
                        {step === 1 && "Choose your role to get started"}
                        {step === 2 && "Enter your details"}
                        {step === 3 && "Verify your email"}
                    </CardDescription>
                </CardHeader>

                {/* Step Indicator */}
                <div className="flex justify-center gap-2 mb-8">
                    <div className={`h-2.5 w-10 rounded-full transition-colors ${step >= 1 ? 'bg-primary' : 'bg-zinc-200'}`} />
                    <div className={`h-2.5 w-10 rounded-full transition-colors ${step >= 2 ? 'bg-primary' : 'bg-zinc-200'}`} />
                    <div className={`h-2.5 w-10 rounded-full transition-colors ${step >= 3 ? 'bg-primary' : 'bg-zinc-200'}`} />
                </div>

                <CardContent>
                    <form onSubmit={handleNext} className="space-y-6">
                        {/* Step 1: Role Selection */}
                        {step === 1 && (
                            <div className="space-y-4">
                                {roles.map((r) => (
                                    <label
                                        key={r.id}
                                        className={`flex items-start p-4 border rounded-xl cursor-pointer transition-all ${role === r.id
                                                ? "border-primary bg-primary/5 ring-1 ring-primary"
                                                : "border-zinc-200 hover:border-primary/50"
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
                                            <h4 className="text-lg font-semibold text-zinc-900">{r.label}</h4>
                                            <p className="text-zinc-500 text-sm">{r.desc}</p>
                                        </div>
                                        <div className={`flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center ${role === r.id ? "border-primary bg-primary text-white" : "border-zinc-300"
                                            }`}>
                                            {role === r.id && <Check className="w-4 h-4" />}
                                        </div>
                                    </label>
                                ))}
                            </div>
                        )}

                        {/* Step 2: Email & Password */}
                        {step === 2 && (
                            <div className="space-y-5">
                                <div className="space-y-2">
                                    <Label htmlFor="reg-email" className="text-zinc-700 font-medium">Email Address <span className="text-red-500">*</span></Label>
                                    <Input
                                        id="reg-email"
                                        type="email"
                                        placeholder="you@example.com"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                        className="h-11 border-zinc-300 focus-visible:ring-primary focus-visible:ring-offset-0"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="reg-password" className="text-zinc-700 font-medium">Password <span className="text-red-500">*</span></Label>
                                    <div className="relative">
                                        <Input
                                            id="reg-password"
                                            type={showPassword ? "text" : "password"}
                                            placeholder="At least 8 characters"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            minLength={8}
                                            required
                                            className="h-11 pr-10 border-zinc-300 focus-visible:ring-primary focus-visible:ring-offset-0"
                                        />
                                        <button
                                            type="button"
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 focus:outline-none"
                                            onClick={() => setShowPassword(!showPassword)}
                                        >
                                            {showPassword ? "🙈" : "👁️"}
                                        </button>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="reg-confirm" className="text-zinc-700 font-medium">Confirm Password <span className="text-red-500">*</span></Label>
                                    <Input
                                        id="reg-confirm"
                                        type="password"
                                        placeholder="Re-enter password"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        required
                                        className="h-11 border-zinc-300 focus-visible:ring-primary focus-visible:ring-offset-0"
                                    />
                                </div>
                            </div>
                        )}

                        {/* Step 3: OTP */}
                        {step === 3 && (
                            <div className="text-center space-y-6">
                                <p className="text-zinc-600">
                                    We&apos;ve sent an 8-digit code to <strong className="text-zinc-900">{email}</strong>
                                </p>
                                <div className="flex justify-center">
                                    <Input
                                        id="otp"
                                        type="text"
                                        maxLength={8}
                                        value={otp}
                                        onChange={handleOtpChange}
                                        inputMode="numeric"
                                        placeholder="········"
                                        className="h-14 w-full max-w-[280px] text-center text-2xl tracking-[0.5em] font-bold border-zinc-300 focus-visible:ring-primary focus-visible:ring-offset-0"
                                    />
                                </div>
                                <p className="text-sm text-zinc-500">
                                    Didn&apos;t receive it?{" "}
                                    <button type="button" onClick={() => { }} className="font-semibold text-primary hover:underline underline-offset-4">
                                        Resend Code
                                    </button>
                                </p>
                            </div>
                        )}

                        <div className="flex flex-col gap-3 pt-4">
                            <Button
                                type="submit"
                                className="w-full h-11 bg-primary hover:bg-primary/90 text-white font-medium text-[15px] transition-all"
                                disabled={loading}
                            >
                                {loading ? "Processing..." : step === 3 ? "Verify & Create Account" : "Continue"}
                            </Button>

                            {step > 1 && (
                                <Button
                                    type="button"
                                    variant="ghost"
                                    className="w-full h-11 text-zinc-600 hover:text-zinc-900 font-medium text-[15px]"
                                    onClick={() => setStep(step - 1)}
                                >
                                    ← Back
                                </Button>
                            )}
                        </div>
                    </form>
                </CardContent>

                <CardFooter className="flex flex-col space-y-4 pt-2">
                    <div className="relative w-full">
                        <div className="absolute inset-0 flex items-center">
                            <span className="w-full border-t border-zinc-200" />
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                            <span className="bg-white px-2 text-zinc-500 font-medium">or</span>
                        </div>
                    </div>

                    <p className="text-center text-sm text-zinc-600 w-full">
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
