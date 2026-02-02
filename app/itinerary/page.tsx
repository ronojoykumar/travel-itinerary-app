"use client"

import { useState, useEffect } from "react"
import { ItineraryHero } from "@/components/itinerary/ItineraryHero"
import { DaySelector } from "@/components/itinerary/DaySelector"
import { TimelineItem } from "@/components/itinerary/TimelineItem"
import { TransportItem } from "@/components/itinerary/TransportItem"
import { ArrowRight, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { UserHeader } from "@/components/UserHeader"
import { useTrip } from "@/hooks/useTrip"
import { TransportOptions } from "@/components/itinerary/TransportOptions"
import { MealItem } from "@/components/itinerary/MealItem"

export default function ItineraryPage() {
    const { tripData, isLoaded, saveTrip } = useTrip()
    const [selectedDay, setSelectedDay] = useState(0)
    const [days, setDays] = useState<{ day: string; date: string }[]>([])

    // Selection state
    const [transportSelections, setTransportSelections] = useState<Record<string, any>>({})
    const [mealSelections, setMealSelections] = useState<Record<string, boolean>>({})

    // Calculate days on load
    useEffect(() => {
        if (tripData?.startDate && tripData?.endDate) {
            const start = new Date(tripData.startDate)
            const end = new Date(tripData.endDate)
            const dayList = []
            let current = new Date(start)
            let dayCount = 1

            while (current <= end) {
                dayList.push({
                    day: `Day ${dayCount}`,
                    date: current.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                })
                current.setDate(current.getDate() + 1)
                dayCount++
            }
            // Ensure at least one day if dates are same or invalid
            if (dayList.length === 0) dayList.push({ day: "Day 1", date: tripData.startDate })

            setDays(dayList)
        }
    }, [tripData])

    if (!isLoaded || !tripData) return null

    // Helper for title generation
    const getTripTitle = () => {
        const type = tripData.tripType === "Multi-City" ? "Multi-City" : "Weekend"
        const cleanDests = tripData.destinations.map(d => d.split(",")[0].trim()) // "Tokyo, Japan" -> "Tokyo"

        if (cleanDests.length === 1) {
            return `${cleanDests[0]} ${type} Adventure`
        } else if (cleanDests.length === 2) {
            return `${cleanDests[0]} & ${cleanDests[1]} ${type}`
        } else {
            return `${type} Adventure`
        }
    }

    const tripTitle = getTripTitle()
    const tripDates = `${new Date(tripData.startDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })} - ${new Date(tripData.endDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })}`

    // Filter items for the selected day (Day 1, Day 2...)
    const currentDayNum = selectedDay + 1
    const schedule = tripData.itinerary?.filter(item => item.day === currentDayNum) || []

    // Calculate total cost across ALL days
    const calculateTotalCost = () => {
        let total = 0;

        // Get all itinerary items (not just current day)
        const allItems = tripData.itinerary || [];

        // Add activity costs
        allItems.forEach(item => {
            if (item.type === "activity" && item.data.price) {
                const priceStr = item.data.price.toString();
                const numPrice = parseFloat(priceStr.replace(/[^0-9.]/g, ''));
                if (!isNaN(numPrice)) total += numPrice;
            }
        });

        // Add selected transport costs
        Object.values(transportSelections).forEach((selection: any) => {
            if (selection?.price) total += selection.price;
        });

        // Add selected meal costs
        allItems.forEach(item => {
            if (item.type === "meal") {
                const mealKey = `${item.day}-${item.data.mealType}`;
                if (mealSelections[mealKey] && item.data.price) {
                    total += item.data.price;
                }
            }
        });

        return Math.round(total);
    };

    // Copy itinerary to clipboard
    const handleCopyItinerary = () => {
        const allItems = tripData.itinerary || [];
        let text = `${tripTitle}\n${tripDates}\n\n`;

        // Group by day
        const dayGroups: Record<number, any[]> = {};
        allItems.forEach(item => {
            if (!dayGroups[item.day]) dayGroups[item.day] = [];
            dayGroups[item.day].push(item);
        });

        Object.keys(dayGroups).sort((a, b) => Number(a) - Number(b)).forEach(dayNum => {
            text += `Day ${dayNum}\n`;
            text += `${"=".repeat(20)}\n`;

            dayGroups[Number(dayNum)].forEach(item => {
                if (item.type === "activity") {
                    text += `${item.data.time} - ${item.data.title}\n`;
                    text += `  ${item.data.location}\n`;
                    if (item.data.price) text += `  Price: $${item.data.price}\n`;
                } else if (item.type === "meal") {
                    text += `${item.data.mealType.toUpperCase()} - ${item.data.place}\n`;
                    text += `  ${item.data.location} - $${item.data.price}\n`;
                } else if (item.type === "transportOptions") {
                    text += `Transport: ${item.data.from} → ${item.data.to}\n`;
                }
                text += `\n`;
            });
            text += `\n`;
        });

        navigator.clipboard.writeText(text);
        alert("Itinerary copied to clipboard!");
    };

    // Download itinerary as PDF
    const handleDownloadPDF = () => {
        // Simple implementation using window.print
        // For a more sophisticated PDF, you'd use a library like jsPDF
        window.print();
    };

    return (
        <div className="min-h-screen bg-white pb-24">
            <UserHeader />

            {/* Extended Header Actions */}
            <div className="fixed top-4 left-4 z-50">
                <Link href="/setup" className="flex items-center gap-2 bg-white/80 backdrop-blur-md px-4 py-2 rounded-full border border-gray-100 shadow-sm text-sm font-medium hover:bg-white hover:shadow-md transition-all">
                    <ArrowLeft size={16} />
                    Edit Trip
                </Link>
            </div>

            <ItineraryHero
                destination={tripTitle}
                dates={tripDates}
                imageSrc="https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?q=80&w=1000&auto=format&fit=crop"
                onCopyItinerary={handleCopyItinerary}
                onDownloadPDF={handleDownloadPDF}
            />

            <DaySelector
                days={days}
                selectedDay={selectedDay}
                onSelect={setSelectedDay}
            />

            <div className="p-4 max-w-lg mx-auto">
                <div className="space-y-2 mt-4">
                    <div className="flex justify-between items-center px-2 pb-2">
                        <h2 className="text-lg font-bold text-slate-900">
                            {selectedDay === 0 ? "Arrival" : `Exploring ${tripData.destinations[0].split(",")[0]}`}
                        </h2>
                        <span className="text-[10px] font-bold bg-indigo-100 text-indigo-600 px-2 py-1 rounded uppercase tracking-wider">
                            {tripData.tripType}
                        </span>
                    </div>

                    {schedule.length > 0 ? (
                        schedule.map((item, i) => {
                            // Render transport options
                            if (item.type === "transportOptions" && item.data.options) {
                                const key = `${item.day}-${item.data.from}-${item.data.to}`;
                                return (
                                    <TransportOptions
                                        key={i}
                                        from={item.data.from}
                                        to={item.data.to}
                                        options={item.data.options}
                                        selected={transportSelections[key]}
                                        onSelect={(option) => {
                                            setTransportSelections(prev => ({ ...prev, [key]: option }));
                                        }}
                                    />
                                );
                            }

                            // Render meals
                            if (item.type === "meal") {
                                const mealKey = `${item.day}-${item.data.mealType}`;
                                return (
                                    <MealItem
                                        key={i}
                                        mealType={item.data.mealType}
                                        place={item.data.place}
                                        location={item.data.location}
                                        price={item.data.price}
                                        isSelected={!!mealSelections[mealKey]}
                                        onToggle={() => {
                                            setMealSelections(prev => ({
                                                ...prev,
                                                [mealKey]: !prev[mealKey]
                                            }));
                                        }}
                                    />
                                );
                            }

                            // Render transport (old format)
                            if (item.type === "transport") {
                                return (
                                    // @ts-ignore
                                    <TransportItem key={i} {...item.data} />
                                );
                            }

                            // Render activities
                            return (
                                // @ts-ignore
                                <TimelineItem key={i} {...item.data} />
                            );
                        })
                    ) : (
                        <div className="text-center py-10 text-slate-400">
                            <p>No activities planned for this day yet.</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Floating CTA */}
            <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-slate-100 z-50">
                <div className="max-w-lg mx-auto flex items-center justify-between gap-4">
                    <div className="flex flex-col">
                        <span className="text-xs text-slate-500 font-medium">ESTIMATED COST</span>
                        <span className="text-xl font-bold text-slate-900">${calculateTotalCost()}</span>
                    </div>
                    <Link href="/booking" className="flex-1">
                        <button className="w-full bg-indigo-600 text-white font-bold py-3 rounded-xl shadow-lg shadow-indigo-200 active:scale-[0.98] transition-transform flex items-center justify-center gap-2">
                            Review & Book
                            <ArrowRight className="h-4 w-4" />
                        </button>
                    </Link>
                </div>
            </div>
        </div>
    )
}
