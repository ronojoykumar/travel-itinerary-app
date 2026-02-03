"use client";

import { Header } from "@/components/Header";
import { BookingCard } from "@/components/BookingCard";
import { ArrowLeft, ArrowRight } from "lucide-react";
import Link from "next/link";
import { useTrip } from "@/hooks/useTrip";
import { useState, useEffect } from "react";

export default function BookingPage() {
    const { tripData, isLoaded } = useTrip();
    const [totalCost, setTotalCost] = useState(0);
    const [costDescription, setCostDescription] = useState("");

    useEffect(() => {
        if (!tripData || !tripData.itinerary) return;

        // Calculate total cost from itinerary
        let total = 0;
        const allItems = tripData.itinerary || [];

        allItems.forEach(item => {
            if (item.type === "activity" && item.data.price) {
                const priceStr = item.data.price.toString();
                const numPrice = parseFloat(priceStr.replace(/[^0-9.]/g, ''));
                if (!isNaN(numPrice)) total += numPrice;
            }
            if (item.type === "meal" && item.data.price) {
                total += item.data.price;
            }
        });

        setTotalCost(Math.round(total));

        // Generate dynamic description
        const activityCount = allItems.filter(i => i.type === "activity").length;
        const mealCount = allItems.filter(i => i.type === "meal").length;
        const transportCount = allItems.filter(i => i.type === "transportOptions").length;

        const start = new Date(tripData.startDate);
        const end = new Date(tripData.endDate);
        const nightCount = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));

        let desc = "";
        if (transportCount > 0) desc += "Transport + ";
        if (nightCount > 0) desc += `${nightCount} nights accommodation + `;
        if (activityCount > 0) desc += `${activityCount} activities + `;
        if (mealCount > 0) desc += `${mealCount} meals`;

        // Clean up trailing " + "
        desc = desc.replace(/\s\+\s$/, '');

        setCostDescription(desc);
    }, [tripData]);

    if (!isLoaded || !tripData) {
        return <div className="min-h-screen bg-gray-50 flex items-center justify-center text-gray-900">Loading...</div>;
    }

    const budgetDifference = tripData.budget - totalCost;
    const isUnderBudget = budgetDifference >= 0;

    return (
        <div className="min-h-screen bg-gray-50 pb-32 relative overflow-hidden text-gray-900">
            {/* Watermark */}
            <div className="fixed inset-0 flex items-center justify-center pointer-events-none z-0">
                <div className="text-gray-200 text-9xl font-bold -rotate-45 opacity-20 select-none whitespace-nowrap">
                    DUMMY DATA
                </div>
            </div>

            <Header hideCta={true} />

            <main className="container mx-auto px-4 pt-24 max-w-4xl relative z-10">
                <div className="mb-8">
                    <Link href="/itinerary" className="inline-flex items-center text-sm text-gray-500 hover:text-gray-900 mb-4 cursor-pointer">
                        <ArrowLeft size={16} className="mr-1" /> Back to Itinerary
                    </Link>
                    <h1 className="text-3xl font-bold">Book Your Trip</h1>
                    <p className="text-gray-600">Compare prices and book directly from partners</p>
                </div>

                {/* Flights Section */}
                <section className="mb-10">
                    <h2 className="text-xl font-bold mb-1">Flights</h2>
                    <p className="text-sm text-gray-500 mb-4">Tokyo Narita Airport</p>

                    <div className="grid md:grid-cols-3 gap-6">
                        <BookingCard
                            type="flight"
                            providerName="Expedia"
                            rating={4.5}
                            price="$850"
                            badge="Best Value"
                        />
                        <BookingCard
                            type="flight"
                            providerName="Kayak"
                            rating={4.3}
                            price="$875"
                        />
                        <BookingCard
                            type="flight"
                            providerName="Booking.com"
                            rating={4.6}
                            price="$920"
                        />
                    </div>
                </section>

                {/* Accommodation Section */}
                <section className="mb-10">
                    <h2 className="text-xl font-bold mb-1">Accommodation</h2>
                    <p className="text-sm text-gray-500 mb-4">Hotel Gracery Shinjuku</p>

                    <div className="grid md:grid-cols-3 gap-6">
                        <BookingCard
                            type="hotel"
                            providerName="Hotels.com"
                            rating={4.7}
                            price="$180"
                            priceSubtext="/night"
                            badge="Best Value"
                            title=""
                        />
                        <BookingCard
                            type="hotel"
                            providerName="Agoda"
                            rating={4.5}
                            price="$195"
                            priceSubtext="/night"
                        />
                        <BookingCard
                            type="hotel"
                            providerName="Booking.com"
                            rating={4.8}
                            price="$210"
                            priceSubtext="/night"
                            badge="Most Popular"
                        />
                    </div>
                </section>

                {/* Activities Section */}
                <section className="mb-10">
                    <h2 className="text-xl font-bold mb-1">Activities</h2>
                    <p className="text-sm text-gray-500 mb-4">teamLab Borderless Tickets</p>

                    <div className="grid md:grid-cols-3 gap-6">
                        <BookingCard
                            type="activity"
                            providerName="GetYourGuide"
                            rating={4.9}
                            price="$35"
                            badge="Best Value"
                        />
                        <BookingCard
                            type="activity"
                            providerName="Klook"
                            rating={4.7}
                            price="$38"
                        />
                        <BookingCard
                            type="activity"
                            providerName="Viator"
                            rating={4.6}
                            price="$42"
                        />
                    </div>
                </section>

            </main>

            <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-100 flex justify-center z-40">
                <div className="container max-w-4xl flex items-center justify-between">
                    <div>
                        <div className="text-sm font-bold text-gray-900">Estimated Total (Best Value Options)</div>
                        <div className="text-xs text-gray-500">{costDescription}</div>
                    </div>

                    <div className="text-right flex items-center gap-6">
                        <div>
                            <div className="text-2xl font-bold text-blue-600">${totalCost}</div>
                            <div className={`text-xs font-bold ${isUnderBudget ? 'text-green-600' : 'text-red-600'}`}>
                                {isUnderBudget
                                    ? `$${budgetDifference} under budget`
                                    : `$${Math.abs(budgetDifference)} over budget`}
                            </div>
                        </div>

                        <Link
                            href="/customize"
                            className="bg-primary text-white px-6 py-3 rounded-xl font-bold hover:bg-primary/90 transition-all shadow-lg flex items-center gap-2"
                        >
                            Customize Itinerary
                            <ArrowRight size={18} />
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
