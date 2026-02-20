"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { useTrip } from "@/hooks/useTrip";
import { PlusCircle, ChevronRight, MapPin, Plane, Loader2, LogOut, Lock } from "lucide-react";
import Link from "next/link";
import { PaywallModal } from "@/components/PaywallModal";

const FREE_LIMIT = 5;

type SavedItinerary = {
    id: string;
    destinations: string[];
    start_date: string;
    end_date: string;
    trip_type: string;
    budget: number;
    interests: string[];
    itinerary: any[];
    created_at: string;
};

const DESTINATION_IMAGES: Record<string, string> = {
    "tokyo": "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=200&q=80",
    "paris": "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=200&q=80",
    "bali": "https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=200&q=80",
    "new york": "https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=200&q=80",
    "london": "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=200&q=80",
    "rome": "https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=200&q=80",
    "barcelona": "https://images.unsplash.com/photo-1583422409516-2895a77efded?w=200&q=80",
    "dubai": "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=200&q=80",
    "singapore": "https://images.unsplash.com/photo-1525625293386-3f8f99389edd?w=200&q=80",
    "swiss alps": "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=200&q=80",
    "kyoto": "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=200&q=80",
    "amsterdam": "https://images.unsplash.com/photo-1534351590666-13e3e96b5017?w=200&q=80",
};

const DEFAULT_IMAGE = "https://images.unsplash.com/photo-1488085061387-422e29b40080?w=200&q=80";

function getDestinationImage(destinations: string[]): string {
    if (!destinations?.length) return DEFAULT_IMAGE;
    const dest = destinations[0].toLowerCase();
    for (const [key, url] of Object.entries(DESTINATION_IMAGES)) {
        if (dest.includes(key)) return url;
    }
    return DEFAULT_IMAGE;
}

function formatDate(dateStr: string): string {
    try {
        return new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
    } catch {
        return dateStr;
    }
}

const TAG_COLORS: Record<string, string> = {
    "Culture": "bg-purple-100 text-purple-700",
    "Food": "bg-orange-100 text-orange-700",
    "Adventure": "bg-green-100 text-green-700",
    "Shopping": "bg-pink-100 text-pink-700",
    "Relaxation": "bg-blue-100 text-blue-700",
    "Nature": "bg-emerald-100 text-emerald-700",
    "History": "bg-amber-100 text-amber-700",
    "Nightlife": "bg-violet-100 text-violet-700",
};

function getTagColor(tag: string): string {
    return TAG_COLORS[tag] || "bg-gray-100 text-gray-700";
}

// ── Inner component that safely uses useSearchParams ──────────────────────
function DashboardInner() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { saveTrip } = useTrip();
    const [user, setUser] = useState<any>(null);
    const [pastTrips, setPastTrips] = useState<SavedItinerary[]>([]);
    const [loading, setLoading] = useState(true);
    const [monthlyCount, setMonthlyCount] = useState(0);
    const [showPaywall, setShowPaywall] = useState(false);
    const [isUnlocked, setIsUnlocked] = useState(false);

    useEffect(() => {
        // Check if user bypassed with coupon this session
        if (sessionStorage.getItem("paywall_bypass") === "true") {
            setIsUnlocked(true);
        }
        // Auto-show paywall if redirected from processing with ?paywall=true
        if (searchParams.get("paywall") === "true") {
            setShowPaywall(true);
        }

        const init = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                router.push("/login");
                return;
            }
            setUser(user);

            // Fetch all past itineraries
            const { data, error } = await supabase
                .from("saved_itineraries")
                .select("*")
                .eq("user_id", user.id)
                .order("created_at", { ascending: false });

            if (!error && data) {
                setPastTrips(data);

                // Count itineraries created THIS calendar month
                const now = new Date();
                const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
                const thisMonthCount = data.filter(
                    (trip) => trip.created_at >= startOfMonth
                ).length;
                setMonthlyCount(thisMonthCount);
            }
            setLoading(false);
        };
        init();
    }, [router]);

    const handleBuildNewTrip = () => {
        const bypassed = isUnlocked || sessionStorage.getItem("paywall_bypass") === "true";
        if (!bypassed && monthlyCount >= FREE_LIMIT) {
            setShowPaywall(true);
        } else {
            router.push("/setup");
        }
    };

    const handlePaywallUnlock = () => {
        setIsUnlocked(true);
        setShowPaywall(false);
        router.push("/setup");
    };

    const handleLoadTrip = (trip: SavedItinerary) => {
        saveTrip({
            tripType: trip.trip_type,
            destinations: trip.destinations,
            startDate: trip.start_date,
            endDate: trip.end_date,
            budget: trip.budget,
            interests: trip.interests,
            itinerary: trip.itinerary,
        });
        router.push("/itinerary");
    };

    const handleLogout = async () => {
        await supabase.auth.signOut();
        sessionStorage.removeItem("paywall_bypass");
        router.push("/");
    };

    const displayName = user?.user_metadata?.full_name
        || user?.email?.split("@")[0]
        || "Traveler";

    const tripsRemaining = Math.max(0, FREE_LIMIT - monthlyCount);
    const limitReached = !isUnlocked && monthlyCount >= FREE_LIMIT;

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <Loader2 className="h-8 w-8 text-indigo-600 animate-spin" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 text-gray-900">
            {/* Paywall Modal */}
            {showPaywall && <PaywallModal onUnlock={handlePaywallUnlock} />}

            {/* Hero Header */}
            <div className="relative overflow-hidden bg-gradient-to-br from-violet-600 via-purple-600 to-pink-500 pb-16 pt-12 px-6">
                {/* Decorative blobs */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
                <div className="absolute bottom-0 left-0 w-48 h-48 bg-pink-400/20 rounded-full translate-y-1/2 -translate-x-1/2 blur-2xl" />

                {/* Top bar */}
                <div className="relative flex items-center justify-between mb-10 max-w-lg mx-auto">
                    <div className="flex items-center gap-2">
                        <div className="w-9 h-9 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                            <Plane size={18} className="text-white" />
                        </div>
                        <span className="text-white font-bold text-lg tracking-tight">TripPilot AI</span>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-1.5 text-white/70 hover:text-white text-sm transition-colors"
                    >
                        <LogOut size={16} />
                        <span>Sign out</span>
                    </button>
                </div>

                {/* Welcome text */}
                <div className="relative text-center max-w-lg mx-auto">
                    {user?.user_metadata?.avatar_url && (
                        <img
                            src={user.user_metadata.avatar_url}
                            alt={displayName}
                            className="w-16 h-16 rounded-full border-4 border-white/30 mx-auto mb-4 shadow-lg"
                        />
                    )}
                    <h1 className="text-3xl font-bold text-white mb-2">
                        Welcome back, {displayName}!
                    </h1>
                    {/* Dynamic subtext based on usage */}
                    {isUnlocked ? (
                        <p className="text-white/90 text-base font-medium">
                            ✨ Unlimited access active — plan as many trips as you like!
                        </p>
                    ) : limitReached ? (
                        <p className="text-white/90 text-base font-medium">
                            You've used all 5 free itineraries this month. Upgrade to continue!
                        </p>
                    ) : (
                        <p className="text-white/80 text-base">
                            Create up to{" "}
                            <span className="font-bold text-white">
                                {tripsRemaining} more {tripsRemaining === 1 ? "itinerary" : "itineraries"}
                            </span>{" "}
                            this month for free!
                        </p>
                    )}

                    {/* Usage pills */}
                    {!isUnlocked && (
                        <div className="flex items-center justify-center gap-1.5 mt-3">
                            {Array.from({ length: FREE_LIMIT }).map((_, i) => (
                                <div
                                    key={i}
                                    className={`h-2 rounded-full transition-all ${i < monthlyCount
                                        ? "w-6 bg-white"
                                        : "w-6 bg-white/30"
                                        }`}
                                />
                            ))}
                        </div>
                    )}
                </div>

                {/* Build a New Trip Card */}
                <div className="relative max-w-lg mx-auto mt-8">
                    <button
                        onClick={handleBuildNewTrip}
                        className={`w-full bg-white rounded-2xl p-5 flex items-center gap-4 shadow-xl transition-all text-left ${limitReached
                            ? "opacity-90 hover:shadow-2xl cursor-pointer"
                            : "hover:shadow-2xl hover:scale-[1.02] cursor-pointer"
                            }`}
                    >
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-lg shrink-0 ${limitReached
                            ? "bg-gradient-to-br from-gray-400 to-gray-500 shadow-gray-200"
                            : "bg-gradient-to-br from-indigo-500 to-purple-600 shadow-indigo-200"
                            }`}>
                            {limitReached
                                ? <Lock size={22} className="text-white" />
                                : <PlusCircle size={22} className="text-white" />
                            }
                        </div>
                        <div className="flex-1">
                            <p className="font-bold text-gray-900 text-lg">Build a New Trip</p>
                            <p className="text-gray-500 text-sm">
                                {limitReached
                                    ? "Upgrade to unlock unlimited planning"
                                    : "Let AI plan your perfect itinerary"}
                            </p>
                        </div>
                        <ChevronRight size={20} className="text-gray-400" />
                    </button>
                </div>
            </div>

            {/* Past Itineraries */}
            <div className="max-w-lg mx-auto px-4 py-8">
                <h2 className="text-xl font-bold text-gray-900 mb-5">
                    {pastTrips.length > 0 ? "Your Past Itineraries" : "No trips yet"}
                </h2>

                {pastTrips.length === 0 ? (
                    <div className="text-center py-16">
                        <div className="w-20 h-20 bg-indigo-50 rounded-full flex items-center justify-center mx-auto mb-4">
                            <MapPin size={32} className="text-indigo-400" />
                        </div>
                        <p className="text-gray-500 text-lg font-medium">No trips planned yet</p>
                        <p className="text-gray-400 text-sm mt-1">Build your first trip to get started!</p>
                        <button
                            onClick={handleBuildNewTrip}
                            className="mt-6 bg-indigo-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200"
                        >
                            Plan My First Trip
                        </button>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {pastTrips.map((trip) => (
                            <button
                                key={trip.id}
                                onClick={() => handleLoadTrip(trip)}
                                className="w-full bg-white rounded-2xl p-4 flex items-center gap-4 shadow-sm border border-gray-100 hover:shadow-md hover:border-indigo-100 transition-all text-left group"
                            >
                                <img
                                    src={getDestinationImage(trip.destinations)}
                                    alt={trip.destinations[0]}
                                    className="w-16 h-16 rounded-xl object-cover shrink-0"
                                />
                                <div className="flex-1 min-w-0">
                                    <p className="font-bold text-gray-900 truncate">
                                        {trip.destinations.join(", ")}
                                    </p>
                                    <p className="text-sm text-gray-500 mt-0.5">
                                        {formatDate(trip.start_date)} – {formatDate(trip.end_date)}
                                    </p>
                                    {trip.interests?.length > 0 && (
                                        <div className="flex flex-wrap gap-1.5 mt-2">
                                            {trip.interests.slice(0, 3).map((tag) => (
                                                <span
                                                    key={tag}
                                                    className={`text-xs font-semibold px-2 py-0.5 rounded-full ${getTagColor(tag)}`}
                                                >
                                                    {tag}
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                </div>
                                <ChevronRight
                                    size={20}
                                    className="text-gray-300 group-hover:text-indigo-500 transition-colors shrink-0"
                                />
                            </button>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

// ── Skeleton shown while Suspense resolves ────────────────────────────────
function DashboardSkeleton() {
    return (
        <div className="min-h-screen bg-gray-50">
            <div className="bg-gradient-to-br from-violet-600 to-pink-500 pb-16 pt-12 px-6">
                <div className="max-w-lg mx-auto space-y-4">
                    <div className="h-8 w-32 bg-white/20 rounded-xl animate-pulse" />
                    <div className="h-10 w-64 bg-white/20 rounded-xl animate-pulse mx-auto" />
                    <div className="mt-8 bg-white rounded-2xl p-5 flex items-center gap-4 shadow-xl">
                        <div className="w-12 h-12 rounded-xl bg-gray-100 animate-pulse" />
                        <div className="flex-1 space-y-2">
                            <div className="h-5 w-32 bg-gray-100 rounded animate-pulse" />
                            <div className="h-4 w-48 bg-gray-50 rounded animate-pulse" />
                        </div>
                    </div>
                </div>
            </div>
            <div className="max-w-lg mx-auto px-4 py-8 space-y-4">
                {[1, 2, 3].map(i => (
                    <div key={i} className="bg-white rounded-2xl p-4 flex items-center gap-4 shadow-sm border border-gray-100">
                        <div className="w-16 h-16 rounded-xl bg-gray-100 animate-pulse shrink-0" />
                        <div className="flex-1 space-y-2">
                            <div className="h-4 w-40 bg-gray-100 rounded animate-pulse" />
                            <div className="h-3 w-32 bg-gray-50 rounded animate-pulse" />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

// ── Public export – safe for static pre-rendering ─────────────────────────
export default function DashboardPage() {
    return (
        <Suspense fallback={<DashboardSkeleton />}>
            <DashboardInner />
        </Suspense>
    );
}
