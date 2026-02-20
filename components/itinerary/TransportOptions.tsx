"use client";

import { Bus, Car, Train, Clock, ChevronRight } from "lucide-react";
import { ExchangeRates, toINR, formatINR } from "@/hooks/useCurrencyRates";

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
    rates?: ExchangeRates;
}

const TRANSPORT_CONFIG = {
    cab: { Icon: Car, label: "Cab", color: "#FF9F43", bg: "#FFF8F0", selectedBg: "#FFF0DC" },
    bus: { Icon: Bus, label: "Bus", color: "#00B894", bg: "#F0FDF9", selectedBg: "#DCFAF2" },
    train: { Icon: Train, label: "Train", color: "#6C5CE7", bg: "#F5F3FF", selectedBg: "#EDE9FF" },
};

export function TransportOptions({ from, to, options, onSelect, selected, rates }: TransportOptionsProps) {
    return (
        <div className="flex gap-3 relative pb-1">
            {/* Timeline connector */}
            <div className="absolute left-[2.65rem] top-7 bottom-[-0.75rem] w-0.5 bg-blue-100" />

            {/* Label */}
            <div className="w-10 text-right shrink-0 pt-3">
                <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Move</span>
            </div>

            {/* Icon node */}
            <div className="relative z-10 w-7 h-7 rounded-full flex items-center justify-center shrink-0 mt-2 ring-4 ring-white bg-blue-50"
                style={{ boxShadow: "0 0 0 3px #74B9FF30" }}
            >
                <Train className="h-3.5 w-3.5 text-blue-400" />
            </div>

            {/* Content */}
            <div className="flex-1 mb-5">
                {/* Route header */}
                <div className="flex items-center gap-2 mb-3 mt-2">
                    <span className="text-sm font-bold text-slate-800">{from}</span>
                    <ChevronRight className="h-4 w-4 text-slate-400" />
                    <span className="text-sm font-bold text-slate-800">{to}</span>
                </div>

                {/* Transport options row */}
                <div className="grid grid-cols-3 gap-2">
                    {options.map((option, idx) => {
                        const conf = TRANSPORT_CONFIG[option.type] || TRANSPORT_CONFIG.cab;
                        const isSelected = selected?.type === option.type;
                        const { Icon } = conf;

                        return (
                            <button
                                key={idx}
                                onClick={() => onSelect(option)}
                                className="rounded-xl p-3 border-2 transition-all duration-200 text-center hover:shadow-sm active:scale-[0.98]"
                                style={{
                                    background: isSelected ? conf.selectedBg : conf.bg,
                                    borderColor: isSelected ? conf.color : "transparent",
                                    boxShadow: isSelected ? `0 4px 14px ${conf.color}25` : "0 1px 4px rgba(0,0,0,0.05)",
                                }}
                            >
                                <div
                                    className="w-8 h-8 rounded-full flex items-center justify-center mx-auto mb-2"
                                    style={{ backgroundColor: conf.color + "20" }}
                                >
                                    <Icon className="h-4 w-4" style={{ color: conf.color }} />
                                </div>
                                <span className="text-[11px] font-bold text-slate-800 block">{conf.label}</span>
                                <div className="flex items-center justify-center gap-1 mt-1">
                                    <Clock className="h-2.5 w-2.5 text-slate-400" />
                                    <span className="text-[10px] text-slate-500">{option.duration}</span>
                                </div>
                                <span className="text-sm font-bold mt-1 block" style={{ color: conf.color }}>
                                    {rates
                                        ? formatINR(toINR(option.price, rates))
                                        : `$${option.price}`
                                    }
                                </span>
                            </button>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
