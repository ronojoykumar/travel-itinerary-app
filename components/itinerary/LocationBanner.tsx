"use client";

import { motion, AnimatePresence } from "framer-motion";
import { MapPin } from "lucide-react";
import { useMemo } from "react";

interface LocationBannerProps {
    /** All itinerary items for the currently selected day */
    dayItems: any[];
    /** The day number (1-indexed) */
    dayNumber: number;
}

// Country detection from location strings
const COUNTRY_MAP: Array<{ pattern: RegExp; country: string; emoji: string; accent: string }> = [
    { pattern: /japan|tokyo|osaka|kyoto|hiroshima|nara|yokohama/i, country: "Japan", emoji: "🇯🇵", accent: "#BC002D" },
    { pattern: /korea|seoul|busan|incheon|jeju|daegu|hongdae|gangnam/i, country: "South Korea", emoji: "🇰🇷", accent: "#003478" },
    { pattern: /singapore/i, country: "Singapore", emoji: "🇸🇬", accent: "#EF3340" },
    { pattern: /dubai|abu dhabi|sharjah|uae/i, country: "UAE", emoji: "🇦🇪", accent: "#009A44" },
    { pattern: /thailand|bangkok|phuket|chiang mai/i, country: "Thailand", emoji: "🇹🇭", accent: "#A51931" },
    { pattern: /france|paris/i, country: "France", emoji: "🇫🇷", accent: "#0055A4" },
    { pattern: /italy|rome|milan|venice/i, country: "Italy", emoji: "🇮🇹", accent: "#009246" },
    { pattern: /uk|london|england|britain/i, country: "United Kingdom", emoji: "🇬🇧", accent: "#012169" },
    { pattern: /china|beijing|shanghai/i, country: "China", emoji: "🇨🇳", accent: "#DE2910" },
    { pattern: /australia|sydney|melbourne/i, country: "Australia", emoji: "🇦🇺", accent: "#00843D" },
    { pattern: /india|mumbai|delhi|bangalore|hyderabad/i, country: "India", emoji: "🇮🇳", accent: "#FF9933" },
    { pattern: /usa|new york|los angeles|chicago|san francisco/i, country: "USA", emoji: "🇺🇸", accent: "#3C3B6E" },
];

function detectCountryFromItems(items: any[]): { country: string; emoji: string; accent: string } | null {
    for (const item of items) {
        const searchStr = [
            item.data?.location,
            item.data?.from,
            item.data?.to,
            item.data?.place,
        ].filter(Boolean).join(" ");

        for (const entry of COUNTRY_MAP) {
            if (entry.pattern.test(searchStr)) {
                return { country: entry.country, emoji: entry.emoji, accent: entry.accent };
            }
        }
    }
    return null;
}

export function LocationBanner({ dayItems, dayNumber }: LocationBannerProps) {
    const detected = useMemo(() => detectCountryFromItems(dayItems), [dayItems]);

    const label = detected
        ? `Exploring ${detected.country}`
        : `Day ${dayNumber}`;

    const emoji = detected?.emoji ?? "🌍";
    const accent = detected?.accent ?? "#6C5CE7";

    return (
        <AnimatePresence mode="wait">
            <motion.div
                key={label}
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 6 }}
                transition={{ duration: 0.28, ease: "easeOut" }}
                className="flex items-center justify-between px-1 pb-4"
            >
                <div>
                    {/* Animated country badge */}
                    <div className="flex items-center gap-2 mb-1">
                        <span className="text-2xl leading-none" role="img" aria-label={detected?.country}>{emoji}</span>
                        <span
                            className="text-[11px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full"
                            style={{ background: accent + "18", color: accent }}
                        >
                            {detected?.country ?? "World"}
                        </span>
                    </div>
                    {/* Main heading */}
                    <h2 className="text-xl font-black text-slate-900 tracking-tight leading-tight">
                        {label}
                    </h2>
                    <p className="text-xs text-slate-400 mt-0.5 font-medium flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {dayItems.length} stops · Day {dayNumber}
                    </p>
                </div>

                {/* Trip type badge (passed via context if needed, or omit) */}
                <div
                    className="text-[10px] font-bold px-3 py-1.5 rounded-full uppercase tracking-widest"
                    style={{ background: "#EDE9FF", color: "#6C5CE7" }}
                >
                    Multi-City
                </div>
            </motion.div>
        </AnimatePresence>
    );
}
