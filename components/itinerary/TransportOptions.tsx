"use client";

import { Bus, Car, Train, Clock, DollarSign } from "lucide-react";
import { useState } from "react";

interface TransportOption {
    type: "cab" | "bus" | "train";
    duration: string;
    price: number;
}

interface TransportOptionsProps {
    from: string;
    to: string;
    options: TransportOption[];
    onSelect: (option: TransportOption) => void;
    selected?: TransportOption;
}

export function TransportOptions({ from, to, options, onSelect, selected }: TransportOptionsProps) {
    const getIcon = (type: string) => {
        switch (type) {
            case "cab": return Car;
            case "bus": return Bus;
            case "train": return Train;
            default: return Car;
        }
    };

    return (
        <div className="flex gap-4 relative pl-2 mb-6">
            <div className="absolute left-[3.25rem] top-8 bottom-[-2rem] w-0.5 bg-slate-100" />

            <div className="w-12 text-xs font-medium text-slate-500 pt-1 shrink-0 text-right">
                Travel
            </div>

            <div className="relative z-10 flex items-center justify-center w-6 h-6 -ml-1.5 bg-blue-50 rounded-full ring-4 ring-white shrink-0 text-blue-600">
                <Train className="h-3.5 w-3.5" />
            </div>

            <div className="flex-1">
                <div className="text-sm font-semibold text-slate-700 mb-2">
                    {from} → {to}
                </div>
                <div className="grid grid-cols-3 gap-2">
                    {options.map((option, idx) => {
                        const Icon = getIcon(option.type);
                        const isSelected = selected?.type === option.type;

                        return (
                            <button
                                key={idx}
                                onClick={() => onSelect(option)}
                                className={`p-3 rounded-lg border-2 transition-all ${isSelected
                                        ? "border-indigo-500 bg-indigo-50 shadow-md"
                                        : "border-slate-200 bg-white hover:border-slate-300"
                                    }`}
                            >
                                <div className="flex flex-col items-center gap-1">
                                    <Icon className={`h-5 w-5 ${isSelected ? "text-indigo-600" : "text-slate-600"}`} />
                                    <span className={`text-[10px] font-bold uppercase ${isSelected ? "text-indigo-700" : "text-slate-600"}`}>
                                        {option.type}
                                    </span>
                                    <div className="flex items-center gap-1 text-[10px] text-slate-500">
                                        <Clock className="h-2.5 w-2.5" />
                                        {option.duration}
                                    </div>
                                    <div className={`text-xs font-bold ${isSelected ? "text-indigo-700" : "text-slate-700"}`}>
                                        ${option.price}
                                    </div>
                                </div>
                            </button>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
