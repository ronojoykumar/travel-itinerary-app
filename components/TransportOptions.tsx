"use client";

import { Train, Car, Footprints, Bus, Plane, Sparkles, ExternalLink, MapPin } from "lucide-react";
import { useState, useEffect } from "react";
import { useCurrencyRates, toINR, formatINR } from "@/hooks/useCurrencyRates";

// ─── Types ─────────────────────────────────────────────────────────────────

/** A single option from the itinerary's transportOptions item */
export interface ItineraryTransportOption {
    type: "cab" | "train" | "bus" | "flight" | "walk";
    provider?: string;
    duration?: string;      // e.g. "45 min"
    price?: string | number; // USD
    frequency?: string;     // e.g. "Every 10 min"
}

interface TransportOptionsProps {
    destination: string;
    from?: string;
    /** Live itinerary transport options — if provided, used instead of hardcoded fallback */
    itineraryOptions?: ItineraryTransportOption[];
}

// ─── Helpers ───────────────────────────────────────────────────────────────

function iconForType(type: string) {
    switch (type) {
        case "train": return Train;
        case "bus": return Bus;
        case "flight": return Plane;
        case "walk": return Footprints;
        default: return Car;   // cab / taxi
    }
}

function labelForType(type: string): string {
    const MAP: Record<string, string> = {
        cab: "Taxi / Cab", train: "Train", bus: "Bus", flight: "Flight", walk: "Walk"
    };
    return MAP[type] ?? type.charAt(0).toUpperCase() + type.slice(1);
}

function providerForType(type: string, dest: string): string {
    const d = dest.toLowerCase();
    if (type === "train") {
        if (d.includes("japan") || d.includes("tokyo") || d.includes("osaka") || d.includes("kyoto"))
            return "JR / Tokyo Metro";
        if (d.includes("korea") || d.includes("seoul"))
            return "KORAIL / Seoul Metro";
        return "Local Rail";
    }
    if (type === "cab") return "Grab / Local Taxi";
    if (type === "bus") return "Local Bus";
    if (type === "flight") return "Regional Flights";
    return "On foot";
}

function deepLinkForType(type: string, from: string, to: string): string {
    if (type === "train" || type === "bus")
        return `https://12go.asia/en/travel/${encodeURIComponent(from)}/${encodeURIComponent(to)}`;
    if (type === "cab")
        return "https://www.grab.com/sg/transport/";
    if (type === "flight")
        return `https://www.google.com/travel/flights?q=${encodeURIComponent(`flights from ${from} to ${to}`)}`;
    return "#";
}

function priceUsd(raw: string | number | undefined): number {
    if (raw === undefined || raw === null) return 0;
    return parseFloat(String(raw).replace(/[^0-9.]/g, "")) || 0;
}

// ─── Hardcoded fallback (shown only if no itinerary data) ──────────────────

const FALLBACK_OPTIONS: ItineraryTransportOption[] = [
    { type: "train", provider: "Local Metro", duration: "15 min", price: 2, frequency: "Every 5 min" },
    { type: "cab", provider: "Taxi / Grab", duration: "12 min", price: 10, frequency: "Available now" },
    { type: "walk", provider: "Walking", duration: "40 min", price: 0, frequency: "Anytime" },
];

// ─── Component ────────────────────────────────────────────────────────────

export function TransportOptions({ destination, from = "", itineraryOptions }: TransportOptionsProps) {
    const [selected, setSelected] = useState<string | null>(null);
    const { rates } = useCurrencyRates();
    // Real durations from Google Maps: type → durationText
    const [liveDurations, setLiveDurations] = useState<Record<string, string>>({});
    const [durationsLoading, setDurationsLoading] = useState(false);

    const options = itineraryOptions?.length ? itineraryOptions : FALLBACK_OPTIONS;
    const isRealData = !!(itineraryOptions?.length);

    // Fetch real durations from Google Maps Distance Matrix
    useEffect(() => {
        if (!from || !destination) return;
        const types = [...new Set(options.map(o => o.type))];
        setDurationsLoading(true);
        fetch("/api/travel-duration", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ origin: from, destination, types }),
        })
            .then(r => r.json())
            .then(data => {
                if (data.durations?.length) {
                    const map: Record<string, string> = {};
                    data.durations.forEach((d: { type: string; durationText: string }) => {
                        if (d.durationText && d.durationText !== "–") map[d.type] = d.durationText;
                    });
                    setLiveDurations(map);
                }
            })
            .catch(() => { /* silently fall back to itinerary durations */ })
            .finally(() => setDurationsLoading(false));
    }, [from, destination]);

    return (
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm mb-6 text-gray-900">
            <div className="flex items-center gap-3 mb-5">
                <div className="bg-cyan-100 text-cyan-600 p-2 rounded-lg">
                    <Train size={24} />
                </div>
                <div>
                    <h3 className="font-bold text-lg">Transport to Next Location</h3>
                    <p className="text-gray-500 text-sm">
                        Options for getting to <strong>{destination}</strong>
                        {from && <span className="text-gray-400"> from {from}</span>}
                    </p>
                </div>
                {isRealData && (
                    <span className="ml-auto text-[10px] font-bold bg-emerald-50 text-emerald-600 px-2 py-1 rounded-full border border-emerald-100">
                        From your itinerary
                    </span>
                )}
            </div>

            <div className="flex gap-4 overflow-x-auto pb-2 snap-x">
                {options.map((option, idx) => {
                    const id = `${option.type}-${idx}`;
                    const isSelected = selected === id;
                    const isAiPick = idx === 0;
                    const Icon = iconForType(option.type);
                    const provider = option.provider || providerForType(option.type, destination);
                    const usd = priceUsd(option.price);
                    const isFree = option.type === "walk" || usd === 0;
                    const inrAmount = !isFree && usd > 0 ? toINR(usd, rates) : null;
                    const priceLabel = isFree ? "Free" : inrAmount ? formatINR(inrAmount) : `$${usd}`;
                    const link = deepLinkForType(option.type, from || destination, destination);

                    return (
                        <div
                            key={id}
                            onClick={() => setSelected(isSelected ? null : id)}
                            className={`min-w-[200px] rounded-xl p-4 relative snap-center cursor-pointer transition-all border-2 ${isSelected
                                ? "border-blue-600 bg-blue-50/50"
                                : isAiPick
                                    ? "border-blue-200 bg-blue-50 shadow-sm"
                                    : "border-gray-100 bg-white hover:border-gray-200"
                                }`}
                        >
                            {/* AI Pick badge — top right */}
                            {isAiPick && (
                                <div className="absolute top-0 right-0 bg-blue-500 text-white text-[10px] font-bold px-2 py-1 rounded-bl-lg rounded-tr-lg flex items-center gap-1">
                                    <Sparkles size={10} /> AI Pick
                                </div>
                            )}



                            <div className="flex items-center gap-2 mb-3">
                                <div className={`p-1.5 rounded-lg ${isSelected ? "bg-blue-200 text-blue-700" : "bg-gray-100 text-gray-700"}`}>
                                    <Icon size={16} />
                                </div>
                                <span className="font-bold text-sm">{labelForType(option.type)}</span>
                            </div>
                            <div className="text-xs text-gray-500 mb-4">{provider}</div>

                            <div className="space-y-1.5 text-sm mb-4">
                                {option.duration && (
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-500">Duration:</span>
                                        <span className="font-bold flex items-center gap-1">
                                            {liveDurations[option.type] ?? option.duration}
                                            {liveDurations[option.type] && (
                                                <span className="text-[9px] font-semibold text-emerald-600 bg-emerald-50 px-1 py-0.5 rounded flex items-center gap-0.5">
                                                    <MapPin size={8} />Maps
                                                </span>
                                            )}
                                            {durationsLoading && !liveDurations[option.type] && (
                                                <span className="text-[9px] text-gray-400 animate-pulse">fetching…</span>
                                            )}
                                        </span>
                                    </div>
                                )}
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Price:</span>
                                    <span className={`font-bold ${isFree ? "text-green-600" : "text-blue-600"}`}>
                                        {priceLabel}
                                    </span>
                                </div>
                                {option.frequency && (
                                    <div className="flex justify-between">
                                        <span className="text-gray-500">Next:</span>
                                        <span className="font-medium">{option.frequency}</span>
                                    </div>
                                )}
                            </div>

                            <div className="flex gap-2">
                                <button
                                    className={`flex-1 py-2 rounded-lg text-xs font-bold transition-colors ${isSelected
                                        ? "bg-blue-600 text-white"
                                        : "border border-gray-200 text-gray-600 hover:bg-gray-50"}`}
                                >
                                    {isSelected ? "Selected ✓" : `Choose ${labelForType(option.type)}`}
                                </button>
                                {link !== "#" && (
                                    <a
                                        href={link}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        onClick={e => e.stopPropagation()}
                                        className="p-2 rounded-lg border border-gray-200 text-gray-400 hover:text-blue-600 hover:border-blue-300 transition-colors"
                                    >
                                        <ExternalLink size={13} />
                                    </a>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>

            {!isRealData && (
                <p className="text-[10px] text-gray-400 mt-3">
                    ℹ️ No transport data in itinerary — showing estimated options
                </p>
            )}
        </div>
    );
}
