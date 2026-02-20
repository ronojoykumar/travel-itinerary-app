"use client";

import { ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { ExchangeRates, toINR, formatINR } from "@/hooks/useCurrencyRates";

interface GrandTotalBarProps {
    flightSelections: Record<string, any>;      // dayKey → {name, priceUsd, url}
    hotelSelections: Record<string, any>;        // dayKey → {name, totalUsd, url}
    activitySelections: Record<string, string>;  // activityTitle → providerName
    activityPrices: Record<string, number>;      // activityTitle → priceUsd
    activityUrls: Record<string, string>;        // activityTitle → url
    budget: number;                              // USD
    rates: ExchangeRates;
    onBookAll: () => void;
}

export function GrandTotalBar({
    flightSelections, hotelSelections, activitySelections, activityPrices, activityUrls,
    budget, rates, onBookAll,
}: GrandTotalBarProps) {
    const router = useRouter();

    const handleProceed = () => {
        router.push("/briefing");     // navigate to Pre-Trip Briefing
    };
    // Sum all selected items
    let totalUsd = 0;

    Object.values(flightSelections).forEach((s: any) => { if (s?.priceUsd) totalUsd += s.priceUsd; });
    Object.values(hotelSelections).forEach((s: any) => { if (s?.totalUsd) totalUsd += s.totalUsd; });
    Object.entries(activitySelections).forEach(([title]) => {
        if (activityPrices[title]) totalUsd += activityPrices[title];
    });

    const totalInr = toINR(totalUsd, rates);
    const budgetInr = toINR(budget, rates);
    const diffInr = budgetInr - totalInr;
    const isOver = diffInr < 0;

    const selectedCount =
        Object.keys(flightSelections).length +
        Object.keys(hotelSelections).length +
        Object.keys(activitySelections).length;

    return (
        <div
            className="fixed bottom-0 left-0 right-0 z-50"
            style={{
                background: "rgba(255,255,255,0.82)",
                backdropFilter: "blur(20px) saturate(180%)",
                WebkitBackdropFilter: "blur(20px) saturate(180%)",
                borderTop: "1px solid rgba(108,92,231,0.1)",
                boxShadow: "0 -8px 32px rgba(0,0,0,0.06)",
            }}
        >
            <div className="max-w-2xl mx-auto px-4 py-3 flex items-center gap-4">
                {/* Cost summary */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-baseline gap-2">
                        <span className="text-2xl font-black text-slate-900">{formatINR(totalInr)}</span>
                        {selectedCount > 0 && (
                            <span className="text-xs text-slate-400 font-medium">{selectedCount} item{selectedCount !== 1 ? "s" : ""} selected</span>
                        )}
                    </div>
                    {selectedCount > 0 && (
                        <p className={`text-xs font-semibold mt-0.5 ${isOver ? "text-red-500" : "text-emerald-600"}`}>
                            {isOver
                                ? `${formatINR(Math.abs(diffInr))} over budget`
                                : `${formatINR(diffInr)} remaining from ${formatINR(budgetInr)} budget`}
                        </p>
                    )}
                    {selectedCount === 0 && (
                        <p className="text-xs text-slate-400">Best value pre-selected · tap to change</p>
                    )}
                </div>

                {/* Proceed CTA */}
                <button
                    onClick={handleProceed}
                    className="flex items-center gap-2 px-6 py-3.5 rounded-2xl font-bold text-sm transition-all shrink-0 text-white"
                    style={{
                        background: "linear-gradient(135deg,#6C5CE7,#a78bfa)",
                        boxShadow: "0 4px 20px rgba(108,92,231,0.35)",
                    }}
                >
                    Proceed
                    <ArrowRight className="h-4 w-4" />
                </button>
            </div>
        </div>
    );
}
