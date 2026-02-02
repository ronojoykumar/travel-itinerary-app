"use client";

import { TripTypeSelector } from "@/components/TripTypeSelector";
import { InterestSelector } from "@/components/InterestSelector";
import { UserHeader } from "@/components/UserHeader";

import { ArrowLeft, MapPin, Calendar } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { CalendarInput } from "@/components/CalendarInput";

import { useTrip } from "@/hooks/useTrip";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function SetupPage() {
    const { tripData, saveTrip, isLoaded } = useTrip();
    const router = useRouter();

    const [tripType, setTripType] = useState("Weekend");
    const [destinations, setDestinations] = useState<string[]>(["Tokyo, Japan"]);
    const [budget, setBudget] = useState(1500);
    const [startDate, setStartDate] = useState("02/14/2026");
    const [endDate, setEndDate] = useState("02/17/2026");
    const [interests, setInterests] = useState<string[]>(["Food", "Culture"]);

    // Load saved data when available
    useEffect(() => {
        if (isLoaded && tripData) {
            setTripType(tripData.tripType);
            setDestinations(tripData.destinations);
            setBudget(tripData.budget);
            setStartDate(tripData.startDate);
            setEndDate(tripData.endDate);
            if (tripData.interests) setInterests(tripData.interests);
        }
    }, [isLoaded, tripData]);

    const handleGenerate = () => {
        saveTrip({
            tripType,
            destinations,
            budget,
            startDate,
            endDate,
            interests
        });
        router.push("/processing");
    };

    const handleAddDestination = () => {
        setDestinations([...destinations, ""]);
    };

    const handleRemoveDestination = (index: number) => {
        const newDestinations = [...destinations];
        newDestinations.splice(index, 1);
        setDestinations(newDestinations);
    };

    const handleDestinationChange = (index: number, value: string) => {
        const newDestinations = [...destinations];
        newDestinations[index] = value;
        setDestinations(newDestinations);
    };

    const toggleInterest = (interest: string) => {
        if (interests.includes(interest)) {
            setInterests(interests.filter(i => i !== interest));
        } else {
            setInterests([...interests, interest]);
        }
    };

    if (!isLoaded) return <div className="min-h-screen bg-white flex items-center justify-center">Loading...</div>;

    return (
        <div className="min-h-screen bg-white pb-32">

            <UserHeader />

            <main className="container mx-auto px-4 pt-8 max-w-xl">
                <header className="mb-8 pt-4">
                    <Link href="/" className="inline-flex items-center text-sm text-gray-500 hover:text-gray-900 mb-6">
                        <ArrowLeft size={16} className="mr-1" /> Back
                    </Link>
                    <h1 className="text-2xl font-bold text-center mb-1">Let's Plan Your Trip</h1>
                    <p className="text-gray-500 text-center text-sm">Share your preferences and let AI do the rest</p>
                </header>

                <div className="bg-white rounded-2xl md:border md:border-gray-100 md:shadow-sm md:p-8">
                    <TripTypeSelector selected={tripType} onSelect={setTripType} />

                    <div className="mb-6">
                        <label className="block text-sm font-bold mb-2">Destination{tripType === "Multi-City" ? "s" : ""}</label>
                        <div className="space-y-3">
                            {destinations.map((dest, index) => (
                                <div key={index} className="relative flex items-center gap-2">
                                    <div className="relative flex-1">
                                        <MapPin size={18} className="absolute left-3 top-3.5 text-gray-400" />
                                        <input
                                            type="text"
                                            value={dest}
                                            onChange={(e) => handleDestinationChange(index, e.target.value)}
                                            placeholder="e.g. Kyoto, Japan"
                                            className="w-full bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-xl focus:ring-blue-500 focus:border-blue-500 block pl-10 p-3 font-medium"
                                        />
                                    </div>
                                    {tripType === "Multi-City" && index === destinations.length - 1 && (
                                        <button
                                            onClick={handleAddDestination}
                                            className="p-3 bg-blue-100 text-blue-600 rounded-xl hover:bg-blue-200 transition-colors"
                                            title="Add Destination"
                                        >
                                            <span className="text-lg font-bold leading-none">+</span>
                                        </button>
                                    )}
                                    {tripType === "Multi-City" && destinations.length > 1 && index !== destinations.length - 1 && (
                                        <button
                                            onClick={() => handleRemoveDestination(index)}
                                            className="p-3 text-red-400 hover:text-red-600 transition-colors"
                                            title="Remove Destination"
                                        >
                                            <span className="text-lg font-bold leading-none">×</span>
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-6">
                        <CalendarInput
                            label="Start Date"
                            value={startDate}
                            onChange={setStartDate}
                        />
                        <CalendarInput
                            label="End Date"
                            value={endDate}
                            onChange={setEndDate}
                        />
                    </div>

                    <div className="mb-8">
                        <div className="flex justify-between items-end mb-4">
                            <label className="block text-sm font-bold">Budget</label>
                            <span className="text-xl font-bold text-blue-600">${budget}</span>
                        </div>
                        <input
                            type="range"
                            min="500"
                            max="5000"
                            step="100"
                            value={budget}
                            onChange={(e) => setBudget(Number(e.target.value))}
                            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-black"
                        />
                        <div className="flex justify-between text-xs text-gray-400 mt-2 font-medium">
                            <span>$500</span>
                            <span>$5,000</span>
                        </div>
                    </div>

                    <InterestSelector selected={interests} onToggle={toggleInterest} />

                    <button
                        onClick={handleGenerate}
                        className="w-full bg-blue-600 text-white py-4 rounded-xl font-bold text-lg hover:bg-blue-700 transition-colors block text-center shadow-lg shadow-blue-200"
                    >
                        Generate Itinerary
                    </button>
                </div>
            </main>
        </div>
    );
}
