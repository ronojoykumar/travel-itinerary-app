"use client";

import { Header } from "@/components/Header";
import { BudgetSlider } from "@/components/BudgetSlider";
import { TripPaceSlider } from "@/components/TripPaceSlider";
import { ActivitySwapCard } from "@/components/ActivitySwapCard";
import { AISuggestions } from "@/components/AISuggestions";
import { FinalizePreviewModal } from "@/components/FinalizePreviewModal";
import { ArrowLeft, ArrowRight, CheckCircle2, Zap } from "lucide-react";
import Link from "next/link";
import { useTrip } from "@/hooks/useTrip";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function CustomizePage() {
    const { tripData, isLoaded, saveTrip } = useTrip();
    const router = useRouter();

    const [budget, setBudget] = useState(1500);
    const [pace, setPace] = useState(2);
    const [swappedActivities, setSwappedActivities] = useState<Record<string, any>>({});
    const [showPreview, setShowPreview] = useState(false);
    const [updatedItinerary, setUpdatedItinerary] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    // hasChanges — true only if user actually modified something
    const [hasChanges, setHasChanges] = useState(false);

    // One-time customization gate — read from localStorage
    const [customizationUsed, setCustomizationUsed] = useState(false);

    useEffect(() => {
        if (tripData) {
            setBudget(tripData.budget || 1500);
        }
        // Check if customization has already been used
        const used = localStorage.getItem("customizationUsed") === "true";
        setCustomizationUsed(used);
    }, [tripData]);

    if (!isLoaded || !tripData || !tripData.itinerary) {
        return <div className="min-h-screen bg-gray-50 flex items-center justify-center text-gray-900">Loading...</div>;
    }

    const activities = tripData.itinerary.filter(item => item.type === "activity");

    const handleBudgetChange = (val: number) => {
        setBudget(val);
        if (val !== (tripData.budget || 1500)) setHasChanges(true);
    };

    const handlePaceChange = (val: number) => {
        setPace(val);
        if (val !== 2) setHasChanges(true);
    };

    const handleActivitySwap = (originalActivity: any, newActivity: any) => {
        setSwappedActivities(prev => ({ ...prev, [originalActivity.title]: newActivity }));
        setHasChanges(true);
    };

    // ── Path A: No changes — go straight to booking ────────────────────────
    const handleNoChanges = () => {
        router.push("/booking");
    };

    // ── Path B: Finalize changes → regenerate → back to itinerary ──────────
    const handleFinalize = async () => {
        setLoading(true);
        try {
            const response = await fetch("/api/rejig-itinerary", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    originalItinerary: tripData.itinerary,
                    swappedActivities,
                    newBudget: budget,
                    originalBudget: tripData.budget,
                    pace: pace === 1 ? "relaxed" : pace === 3 ? "packed" : "moderate",
                }),
            });

            if (response.ok) {
                const data = await response.json();
                setUpdatedItinerary(data.itinerary);
                setShowPreview(true);
            } else {
                alert("Failed to update itinerary. Please try again.");
            }
        } catch (error) {
            console.error("Error finalizing:", error);
            alert("Error updating itinerary.");
        } finally {
            setLoading(false);
        }
    };

    // Called when user confirms the diff modal
    const handleConfirm = () => {
        saveTrip({ itinerary: updatedItinerary, budget });
        // Mark customization as used (one-time only)
        localStorage.setItem("customizationUsed", "true");
        // Go back to itinerary with a flag — itinerary will show toast + auto-redirect to booking
        router.push("/itinerary?fromCustomize=true");
    };

    const budgetChange = budget - (tripData.budget || 1500);

    return (
        <div className="min-h-screen pb-48 text-gray-900" style={{ background: "#F8F9FA" }}>
            <Header hideCta={true} />

            <main className="container mx-auto px-4 pt-28 max-w-3xl">
                {/* Page header */}
                <div className="mb-8">
                    <Link href="/itinerary" className="inline-flex items-center text-sm text-gray-500 hover:text-gray-900 mb-5 cursor-pointer gap-1">
                        <ArrowLeft size={15} /> Back to Itinerary
                    </Link>
                    <h1 className="text-3xl font-black text-slate-900">Customize Your Itinerary</h1>
                    <p className="text-slate-500 mt-1">
                        {customizationUsed
                            ? "You've already used your one customization — itinerary is locked."
                            : "Make any changes below, then finalize. You get one shot at this!"}
                    </p>
                </div>

                {/* ── Fast Path Banner ── */}
                {!customizationUsed && (
                    <div
                        className="rounded-2xl p-4 mb-8 flex items-center gap-4"
                        style={{
                            background: "linear-gradient(135deg,#6C5CE7,#a78bfa)",
                            boxShadow: "0 4px 20px rgba(108,92,231,0.25)",
                        }}
                    >
                        <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
                            <Zap className="h-5 w-5 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="font-bold text-white text-sm">Happy with your itinerary?</p>
                            <p className="text-white/70 text-xs">Skip customization and jump straight to booking.</p>
                        </div>
                        <button
                            onClick={handleNoChanges}
                            className="shrink-0 bg-white text-violet-700 font-bold text-sm px-4 py-2.5 rounded-xl transition-all hover:bg-white/90 active:scale-[0.98] flex items-center gap-1.5 whitespace-nowrap"
                        >
                            No changes needed, let's go!
                            <ArrowRight size={15} />
                        </button>
                    </div>
                )}

                {/* ── Customization controls (locked if already used) ── */}
                {customizationUsed ? (
                    <div className="rounded-2xl border border-slate-200 p-8 text-center bg-white">
                        <CheckCircle2 className="h-10 w-10 text-emerald-500 mx-auto mb-3" />
                        <p className="font-bold text-slate-900">Customization already applied</p>
                        <p className="text-slate-500 text-sm mt-1">Your itinerary was updated. Proceed to booking below.</p>
                        <button
                            onClick={() => router.push("/booking")}
                            className="mt-5 bg-violet-600 text-white font-bold px-6 py-3 rounded-xl inline-flex items-center gap-2 hover:bg-violet-700 transition-all"
                        >
                            Go to Booking <ArrowRight size={16} />
                        </button>
                    </div>
                ) : (
                    <>
                        <BudgetSlider initialValue={tripData.budget} onChange={handleBudgetChange} />
                        <TripPaceSlider initialValue={2} onChange={handlePaceChange} />

                        <div className="mt-8">
                            <h3 className="font-bold text-lg mb-1 text-slate-900">Swap Activities</h3>
                            <p className="text-slate-500 text-sm mb-4">Replace activities you're not interested in</p>
                            <div className="overflow-x-auto pb-4">
                                <div className="flex gap-4" style={{ minWidth: "min-content" }}>
                                    {activities.slice(0, 6).map((item, idx) => (
                                        <div key={idx} className="w-72 shrink-0">
                                            <ActivitySwapCard
                                                activity={{
                                                    title: item.data.title,
                                                    description: item.data.description,
                                                    location: item.data.location,
                                                    category: item.data.category,
                                                    time: item.data.time,
                                                    price: item.data.price,
                                                    rating: item.data.rating,
                                                }}
                                                destination={tripData.destinations[0]}
                                                interests={tripData.interests}
                                                budget={budget}
                                                onSwap={(newActivity) => handleActivitySwap(item.data, newActivity)}
                                            />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <AISuggestions
                            itinerary={tripData.itinerary}
                            budgetChange={budgetChange}
                            paceChange={pace === 1 ? "relaxed" : pace === 3 ? "packed" : "moderate"}
                            destination={tripData.destinations[0]}
                        />
                    </>
                )}
            </main>

            {/* ── Bottom bar ── */}
            {!customizationUsed && (
                <div
                    className="fixed bottom-0 left-0 right-0 p-4 z-40"
                    style={{
                        background: "rgba(255,255,255,0.85)",
                        backdropFilter: "blur(16px)",
                        borderTop: "1px solid rgba(0,0,0,0.06)",
                    }}
                >
                    <div className="max-w-3xl mx-auto flex items-center justify-between gap-4">
                        {/* Change indicator */}
                        <p className="text-sm text-slate-500">
                            {hasChanges
                                ? <span className="text-violet-600 font-semibold">✏️  Changes detected — ready to regenerate</span>
                                : "No changes yet"}
                        </p>

                        {/* Finalize — only active when user has actually changed something */}
                        <button
                            onClick={hasChanges ? handleFinalize : handleNoChanges}
                            disabled={loading}
                            className="text-white font-bold px-7 py-3.5 rounded-2xl transition-all active:scale-[0.98] flex items-center gap-2 disabled:opacity-60"
                            style={{
                                background: hasChanges
                                    ? "linear-gradient(135deg,#6C5CE7,#a78bfa)"
                                    : "#E2E8F0",
                                color: hasChanges ? "#fff" : "#94A3B8",
                                boxShadow: hasChanges ? "0 4px 16px rgba(108,92,231,0.3)" : "none",
                            }}
                        >
                            {loading ? "Regenerating…" : hasChanges ? "Apply changes & preview" : "No changes yet"}
                            {!loading && <ArrowRight size={18} />}
                        </button>
                    </div>
                </div>
            )}

            <FinalizePreviewModal
                isOpen={showPreview}
                onClose={() => setShowPreview(false)}
                originalItinerary={tripData.itinerary}
                updatedItinerary={updatedItinerary}
                originalBudget={tripData.budget}
                newBudget={budget}
                onConfirm={handleConfirm}
            />
        </div>
    );
}
