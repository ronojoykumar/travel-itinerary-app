"use client";

import { ActiveTripHeader } from "@/components/ActiveTripHeader";
import { TransportOptions, ItineraryTransportOption } from "@/components/TransportOptions";
import { LocationTips } from "@/components/LocationTips";
import { ComingUpNext } from "@/components/ComingUpNext";
import { EmergencyContacts } from "@/components/EmergencyContacts";
import { Bot } from "lucide-react";
import Link from "next/link";
import { useTrip } from "@/hooks/useTrip";
import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export default function LiveTripPage() {
    // ✅ ALL hooks must be called unconditionally at the top
    const { tripData, isLoaded } = useTrip();
    const [currentStepIndex, setCurrentStepIndex] = useState(-1); // -1 = Arrival/Airport
    const router = useRouter();

    // ✅ Early returns AFTER all hooks
    if (!isLoaded || !tripData) {
        return <div className="min-h-screen bg-gray-50 flex items-center justify-center text-gray-900">Loading...</div>;
    }

    const { itinerary, destinations } = tripData;
    const currentDestination = destinations[0] || "Unknown";

    // Virtual logic
    const isArrival = currentStepIndex === -1;
    const currentItem = isArrival ? {
        data: { title: "Arrival / Airport", location: "Airport" },
        day: 1,
        date: tripData.startDate
    } : itinerary[currentStepIndex];

    // Safety check
    if (!currentItem && !isArrival) {
        return <div className="min-h-screen bg-gray-50 flex items-center justify-center text-gray-900">Trip Ended</div>;
    }

    const nextItemIndex = currentStepIndex + 1;
    const nextItem = itinerary[nextItemIndex];

    // Next location for Transport & Tips
    const nextLocationTitle = nextItem?.data?.title || "End of Trip";

    const comingUpItems = itinerary.slice(nextItemIndex + 1).filter((item: any) => item.day === currentItem.day);

    // ── Extract transport options for the current→next leg ───────────────────
    // Look for a transportOptions item on the same day, at or after the current step
    const currentDay = currentItem?.day ?? 1;
    const transportItem = itinerary
        .slice(Math.max(0, currentStepIndex))          // from current position onwards
        .find((it: any) => it.type === "transportOptions" && it.day === currentDay)
        ?? itinerary.find((it: any) => it.type === "transportOptions" && it.day === currentDay); // fallback: any on same day

    const itineraryTransportOptions: ItineraryTransportOption[] | undefined =
        transportItem?.data?.options?.map((o: any) => ({
            type: o.type ?? "cab",
            provider: o.provider,
            duration: o.duration ? `${o.duration} min` : undefined,
            price: o.price,
            frequency: o.frequency,
        }));

    const transportFrom: string = transportItem?.data?.from ?? currentItem?.data?.location ?? "";
    const transportTo: string = transportItem?.data?.to ?? nextItem?.data?.location ?? nextLocationTitle;

    const handleNavigate = () => {
        if (nextItem) {
            setCurrentStepIndex(prev => prev + 1);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    const handleEmergencyScroll = () => {
        const element = document.getElementById('emergency-contacts');
        element?.scrollIntoView({ behavior: 'smooth' });
    };

    const handleLogout = async () => {
        await supabase.auth.signOut();
        router.push("/");
    };

    return (
        <div className="min-h-screen bg-gray-50 pb-32 text-gray-900">
            <ActiveTripHeader
                dayNumber={currentItem.day}
                title={currentItem.data.title || "Activity"}
                date={currentItem.date || `Day ${currentItem.day}`}
                onNavigate={handleNavigate}
                onEmergency={handleEmergencyScroll}
                onLogout={handleLogout}
            />

            <main className="container mx-auto px-4 pt-12 max-w-4xl relative z-0">
                {nextItem ? (
                    <TransportOptions
                        destination={transportTo || nextLocationTitle}
                        from={transportFrom}
                        itineraryOptions={itineraryTransportOptions}
                    />
                ) : (
                    <div className="bg-green-50 p-6 rounded-2xl border border-green-100 mb-6 text-center text-green-800 font-bold">
                        You've reached the end of your trip!
                    </div>
                )}

                {nextItem && (
                    <LocationTips
                        location={nextLocationTitle}
                        destination={currentDestination}
                        interests={tripData.interests}
                    />
                )}

                <ComingUpNext items={comingUpItems} />

                <EmergencyContacts destination={currentDestination} />

                <div className="bg-white rounded-2xl p-8 text-center border border-gray-100 shadow-sm mt-8">
                    <h3 className="font-bold text-lg mb-2">Need Help?</h3>
                    <p className="text-gray-500 text-sm mb-6 max-w-md mx-auto">Ask your AI assistant anything - from directions to restaurant recommendations</p>

                    <Link
                        href="/chat"
                        className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-blue-700 transition-colors"
                    >
                        <Bot size={18} />
                        Chat with AI Assistant
                    </Link>
                </div>
            </main>
        </div>
    );
}
