"use client";

import { Train, Car, Bus, ExternalLink, CheckCircle2 } from "lucide-react";
import { ExchangeRates, toINR, formatINR } from "@/hooks/useCurrencyRates";

type TransportMode = "train" | "cab" | "bus";

interface TransportProvider {
    name: string;
    priceUsd: number;
    badge?: string;
    url: string;
}

interface TransportBookingCardProps {
    from: string;
    to: string;
    modes: TransportMode[];        // what the itinerary actually has
    priceUsd?: number;             // cheapest option price from itinerary
    rates: ExchangeRates;
    selectedProvider?: string;
    onSelect: (provider: TransportProvider | null) => void;
}

const MODE_META: Record<TransportMode, { Icon: any; label: string; color: string; bg: string }> = {
    train: { Icon: Train, label: "Train", color: "#6C5CE7", bg: "#F5F3FF" },
    cab: { Icon: Car, label: "Cab", color: "#FF9F43", bg: "#FFF8F0" },
    bus: { Icon: Bus, label: "Bus", color: "#00B894", bg: "#F0FDF9" },
};

function buildProviders(from: string, to: string, modes: TransportMode[]): TransportProvider[] {
    const f = encodeURIComponent(from);
    const t = encodeURIComponent(to);
    const providers: TransportProvider[] = [];

    if (modes.includes("train")) {
        providers.push(
            { name: "12Go Asia", priceUsd: 18, badge: "Best Value", url: `https://12go.asia/en/travel/${f}/${t}` },
            { name: "JR Rail (Japan)", priceUsd: 28, url: "https://www.jrpass.com/" },
            { name: "KORAIL (Korea)", priceUsd: 22, url: "https://www.letskorail.com/ebizbf/EbizBfTicketSearch.do" },
        );
    }
    if (modes.includes("cab")) {
        providers.push(
            { name: "Uber", priceUsd: 35, badge: "Instant Book", url: `https://m.uber.com/looking?drop%5B0%5D[addressLine1]=${t}` },
            { name: "Grab", priceUsd: 30, badge: "Best Value", url: `https://www.grab.com/sg/transport/` },
        );
    }
    if (modes.includes("bus")) {
        providers.push(
            { name: "12Go Asia", priceUsd: 12, badge: "Best Value", url: `https://12go.asia/en/travel/${f}/${t}` },
            { name: "FlixBus", priceUsd: 15, url: `https://global.flixbus.com/` },
        );
    }

    // Deduplicate by name
    const seen = new Set<string>();
    return providers.filter(p => { const ok = !seen.has(p.name); seen.add(p.name); return ok; });
}

export function TransportBookingCard({ from, to, modes, rates, selectedProvider, onSelect }: TransportBookingCardProps) {
    const providers = buildProviders(from, to, modes);
    const primaryMode = modes[0] ?? "train";
    const meta = MODE_META[primaryMode];
    const { Icon } = meta;

    return (
        <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden mb-4"
            style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.05)" }}>
            {/* Header */}
            <div className="px-4 py-3 border-b border-slate-50 flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: meta.bg }}>
                    <Icon className="h-4 w-4" style={{ color: meta.color }} />
                </div>
                <div>
                    <p className="font-bold text-slate-900 text-sm">{from} → {to}</p>
                    <p className="text-xs text-slate-400">
                        {modes.map(m => MODE_META[m]?.label).join(" · ")} options
                    </p>
                </div>
            </div>

            {/* Providers */}
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
                                borderColor: isSelected ? meta.color : "transparent",
                                background: isSelected ? meta.bg : "#F8F9FA",
                                boxShadow: isSelected ? `0 0 0 1px ${meta.color}30` : "none",
                            }}
                        >
                            <div className="flex-1">
                                <div className="flex items-center gap-2">
                                    <span className="text-sm font-bold text-slate-800">{p.name}</span>
                                    {p.badge && (
                                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-emerald-100 text-emerald-700 uppercase tracking-wide">{p.badge}</span>
                                    )}
                                </div>
                                <p className="text-xs text-slate-400 mt-0.5">est. price · opens provider site</p>
                            </div>
                            <div className="text-right">
                                <p className="text-base font-black text-slate-900">{formatINR(inr)}</p>
                                <p className="text-[10px] text-slate-400">${p.priceUsd}</p>
                            </div>
                            {isSelected
                                ? <CheckCircle2 className="h-5 w-5 shrink-0" style={{ color: meta.color }} />
                                : <ExternalLink className="h-4 w-4 text-slate-300 shrink-0" />
                            }
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
