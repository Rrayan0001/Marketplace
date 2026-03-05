"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { db, auth } from "@/lib/firebase/config";
import { collection, addDoc, getDocs, query, where, limit } from "firebase/firestore";
import Link from "next/link";
import { ArrowLeft, Briefcase, TriangleAlert } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { VALIDATION_LIMITS, getDescriptionLength, isValidDescriptionLength } from "@/lib/validation";

export default function PostJobPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");

    const [formData, setFormData] = useState({
        title: "",
        roleType: "chef",
        jobType: "full_time",
        shift: "flexible",
        experienceRequired: 0,
        salaryMin: "",
        salaryMax: "",
        description: "",
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setErrorMessage("");

        try {
            if (!isValidDescriptionLength(formData.description, VALIDATION_LIMITS.jobDescription)) {
                throw new Error(
                    `Job description must be ${VALIDATION_LIMITS.jobDescription.min}-${VALIDATION_LIMITS.jobDescription.max} characters.`
                );
            }

            const user = auth.currentUser;
            if (!user) throw new Error("Not authenticated");

            // Get restaurant profile ID
            const q = query(collection(db, 'restaurant_profiles'), where('profile_id', '==', user.uid), limit(1));
            const querySnapshot = await getDocs(q);

            if (querySnapshot.empty) throw new Error("Could not find your restaurant profile.");
            const restaurantId = querySnapshot.docs[0].id;

            await addDoc(collection(db, 'jobs'), {
                restaurant_id: user.uid, // Using uid for consistency with other parts
                title: formData.title,
                role_type: formData.roleType,
                job_type: formData.jobType,
                shift: formData.shift,
                experience_required: parseInt(formData.experienceRequired),
                salary_min: formData.salaryMin ? parseInt(formData.salaryMin) : null,
                salary_max: formData.salaryMax ? parseInt(formData.salaryMax) : null,
                description: formData.description.trim(),
                is_active: true,
                created_at: new Date().toISOString()
            });

            router.push("/dashboard/restaurant/jobs");
            router.refresh();
        } catch (error) {
            setErrorMessage(`Error posting job: ${error.message}`);
            setLoading(false);
        }
    };

    return (
        <div className="container max-w-4xl mx-auto py-12 px-4">
            <div className="mb-6">
                <Link href="/dashboard" className="inline-flex items-center text-zinc-500 hover:text-zinc-900 transition-colors font-medium text-sm">
                    <ArrowLeft className="w-4 h-4 mr-2" /> Back to Dashboard
                </Link>
            </div>

            <Card className="shadow-lg border-zinc-200">
                <CardHeader className="pb-8 pt-10 px-6 md:px-12">
                    <div className="flex items-center gap-4 mb-2">
                        <div className="p-3 bg-primary/10 rounded-xl">
                            <Briefcase className="w-6 h-6 text-primary" />
                        </div>
                        <div>
                            <CardTitle className="text-3xl font-bold text-zinc-900">Post a New Job</CardTitle>
                            <CardDescription className="text-base text-zinc-500 mt-1">
                                Fill out the requirements below. Verified workers in your zone will be able to apply.
                            </CardDescription>
                        </div>
                    </div>
                </CardHeader>

                <CardContent className="px-6 md:px-12 pb-12">
                    <form onSubmit={handleSubmit} className="space-y-8">
                        {errorMessage ? (
                            <Alert variant="destructive">
                                <TriangleAlert className="h-4 w-4" />
                                <AlertTitle>Couldn&apos;t publish job</AlertTitle>
                                <AlertDescription>{errorMessage}</AlertDescription>
                            </Alert>
                        ) : null}

                        <div className="space-y-3">
                            <Label className="text-zinc-700 font-medium text-base">Job Title <span className="text-red-500">*</span></Label>
                            <Input
                                type="text"
                                placeholder="e.g. Senior Sous Chef for Italian Kitchen"
                                required
                                value={formData.title}
                                onChange={e => setFormData({ ...formData, title: e.target.value })}
                                className="h-12 text-base"
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-3">
                                <Label className="text-zinc-700 font-medium text-base">Role Category <span className="text-red-500">*</span></Label>
                                <select
                                    className="flex h-12 w-full rounded-md border border-zinc-200 bg-transparent px-3 py-1 text-base shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-zinc-950 disabled:cursor-not-allowed disabled:opacity-50"
                                    value={formData.roleType}
                                    onChange={e => setFormData({ ...formData, roleType: e.target.value })}
                                >
                                    <option value="chef">Chef / Cook</option>
                                    <option value="waiter">Waiter / Server</option>
                                    <option value="cleaner">Cleaner</option>
                                    <option value="kitchen_helper">Kitchen Helper</option>
                                    <option value="manager">Manager</option>
                                </select>
                            </div>
                            <div className="space-y-3">
                                <Label className="text-zinc-700 font-medium text-base">Job Type <span className="text-red-500">*</span></Label>
                                <select
                                    className="flex h-12 w-full rounded-md border border-zinc-200 bg-transparent px-3 py-1 text-base shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-zinc-950 disabled:cursor-not-allowed disabled:opacity-50"
                                    value={formData.jobType}
                                    onChange={e => setFormData({ ...formData, jobType: e.target.value })}
                                >
                                    <option value="full_time">Full Time</option>
                                    <option value="part_time">Part Time</option>
                                    <option value="contract">Contract (Temporary)</option>
                                </select>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-3">
                                <Label className="text-zinc-700 font-medium text-base">Shift Timing <span className="text-red-500">*</span></Label>
                                <select
                                    className="flex h-12 w-full rounded-md border border-zinc-200 bg-transparent px-3 py-1 text-base shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-zinc-950 disabled:cursor-not-allowed disabled:opacity-50"
                                    value={formData.shift}
                                    onChange={e => setFormData({ ...formData, shift: e.target.value })}
                                >
                                    <option value="morning">Morning Shift</option>
                                    <option value="evening">Evening Shift</option>
                                    <option value="night">Night Shift</option>
                                    <option value="full_day">Full Day</option>
                                    <option value="flexible">Flexible</option>
                                </select>
                            </div>
                            <div className="space-y-3">
                                <Label className="text-zinc-700 font-medium text-base">Minimum Experience (Years) <span className="text-red-500">*</span></Label>
                                <Input
                                    type="number"
                                    min="0"
                                    required
                                    value={formData.experienceRequired}
                                    onChange={e => setFormData({ ...formData, experienceRequired: e.target.value })}
                                    className="h-12 text-base"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-zinc-50 p-6 rounded-xl border border-zinc-100">
                            <div className="space-y-3">
                                <Label className="text-zinc-700 font-medium text-base">Min Salary (Monthly, ₹)</Label>
                                <Input
                                    type="number"
                                    min="0"
                                    placeholder="e.g. 15000"
                                    value={formData.salaryMin}
                                    onChange={e => setFormData({ ...formData, salaryMin: e.target.value })}
                                    className="h-12 text-base bg-white"
                                />
                            </div>
                            <div className="space-y-3">
                                <Label className="text-zinc-700 font-medium text-base">Max Salary (Monthly, ₹)</Label>
                                <Input
                                    type="number"
                                    min="0"
                                    placeholder="e.g. 25000"
                                    value={formData.salaryMax}
                                    onChange={e => setFormData({ ...formData, salaryMax: e.target.value })}
                                    className="h-12 text-base bg-white"
                                />
                            </div>
                        </div>

                        <div className="space-y-3">
                            <Label className="text-zinc-700 font-medium text-base">Full Description & Requirements <span className="text-red-500">*</span></Label>
                            <textarea
                                className="flex min-h-[150px] w-full rounded-md border border-zinc-200 bg-transparent px-3 py-3 text-base shadow-sm placeholder:text-zinc-400 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-zinc-950 disabled:cursor-not-allowed disabled:opacity-50"
                                rows="6"
                                placeholder="Describe the daily responsibilities, required skills, and any other benefits..."
                                required
                                value={formData.description}
                                onChange={e => setFormData({ ...formData, description: e.target.value })}
                                minLength={VALIDATION_LIMITS.jobDescription.min}
                                maxLength={VALIDATION_LIMITS.jobDescription.max}
                            />
                            <p className="text-xs text-zinc-500">
                                {getDescriptionLength(formData.description)}/{VALIDATION_LIMITS.jobDescription.max} characters
                                {" "}({VALIDATION_LIMITS.jobDescription.min}+ required)
                            </p>
                        </div>

                        <div className="pt-6 border-t border-zinc-100 mt-8">
                            <Button type="submit" className="w-full h-14 text-lg font-medium shadow-md" disabled={loading}>
                                {loading ? "Posting Job..." : "Publish Job Post"}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
