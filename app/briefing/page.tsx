"use client";

import { Header } from "@/components/Header";
import { PackingChecklist } from "@/components/PackingChecklist";
import { WeatherForecast } from "@/components/WeatherForecast";
import { SafetyTips } from "@/components/SafetyTips";
import { CulturalGuidance } from "@/components/CulturalGuidance";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useTrip } from "@/hooks/useTrip";

export default function BriefingPage() {
    const { tripData, isLoaded } = useTrip();

    if (!isLoaded || !tripData) {
        return <div className="min-h-screen bg-gray-50 flex items-center justify-center text-gray-900">Loading...</div>;
    }

    return (
        <div className="min-h-screen bg-gray-50 pb-32 text-gray-900">
            <Header hideCta={true} />

            <main className="container mx-auto px-4 pt-24 max-w-4xl">
                <div className="mb-8 flex items-center gap-4">
                    <Link href="/customize" className="bg-white p-2 rounded-full hover:bg-gray-100 transition-colors border border-gray-200 text-gray-600">
                        <ArrowLeft size={20} />
                    </Link>
                    <div>
                        <h1 className="text-3xl font-bold">Pre-Trip Briefing</h1>
                        <p className="text-gray-600">Everything you need before departure</p>
                    </div>
                    <Link
                        href="/live"
                        className="ml-auto bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-blue-700 transition-colors hidden md:block"
                    >
                        Start Trip Mode →
                    </Link>
                </div>

                <PackingChecklist
                    destinations={tripData.destinations}
                    startDate={tripData.startDate}
                    endDate={tripData.endDate}
                    tripType={tripData.tripType}
                    interests={tripData.interests}
                />

                <div className="grid md:grid-cols-2 gap-6">
                    <WeatherForecast
                        destinations={tripData.destinations}
                        startDate={tripData.startDate}
                        endDate={tripData.endDate}
                    />
                    <SafetyTips destination={tripData.destinations[0]} />
                </div>

                <CulturalGuidance destination={tripData.destinations[0]} />

                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 rounded-2xl p-8 text-center mb-12">
                    <div className="text-3xl mb-2">🎉</div>
                    <h3 className="text-xl font-bold text-blue-900 mb-2">You're All Set!</h3>
                    <p className="text-blue-800/80 mb-6 max-w-lg mx-auto">
                        When you're ready to start your trip, activate Live Trip Mode for real-time assistance
                    </p>
                    <Link
                        href="/live"
                        className="inline-block bg-blue-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-blue-700 transition-shadow shadow-lg shadow-blue-200"
                    >
                        Start Trip Mode →
                    </Link>
                </div>

            </main>
        </div>
    );
}
