import { MapPin, Star, Coffee, Camera, Waves, Train, UtensilsCrossed } from "lucide-react"
import { ExchangeRates, toINR, formatINR } from "@/hooks/useCurrencyRates"

interface TimelineItemProps {
    time: string
    title: string
    description?: string
    location: string
    price?: string | number
    rating?: number
    category: "food" | "activity" | "relax" | "transport"
    image?: string
    rates?: ExchangeRates
}

const CATEGORY_CONFIG = {
    food: {
        accent: "#FF9F43",
        bg: "bg-[#FFF8F0]",
        border: "border-l-[#FF9F43]",
        iconBg: "bg-[#FFF0DC]",
        iconColor: "text-[#FF9F43]",
        badge: "bg-[#FFF0DC] text-[#E8861A]",
        label: "Food & Dining",
        Icon: Coffee,
    },
    activity: {
        accent: "#6C5CE7",
        bg: "bg-[#F5F3FF]",
        border: "border-l-[#6C5CE7]",
        iconBg: "bg-[#EDE9FF]",
        iconColor: "text-[#6C5CE7]",
        badge: "bg-[#EDE9FF] text-[#5A4BD1]",
        label: "Activity",
        Icon: Camera,
    },
    relax: {
        accent: "#00B894",
        bg: "bg-[#F0FDF9]",
        border: "border-l-[#00B894]",
        iconBg: "bg-[#DCFAF2]",
        iconColor: "text-[#00B894]",
        badge: "bg-[#DCFAF2] text-[#009975]",
        label: "Relax",
        Icon: Waves,
    },
    transport: {
        accent: "#74B9FF",
        bg: "bg-[#F0F7FF]",
        border: "border-l-[#74B9FF]",
        iconBg: "bg-[#DCEEFF]",
        iconColor: "text-[#74B9FF]",
        badge: "bg-[#DCEEFF] text-[#4D9DE0]",
        label: "Transport",
        Icon: Train,
    },
}

export function TimelineItem({
    time, title, description, location, price, rating, category, rates
}: TimelineItemProps) {
    const config = CATEGORY_CONFIG[category] || CATEGORY_CONFIG.activity
    const { Icon } = config

    // ── Currency logic ──────────────────────────────────────────────────────
    const rawPrice = typeof price === "string"
        ? parseFloat(price.replace(/[^0-9.]/g, "")) || 0
        : (price ?? 0);

    // All AI prices are in USD — straight USD→INR conversion
    const inrAmount = rates && rawPrice > 0 ? toINR(rawPrice, rates) : null;

    return (
        <div className="flex gap-3 relative pb-1">
            {/* Vertical Timeline Line — 2px solid accent */}
            <div
                className="absolute left-[2.65rem] top-7 bottom-[-0.75rem] w-0.5"
                style={{ backgroundColor: config.accent + "30" }}
            />

            {/* Time column */}
            <div className="w-10 text-right shrink-0 pt-3">
                <span className="text-[11px] font-semibold text-slate-400 leading-none">{time?.split(" ")[0]}</span>
                <br />
                <span className="text-[9px] font-medium text-slate-300">{time?.split(" ")[1]}</span>
            </div>

            {/* Icon node on the timeline */}
            <div
                className={`relative z-10 w-7 h-7 rounded-full flex items-center justify-center shrink-0 mt-2 ring-4 ring-white ${config.iconBg}`}
                style={{ boxShadow: `0 0 0 3px ${config.accent}20` }}
            >
                <Icon className={`h-3.5 w-3.5 ${config.iconColor}`} />
            </div>

            {/* Card */}
            <div
                className={`flex-1 rounded-xl border border-slate-100 border-l-4 p-4 mb-5 transition-all duration-200 hover:shadow-md active:scale-[0.99] ${config.bg} ${config.border}`}
                style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.04), 0 0 0 1px rgba(0,0,0,0.03)" }}
            >
                {/* Top: Badge + Rating */}
                <div className="flex items-center justify-between mb-2">
                    <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full ${config.badge}`}>
                        {config.label}
                    </span>
                    {rating && (
                        <div className="flex items-center gap-1">
                            <Star className="h-3 w-3 text-amber-400 fill-amber-400" />
                            <span className="text-xs font-semibold text-slate-600">{rating}</span>
                        </div>
                    )}
                </div>

                {/* Title */}
                <h3 className="font-bold text-slate-900 text-[15px] leading-snug mb-1">{title}</h3>

                {/* Description */}
                {description && (
                    <p className="text-[13px] text-slate-500 leading-relaxed line-clamp-2 mb-3">{description}</p>
                )}

                {/* Footer: Location + Price */}
                <div className="flex items-end justify-between pt-2.5 border-t border-white/70 mt-1">
                    <div className="flex items-center gap-1 text-xs text-slate-400">
                        <MapPin className="h-3 w-3" />
                        <span className="truncate max-w-[150px]">{location}</span>
                    </div>

                    {/* Dual price display */}
                    {rawPrice > 0 && (
                        <div className="text-right ml-2 shrink-0">
                            {inrAmount !== null ? (
                                <p className="text-sm font-black text-slate-900 leading-tight">
                                    {formatINR(inrAmount)}
                                </p>
                            ) : (
                                <span className="text-sm font-bold text-slate-700">${rawPrice}</span>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
