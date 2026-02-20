"use client"

import { useState, useEffect } from "react"
import { ItineraryHero } from "@/components/itinerary/ItineraryHero"
import { DaySelector } from "@/components/itinerary/DaySelector"
import { TimelineItem } from "@/components/itinerary/TimelineItem"
import { TransportItem } from "@/components/itinerary/TransportItem"
import { LocationBanner } from "@/components/itinerary/LocationBanner"
import { ArrowRight, ArrowLeft, CheckCircle2 } from 'lucide-react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { UserHeader } from "@/components/UserHeader"
import { useTrip } from "@/hooks/useTrip"
import { useCurrencyRates, toINR, formatINR } from "@/hooks/useCurrencyRates"
import { TransportOptions } from "@/components/itinerary/TransportOptions"
import { MealItem } from "@/components/itinerary/MealItem"

export default function ItineraryPage() {
    const { tripData, isLoaded, saveTrip } = useTrip()
    const { rates } = useCurrencyRates()
    const router = useRouter()
    const searchParams = useSearchParams()
    const [selectedDay, setSelectedDay] = useState(0)
    const [days, setDays] = useState<{ day: string; date: string }[]>([])
    const [showSavedToast, setShowSavedToast] = useState(false)

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

        // Auto-select the most practical transport option for every route
        // "Most practical" = the cheapest option (best value for the traveller).
        // Only seed selections that haven't been manually chosen yet.
        if (tripData?.itinerary) {
            const autoSelections: Record<string, any> = {}
            tripData.itinerary.forEach((item: any) => {
                if (item.type === "transportOptions" && item.data?.options?.length > 0) {
                    const key = `${item.day}-${item.data.from}-${item.data.to}`
                    // Pick cheapest option
                    const cheapest = [...item.data.options].sort(
                        (a: any, b: any) => (a.price ?? 0) - (b.price ?? 0)
                    )[0]
                    autoSelections[key] = cheapest
                }
            })
            // Merge: only set keys that user hasn't already touched
            setTransportSelections(prev => ({ ...autoSelections, ...prev }))
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

    // Calculate total cost across ALL days, converted to INR
    const calculateTotalCost = () => {
        let totalUsd = 0;
        const allItems = tripData.itinerary || [];

        allItems.forEach(item => {
            if (item.type === "activity" && item.data.price) {
                const priceStr = item.data.price.toString();
                const numPrice = parseFloat(priceStr.replace(/[^0-9.]/g, ''));
                if (!isNaN(numPrice)) totalUsd += numPrice;
            }
        });

        Object.values(transportSelections).forEach((selection: any) => {
            if (selection?.price) totalUsd += selection.price;
        });

        allItems.forEach(item => {
            if (item.type === "meal") {
                const mealKey = `${item.day}-${item.data.mealType}`;
                if (mealSelections[mealKey] && item.data.price) {
                    totalUsd += item.data.price;
                }
            }
        });

        // Convert total to INR using USD rate
        const inrTotal = toINR(totalUsd, rates);
        return formatINR(inrTotal);
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
        <div className="min-h-screen pb-24 text-slate-900" style={{ backgroundColor: "#F8F9FA" }}>
            <UserHeader />

            {/* Changes-saved toast (shown after returning from customize) */}
            {showSavedToast && (
                <div
                    className="fixed top-5 left-1/2 -translate-x-1/2 z-[100] flex items-center gap-2.5 px-5 py-3 rounded-2xl shadow-xl text-white text-sm font-bold animate-fade-in"
                    style={{ background: "linear-gradient(135deg,#00B894,#55efc4)", boxShadow: "0 8px 24px rgba(0,184,148,0.35)" }}
                >
                    <CheckCircle2 className="h-4.5 w-4.5" />
                    Changes saved! Heading to booking…
                </div>
            )}


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
                <div className="space-y-1 mt-4">
                    {/* Dynamic country-aware banner */}
                    <LocationBanner
                        dayItems={schedule}
                        dayNumber={selectedDay + 1}
                    />

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
                                        rates={rates}
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
                                        rates={rates}
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
                                <TimelineItem
                                    key={i}
                                    {...item.data}
                                    rates={rates}
                                />
                            );
                        })
                    ) : (
                        <div className="text-center py-10 text-slate-400">
                            <p>No activities planned for this day yet.</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Glassmorphism Booking Bar */}
            <div
                className="fixed bottom-0 left-0 right-0 z-50"
                style={{
                    background: "rgba(255, 255, 255, 0.72)",
                    backdropFilter: "blur(20px) saturate(180%)",
                    WebkitBackdropFilter: "blur(20px) saturate(180%)",
                    borderTop: "1px solid rgba(255,255,255,0.6)",
                    boxShadow: "0 -8px 32px rgba(0,0,0,0.06)",
                }}
            >
                <div className="max-w-lg mx-auto px-4 py-3 flex items-center justify-between gap-4">
                    <div className="flex flex-col">
                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Est. Cost</span>
                        <span className="text-2xl font-black text-slate-900 tracking-tight">{calculateTotalCost()}</span>
                    </div>
                    <Link href="/customize" className="flex-1">
                        <button
                            className="w-full text-white font-bold py-3.5 rounded-2xl transition-all active:scale-[0.98] flex items-center justify-center gap-2"
                            style={{
                                background: "linear-gradient(135deg, #6C5CE7 0%, #a78bfa 100%)",
                                boxShadow: "0 4px 20px rgba(108, 92, 231, 0.35)",
                            }}
                        >
                            Customize & Book
                            <ArrowRight className="h-4 w-4" />
                        </button>
                    </Link>
                </div>
            </div>
        </div>
    )
}
