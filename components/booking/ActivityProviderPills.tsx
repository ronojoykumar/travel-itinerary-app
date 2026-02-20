"use client";

import { Ticket, ExternalLink, CheckCircle2, PlusCircle } from "lucide-react";
import { ExchangeRates, toINR, formatINR } from "@/hooks/useCurrencyRates";

interface ActivityItem {
    title: string;
    location: string;
    priceUsd: number;
}

const PROVIDERS = [
    {
        name: "Klook",
        multiplier: 1,
        color: "#E74C3C",
        bg: "#FEF2F2",
        url: (a: string, l: string) => `https://www.klook.com/en-US/search/?query=${encodeURIComponent(`${a} ${l}`)}`,
    },
    {
        name: "GetYourGuide",
        multiplier: 1.08,
        color: "#FF6B35",
        bg: "#FFF3EF",
        url: (a: string, l: string) => `https://www.getyourguide.com/s/?q=${encodeURIComponent(`${a} ${l}`)}`,
    },
    {
        name: "Viator",
        multiplier: 1.15,
        color: "#1A936F",
        bg: "#F0FDF9",
        url: (a: string, l: string) => `https://www.viator.com/search/?text=${encodeURIComponent(`${a} ${l}`)}`,
    },
];

interface ActivityProviderPillsProps {
    activities: ActivityItem[];
    rates: ExchangeRates;
    selectedMap: Record<string, string>;
    onSelect: (activityTitle: string, providerName: string | null, priceUsd: number, url: string) => void;
}

export function ActivityProviderPills({ activities, rates, selectedMap, onSelect }: ActivityProviderPillsProps) {
    if (!activities.length) return null;

    return (
        <div className="space-y-3 mb-4">
            {activities.map((act) => {
                const selected = selectedMap[act.title];
                return (
                    <div key={act.title} className="bg-white rounded-2xl border border-slate-100 overflow-hidden"
                        style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.05)" }}>
                        {/* Activity header */}
                        <div className="px-4 pt-3 pb-2 flex items-center gap-3">
                            <div className="w-7 h-7 rounded-lg bg-violet-50 flex items-center justify-center shrink-0">
                                <Ticket className="h-3.5 w-3.5 text-violet-500" />
                            </div>
                            <div className="min-w-0">
                                <p className="font-bold text-slate-900 text-sm truncate">{act.title}</p>
                                <p className="text-xs text-slate-400">{act.location}</p>
                            </div>
                        </div>

                        {/* Provider pills */}
                        <div className="px-3 pb-3 flex gap-2 overflow-x-auto no-scrollbar">
                            {PROVIDERS.map((prov) => {
                                const priceUsd = act.priceUsd * prov.multiplier;
                                const inr = toINR(priceUsd, rates);
                                const isSelected = selected === prov.name;
                                const url = prov.url(act.title, act.location);

                                return (
                                    <button
                                        key={prov.name}
                                        onClick={() => onSelect(
                                            act.title,
                                            isSelected ? null : prov.name,  // ← deselect if already selected
                                            priceUsd,
                                            url
                                        )}
                                        className="flex items-center gap-1.5 px-3 py-2 rounded-xl border-2 shrink-0 transition-all"
                                        style={{
                                            borderColor: isSelected ? prov.color : "transparent",
                                            background: isSelected ? prov.bg : "#F8F9FA",
                                            boxShadow: isSelected ? `0 2px 8px ${prov.color}25` : "none",
                                        }}
                                    >
                                        {isSelected
                                            ? <CheckCircle2 className="h-3.5 w-3.5 shrink-0" style={{ color: prov.color }} />
                                            : <PlusCircle className="h-3 w-3 text-slate-400 shrink-0" />
                                        }
                                        <span className="text-xs font-bold text-slate-700">{prov.name}</span>
                                        <span className="text-xs font-black" style={{ color: prov.color }}>{formatINR(inr)}</span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
