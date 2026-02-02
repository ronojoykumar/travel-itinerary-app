"use client";

import { Header } from "@/components/Header";
import { BudgetSlider } from "@/components/BudgetSlider";
import { TripPaceSlider } from "@/components/TripPaceSlider";
import { ActivitySwapCard } from "@/components/ActivitySwapCard";
import { AISuggestions } from "@/components/AISuggestions";
import { FinalizePreviewModal } from "@/components/FinalizePreviewModal";
import { ArrowLeft, ArrowRight } from "lucide-react";
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

    useEffect(() => {
        if (tripData) {
            setBudget(tripData.budget || 1500);
        }
    }, [tripData]);

    if (!isLoaded || !tripData || !tripData.itinerary) {
        return <div className="min-h-screen bg-gray-50 flex items-center justify-center">Loading...</div>;
    }

    // Extract activities from itinerary
    const activities = tripData.itinerary.filter(item => item.type === "activity");

    const handleActivitySwap = (originalActivity: any, newActivity: any) => {
        setSwappedActivities(prev => ({
            ...prev,
            [originalActivity.title]: newActivity
        }));
    };

    const handleFinalize = async () => {
        setLoading(true);
        try {
            const response = await fetch('/api/rejig-itinerary', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    originalItinerary: tripData.itinerary,
                    swappedActivities,
                    newBudget: budget,
                    originalBudget: tripData.budget,
                    pace: pace === 1 ? 'relaxed' : pace === 3 ? 'packed' : 'moderate'
                }),
            });

            if (response.ok) {
                const data = await response.json();
                setUpdatedItinerary(data.itinerary);
                setShowPreview(true);
            } else {
                alert('Failed to update itinerary');
            }
        } catch (error) {
            console.error('Error finalizing:', error);
            alert('Error updating itinerary');
        } finally {
            setLoading(false);
        }
    };

    const handleConfirm = () => {
        // Save updated itinerary
        saveTrip({ itinerary: updatedItinerary, budget });
        router.push('/briefing');
    };

    const budgetChange = budget - (tripData.budget || 1500);

    return (
        <div className="min-h-screen bg-gray-50 pb-48">
            <Header hideCta={true} />

            <main className="container mx-auto px-4 pt-32 max-w-4xl">
                <div className="mb-8">
                    <Link href="/booking" className="inline-flex items-center text-sm text-gray-500 hover:text-gray-900 mb-4 cursor-pointer">
                        <ArrowLeft size={16} className="mr-1" /> Back
                    </Link>
                    <h1 className="text-3xl font-bold">Customize Your Itinerary</h1>
                    <p className="text-gray-600">Adjust preferences and AI will re-optimize</p>
                </div>

                <BudgetSlider initialValue={tripData.budget} onChange={setBudget} />
                <TripPaceSlider initialValue={2} onChange={setPace} />

                <div className="mt-8">
                    <h3 className="font-bold text-lg mb-4">Swap Activities</h3>
                    <p className="text-gray-500 text-sm mb-4">Replace activities you're not interested in</p>

                    {/* Horizontal scrolling container */}
                    <div className="overflow-x-auto pb-4">
                        <div className="flex gap-4" style={{ minWidth: 'min-content' }}>
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
                                            rating: item.data.rating
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
                    paceChange={pace === 1 ? 'relaxed' : pace === 3 ? 'packed' : 'moderate'}
                    destination={tripData.destinations[0]}
                />
            </main>

            <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-100 flex justify-center z-40">
                <div className="container max-w-4xl flex justify-end">
                    <button
                        onClick={handleFinalize}
                        disabled={loading}
                        className="bg-primary text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-primary/90 transition-all shadow-lg flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? 'Processing...' : 'Finalize & Preview'}
                        <ArrowRight size={20} />
                    </button>
                </div>
            </div>

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
