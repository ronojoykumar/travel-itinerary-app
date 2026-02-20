"use client";

import { Coffee, UtensilsCrossed, Moon, MapPin, Check } from "lucide-react";
import { ExchangeRates, toINR, formatINR } from "@/hooks/useCurrencyRates";

interface MealItemProps {
    mealType: "breakfast" | "lunch" | "dinner";
    place: string;
    location: string;
    price: number;
    isSelected: boolean;
    onToggle: () => void;
    rates?: ExchangeRates;
}

const MEAL_CONFIG = {
    breakfast: {
        Icon: Coffee,
        accent: "#FDBA74", accentDeep: "#EA580C",
        bg: "bg-[#FFF7ED]", selectedBg: "bg-[#FFF0DC]",
        border: "border-[#FDBA74]", iconBg: "bg-[#FED7AA]",
        label: "Breakfast", emoji: "☀️",
    },
    lunch: {
        Icon: UtensilsCrossed,
        accent: "#86EFAC", accentDeep: "#16A34A",
        bg: "bg-[#F0FDF4]", selectedBg: "bg-[#DCFCE7]",
        border: "border-[#86EFAC]", iconBg: "bg-[#BBF7D0]",
        label: "Lunch", emoji: "🌤️",
    },
    dinner: {
        Icon: Moon,
        accent: "#A78BFA", accentDeep: "#7C3AED",
        bg: "bg-[#F5F3FF]", selectedBg: "bg-[#EDE9FF]",
        border: "border-[#A78BFA]", iconBg: "bg-[#DDD6FE]",
        label: "Dinner", emoji: "🌙",
    },
};

export function MealItem({
    mealType, place, location, price, isSelected, onToggle, rates
}: MealItemProps) {
    const config = MEAL_CONFIG[mealType] || MEAL_CONFIG.lunch;
    const { Icon } = config;

    // Currency conversion — all prices are USD
    const inrAmount = rates && price > 0 ? toINR(price, rates) : null;

    return (
        <div className="flex gap-3 relative pb-1">
            {/* Timeline connector */}
            <div
                className="absolute left-[2.65rem] top-7 bottom-[-0.75rem] w-0.5"
                style={{ backgroundColor: config.accent + "40" }}
            />

            {/* Meal emoji label */}
            <div className="w-10 text-right shrink-0 pt-3">
                <span className="text-[11px] font-semibold text-slate-400">{config.emoji}</span>
            </div>

            {/* Icon node */}
            <div
                className={`relative z-10 w-7 h-7 rounded-full flex items-center justify-center shrink-0 mt-2 ring-4 ring-white ${config.iconBg}`}
                style={{ boxShadow: `0 0 0 3px ${config.accent}30` }}
            >
                <Icon className="h-3.5 w-3.5" style={{ color: config.accentDeep }} />
            </div>

            {/* Card */}
            <button
                onClick={onToggle}
                className={`flex-1 p-4 rounded-xl border-2 mb-5 transition-all duration-200 text-left hover:shadow-sm active:scale-[0.99] ${isSelected ? `${config.selectedBg} ${config.border}` : "bg-white border-slate-100 hover:border-slate-200"
                    }`}
                style={{
                    boxShadow: isSelected
                        ? `0 2px 12px ${config.accent}30`
                        : "0 2px 8px rgba(0,0,0,0.04)",
                }}
            >
                <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                        <span
                            className="text-[10px] font-bold uppercase tracking-widest mb-1.5 inline-block"
                            style={{ color: config.accentDeep }}
                        >
                            {config.label}
                        </span>
                        <h4 className="font-bold text-slate-900 text-[15px] leading-snug truncate">{place}</h4>
                        <div className="flex items-center gap-1 text-xs text-slate-400 mt-1">
                            <MapPin className="h-3 w-3 shrink-0" />
                            <span className="truncate">{location}</span>
                        </div>
                    </div>

                    {/* Price + Check */}
                    <div className="flex flex-col items-end gap-1 ml-3 shrink-0">
                        {/* Primary: INR */}
                        {inrAmount !== null ? (
                            <span className="text-base font-black text-slate-900 leading-tight">
                                {formatINR(inrAmount)}
                            </span>
                        ) : (
                            <span className="text-base font-bold text-slate-800">${price}</span>
                        )}

                        {/* Animated check */}
                        <div
                            className={`w-5 h-5 rounded-full flex items-center justify-center transition-all ${isSelected ? "opacity-100 scale-100" : "opacity-0 scale-75"
                                }`}
                            style={{ backgroundColor: config.accentDeep }}
                        >
                            <Check className="h-3 w-3 text-white" />
                        </div>
                    </div>
                </div>
            </button>
        </div>
    );
}
