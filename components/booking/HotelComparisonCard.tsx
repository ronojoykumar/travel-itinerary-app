"use client";

import { Building2, CheckCircle2, Star, ExternalLink, PlusCircle } from "lucide-react";
import { ExchangeRates, toINR, formatINR } from "@/hooks/useCurrencyRates";

interface HotelProvider {
    name: string;
    pricePerNightUsd: number;
    badge?: string;
    url: string;
}

interface HotelComparisonCardProps {
    hotelName: string;        // ← actual name from itinerary (or city fallback)
    destination: string;      // city name for deep links
    checkIn: string;
    checkOut: string;
    rates: ExchangeRates;
    selectedProvider?: string;
    onSelect: (provider: (HotelProvider & { totalUsd: number }) | null) => void;
}

function buildHotelProviders(destination: string, checkIn: string, checkOut: string): HotelProvider[] {
    const dest = encodeURIComponent(destination);
    return [
        {
            name: "Agoda",
            pricePerNightUsd: 85,
            badge: "Best Value",
            url: `https://www.agoda.com/search?city=${dest}&checkIn=${checkIn}&checkOut=${checkOut}&rooms=1&adults=1`,
        },
        {
            name: "Booking.com",
            pricePerNightUsd: 92,
            badge: "Most Popular",
            url: `https://www.booking.com/search.html?ss=${dest}&checkin=${checkIn}&checkout=${checkOut}&group_adults=1&no_rooms=1`,
        },
        {
            name: "Hotels.com",
            pricePerNightUsd: 98,
            url: `https://www.hotels.com/search.do?destination-id=${dest}&q-check-in=${checkIn}&q-check-out=${checkOut}&q-rooms=1&q-room-0-adults=1`,
        },
    ];
}

export function HotelComparisonCard({ hotelName, destination, checkIn, checkOut, rates, selectedProvider, onSelect }: HotelComparisonCardProps) {
    const providers = buildHotelProviders(destination, checkIn, checkOut);
    const nights = Math.max(1, Math.round(
        (new Date(checkOut).getTime() - new Date(checkIn).getTime()) / 86400000
    ));

    return (
        <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden mb-4"
            style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.05)" }}>
            {/* Header */}
            <div className="px-4 py-3 border-b border-slate-50 flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-amber-50 flex items-center justify-center">
                    <Building2 className="h-4 w-4 text-amber-500" />
                </div>
                <div className="min-w-0 flex-1">
                    <p className="font-bold text-slate-900 text-sm truncate">{hotelName}</p>
                    <p className="text-xs text-slate-400">{nights} night{nights !== 1 ? "s" : ""} · {checkIn} → {checkOut}</p>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                    <Star className="h-3.5 w-3.5 text-amber-400 fill-amber-400" />
                    <span className="text-xs font-semibold text-slate-600">4.6 avg</span>
                </div>
            </div>

            {/* Provider comparison */}
            <div className="p-3 space-y-2">
                {providers.map((p) => {
                    const nightlyInr = toINR(p.pricePerNightUsd, rates);
                    const totalUsd = p.pricePerNightUsd * nights;
                    const totalInr = toINR(totalUsd, rates);
                    const isSelected = selectedProvider === p.name;

                    return (
                        <button
                            key={p.name}
                            onClick={() => onSelect(isSelected ? null : { ...p, totalUsd })}
                            className="w-full flex items-center gap-3 p-3 rounded-xl border-2 transition-all text-left"
                            style={{
                                borderColor: isSelected ? "#FF9F43" : "transparent",
                                background: isSelected ? "#FFF8F0" : "#F8F9FA",
                                boxShadow: isSelected ? "0 0 0 1px #FF9F4330" : "none",
                            }}
                        >
                            <div className="flex-1">
                                <div className="flex items-center gap-2">
                                    <span className="text-sm font-bold text-slate-800">{p.name}</span>
                                    {p.badge && (
                                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full uppercase tracking-wide ${p.badge === "Best Value" ? "bg-emerald-100 text-emerald-700" : "bg-blue-100 text-blue-700"
                                            }`}>{p.badge}</span>
                                    )}
                                </div>
                                <p className="text-xs text-slate-400 mt-0.5">{formatINR(nightlyInr)}/night · {nights} night{nights !== 1 ? "s" : ""}</p>
                            </div>
                            <div className="text-right">
                                <p className="text-base font-black text-slate-900">{formatINR(totalInr)}</p>
                                <p className="text-[10px] text-slate-400">${totalUsd} total</p>
                            </div>
                            {isSelected
                                ? <CheckCircle2 className="h-5 w-5 text-orange-500 shrink-0" />
                                : <PlusCircle className="h-4 w-4 text-slate-300 shrink-0" />
                            }
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
