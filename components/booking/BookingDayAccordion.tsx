"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp, Plane, Building2, Ticket, Train } from "lucide-react";
import { ExchangeRates } from "@/hooks/useCurrencyRates";
import { FlightCard } from "./FlightCard";
import { HotelComparisonCard } from "./HotelComparisonCard";
import { ActivityProviderPills } from "./ActivityProviderPills";
import { TransportBookingCard } from "./TransportBookingCard";
import { motion, AnimatePresence } from "framer-motion";

type TransportMode = "train" | "cab" | "bus";

interface Activity {
    title: string;
    location: string;
    priceUsd: number;
}

interface BookingDayAccordionProps {
    dayNumber: number;
    date: string;
    isoDate: string;
    nextIsoDate: string;
    cityName: string;           // Actual city (e.g. "Tokyo" not "Japan")
    hotelName: string;          // Real hotel name from itinerary or fallback
    isInterCountry: boolean;    // Whether to show flight card
    transportModes: TransportMode[];   // ["train","bus"] etc. from itinerary
    transportFrom?: string;
    transportTo?: string;
    activities: Activity[];
    rates: ExchangeRates;
    flightSelection: Record<string, any>;
    hotelSelection: Record<string, any>;
    transportSelection: Record<string, any>;
    activitySelection: Record<string, string>;
    activityUrls: Record<string, string>;
    onFlightSelect: (dayKey: string, provider: any) => void;
    onHotelSelect: (dayKey: string, provider: any) => void;
    onTransportSelect: (dayKey: string, provider: any) => void;
    onActivitySelect: (activityTitle: string, providerName: string | null, priceUsd: number, url: string) => void;
}

export function BookingDayAccordion({
    dayNumber, date, isoDate, nextIsoDate, cityName, hotelName,
    isInterCountry, transportModes, transportFrom, transportTo,
    activities, rates,
    flightSelection, hotelSelection, transportSelection, activitySelection, activityUrls,
    onFlightSelect, onHotelSelect, onTransportSelect, onActivitySelect,
}: BookingDayAccordionProps) {
    const [open, setOpen] = useState(dayNumber === 1);
    const dayKey = isoDate;

    const hasTransportSection = (isInterCountry || transportModes.length > 0) && !!transportFrom && !!transportTo;
    const flightBooked = !!flightSelection[dayKey];
    const transportBooked = !!transportSelection[dayKey];
    const hotelBooked = !!hotelSelection[dayKey];
    const activitiesBookedCount = activities.filter(a => activitySelection[a.title]).length;

    // Status icons
    const statusIcons = [
        hasTransportSection && isInterCountry ? { emoji: "✈️", ok: flightBooked } : null,
        hasTransportSection && !isInterCountry ? { emoji: "🚆", ok: transportBooked } : null,
        { emoji: "🏨", ok: hotelBooked },
        activities.length > 0 ? { emoji: "🎟️", ok: activitiesBookedCount === activities.length } : null,
    ].filter(Boolean) as { emoji: string; ok: boolean }[];

    const bookedCount = (flightBooked || transportBooked ? 1 : 0) + (hotelBooked ? 1 : 0) + activitiesBookedCount;
    const totalCount = statusIcons.length + Math.max(0, activities.length - 1);

    return (
        <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden mb-3"
            style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.04)" }}>
            {/* Header */}
            <button
                onClick={() => setOpen(!open)}
                className="w-full flex items-center gap-3 px-4 py-4 text-left hover:bg-slate-50/50 transition-colors"
            >
                <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 font-black text-sm"
                    style={{
                        background: open ? "linear-gradient(135deg,#6C5CE7,#a78bfa)" : "#F0F0F5",
                        color: open ? "#fff" : "#6C5CE7"
                    }}
                >
                    {dayNumber}
                </div>

                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-bold text-slate-900 text-sm">Day {dayNumber} · {date}</p>
                        <div className="flex gap-1">
                            {statusIcons.map((ic, idx) => (
                                <span key={idx} className={`text-base leading-none transition-opacity ${ic.ok ? "opacity-100" : "opacity-25"}`}>
                                    {ic.emoji}
                                </span>
                            ))}
                        </div>
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5 truncate">
                        {cityName}
                        {hasTransportSection && transportFrom && transportTo
                            ? ` · ${transportFrom} → ${transportTo}` : ""}
                    </p>
                </div>

                <div className="text-[11px] font-semibold px-2 py-1 rounded-full shrink-0"
                    style={{ background: bookedCount > 0 ? "#EDE9FF" : "#F0F0F5", color: bookedCount > 0 ? "#6C5CE7" : "#999" }}>
                    {bookedCount}/{totalCount} selected
                </div>

                {open
                    ? <ChevronUp className="h-4 w-4 text-slate-400 shrink-0" />
                    : <ChevronDown className="h-4 w-4 text-slate-400 shrink-0" />}
            </button>

            {/* Expanded */}
            <AnimatePresence initial={false}>
                {open && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25, ease: "easeOut" }}
                        className="overflow-hidden"
                    >
                        <div className="px-4 pb-4 border-t border-slate-50">
                            {/* ── International Flight (only if cross-country) ── */}
                            {hasTransportSection && isInterCountry && (
                                <>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pt-4 pb-1 flex items-center gap-1.5">
                                        <Plane className="h-3 w-3" /> International Flight
                                    </p>
                                    <FlightCard
                                        from={transportFrom!}
                                        to={transportTo!}
                                        date={isoDate}
                                        rates={rates}
                                        selectedProvider={flightSelection[dayKey]?.name}
                                        onSelect={(p) => onFlightSelect(dayKey, p)}
                                    />
                                </>
                            )}

                            {/* ── Ground transport (train/cab/bus) ── */}
                            {hasTransportSection && !isInterCountry && transportModes.length > 0 && (
                                <>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pt-4 pb-1 flex items-center gap-1.5">
                                        <Train className="h-3 w-3" /> Ground Transport
                                    </p>
                                    <TransportBookingCard
                                        from={transportFrom!}
                                        to={transportTo!}
                                        modes={transportModes}
                                        rates={rates}
                                        selectedProvider={transportSelection[dayKey]?.name}
                                        onSelect={(p) => onTransportSelect(dayKey, p)}
                                    />
                                </>
                            )}

                            {/* ── Hotel ── */}
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pt-3 pb-1 flex items-center gap-1.5">
                                <Building2 className="h-3 w-3" /> Accommodation
                            </p>
                            <HotelComparisonCard
                                hotelName={hotelName}
                                destination={cityName}
                                checkIn={isoDate}
                                checkOut={nextIsoDate}
                                rates={rates}
                                selectedProvider={hotelSelection[dayKey]?.name}
                                onSelect={(p) => onHotelSelect(dayKey, p)}
                            />

                            {/* ── Activities ── */}
                            {activities.length > 0 && (
                                <>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pt-3 pb-1 flex items-center gap-1.5">
                                        <Ticket className="h-3 w-3" /> Activity Tickets
                                    </p>
                                    <ActivityProviderPills
                                        activities={activities}
                                        rates={rates}
                                        selectedMap={activitySelection}
                                        onSelect={onActivitySelect}
                                    />
                                </>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
