"use client";

import { Plane, ExternalLink, CheckCircle2, TrendingDown, PlusCircle } from "lucide-react";
import { ExchangeRates, toINR, formatINR } from "@/hooks/useCurrencyRates";

interface FlightProvider {
    name: string;
    priceUsd: number;
    badge?: string;
    url: string;
}

interface FlightCardProps {
    from: string;
    to: string;
    date: string;
    returnDate?: string;
    rates: ExchangeRates;
    selectedProvider?: string;
    onSelect: (provider: FlightProvider | null) => void;
}

function buildProviders(from: string, to: string, date: string): FlightProvider[] {
    const q = encodeURIComponent(`flights from ${from} to ${to}`);
    return [
        {
            name: "Google Flights",
            priceUsd: 420,
            badge: "Best Value",
            url: `https://www.google.com/travel/flights?q=${q}&hl=en`,
        },
        {
            name: "Skyscanner",
            priceUsd: 445,
            url: `https://www.skyscanner.net/transport/flights/${encodeURIComponent(from)}/${encodeURIComponent(to)}/${date.replace(/-/g, "")}`,
        },
        {
            name: "Expedia",
            priceUsd: 468,
            url: `https://www.expedia.com/Flights-Search?trip=roundtrip&leg1=from:${encodeURIComponent(from)},to:${encodeURIComponent(to)},departure:${date}TANYT`,
        },
    ];
}

export function FlightCard({ from, to, date, rates, selectedProvider, onSelect }: FlightCardProps) {
    const providers = buildProviders(from, to, date);

    return (
        <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden mb-4"
            style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.05)" }}>
            <div className="px-4 py-3 border-b border-slate-50 flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-blue-50 flex items-center justify-center">
                    <Plane className="h-4 w-4 text-blue-500" />
                </div>
                <div>
                    <p className="font-bold text-slate-900 text-sm">{from} → {to}</p>
                    <p className="text-xs text-slate-400">{new Date(date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</p>
                </div>
                <div className="ml-auto flex items-center gap-1 text-xs text-emerald-600 font-semibold bg-emerald-50 px-2 py-1 rounded-full">
                    <TrendingDown className="h-3 w-3" />
                    Int'l Route
                </div>
            </div>
            <div className="p-3 space-y-2">
                {providers.map((p) => {
                    const inr = toINR(p.priceUsd, rates);
                    const isSelected = selectedProvider === p.name;
                    return (
                        <button
                            key={p.name}
                            onClick={() => onSelect(isSelected ? null : p)}
                            className="w-full flex items-center gap-3 p-3 rounded-xl border-2 transition-all text-left"
                            style={{
                                borderColor: isSelected ? "#6C5CE7" : "transparent",
                                background: isSelected ? "#F5F3FF" : "#F8F9FA",
                                boxShadow: isSelected ? "0 0 0 1px #6C5CE730" : "none",
                            }}
                        >
                            <div className="flex-1">
                                <div className="flex items-center gap-2">
                                    <span className="text-sm font-bold text-slate-800">{p.name}</span>
                                    {p.badge && (
                                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-violet-100 text-violet-700 uppercase tracking-wide">{p.badge}</span>
                                    )}
                                </div>
                                <p className="text-xs text-slate-400 mt-0.5">~est. price · opens provider site</p>
                            </div>
                            <div className="text-right">
                                <p className="text-base font-black text-slate-900">{formatINR(inr)}</p>
                                <p className="text-[10px] text-slate-400">${p.priceUsd} USD</p>
                            </div>
                            {isSelected
                                ? <CheckCircle2 className="h-5 w-5 text-violet-600 shrink-0" />
                                : <PlusCircle className="h-4 w-4 text-slate-300 shrink-0" />
                            }
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
