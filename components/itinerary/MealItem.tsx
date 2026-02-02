"use client";

import { Coffee, UtensilsCrossed, Moon, MapPin, DollarSign, Check } from "lucide-react";

interface MealItemProps {
    mealType: "breakfast" | "lunch" | "dinner";
    place: string;
    location: string;
    price: number;
    isSelected: boolean;
    onToggle: () => void;
}

export function MealItem({ mealType, place, location, price, isSelected, onToggle }: MealItemProps) {
    const getIcon = () => {
        switch (mealType) {
            case "breakfast": return Coffee;
            case "lunch": return UtensilsCrossed;
            case "dinner": return Moon;
        }
    };

    const Icon = getIcon();

    return (
        <div className="flex gap-4 relative pl-2 mb-4">
            <div className="absolute left-[3.25rem] top-8 bottom-[-2rem] w-0.5 bg-slate-100 last:bottom-0" />

            <div className="w-16 text-[10px] font-medium text-slate-500 pt-1 shrink-0 text-right capitalize leading-tight">
                {mealType}
            </div>

            <div className={`relative z-10 w-3 h-3 rounded-full mt-1.5 ring-4 ring-white shrink-0 bg-orange-500`} />

            <button
                onClick={onToggle}
                className={`flex-1 p-3 rounded-lg border-2 transition-all text-left ${isSelected
                    ? "border-orange-500 bg-orange-50"
                    : "border-slate-200 bg-white hover:border-slate-300"
                    }`}
            >
                <div className="flex justify-between items-start">
                    <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                            <Icon className={`h-4 w-4 ${isSelected ? "text-orange-600" : "text-slate-600"}`} />
                            <span className={`text-[10px] font-bold uppercase tracking-wider ${isSelected ? "text-orange-600" : "text-slate-600"}`}>
                                {mealType}
                            </span>
                        </div>
                        <h4 className="font-semibold text-slate-900 text-sm">{place}</h4>
                        <div className="flex items-center gap-1 text-xs text-slate-500 mt-1">
                            <MapPin className="h-3 w-3" />
                            {location}
                        </div>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                        <div className={`text-sm font-bold ${isSelected ? "text-orange-700" : "text-slate-700"}`}>
                            ${price}
                        </div>
                        {isSelected && (
                            <div className="w-5 h-5 rounded-full bg-orange-500 flex items-center justify-center">
                                <Check className="h-3 w-3 text-white" />
                            </div>
                        )}
                    </div>
                </div>
            </button>
        </div>
    );
}
