"use client";

import { Calendar, MapPin, Share2, Copy, FileDown } from "lucide-react"
import { useState } from "react"

interface ItineraryHeroProps {
    destination: string
    dates: string
    imageSrc?: string   // kept for API compat but not used (no raster images)
    onCopyItinerary?: () => void
    onDownloadPDF?: () => void
}

// Deterministic gradient based on first char of destination
function getGradient(destination: string): string {
    const gradients = [
        "from-violet-600 via-purple-500 to-pink-500",
        "from-blue-600 via-indigo-500 to-violet-500",
        "from-rose-500 via-pink-500 to-orange-400",
        "from-teal-500 via-cyan-500 to-blue-500",
        "from-amber-500 via-orange-500 to-rose-500",
        "from-emerald-500 via-teal-500 to-cyan-500",
    ];
    const idx = (destination.charCodeAt(0) || 0) % gradients.length;
    return gradients[idx];
}

export function ItineraryHero({ destination, dates, onCopyItinerary, onDownloadPDF }: ItineraryHeroProps) {
    const [showShareMenu, setShowShareMenu] = useState(false);
    const gradient = getGradient(destination);

    return (
        <div className={`relative w-full overflow-hidden bg-gradient-to-br ${gradient}`} style={{ minHeight: 220 }}>
            {/* Decorative abstract shapes — no images */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-16 -right-16 w-64 h-64 rounded-full bg-white/10 blur-3xl" />
                <div className="absolute -bottom-10 -left-10 w-48 h-48 rounded-full bg-black/15 blur-2xl" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 rounded-full bg-white/5 blur-3xl" />
                {/* Subtle grid pattern */}
                <svg className="absolute inset-0 w-full h-full opacity-10" xmlns="http://www.w3.org/2000/svg">
                    <defs>
                        <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="0.5" />
                        </pattern>
                    </defs>
                    <rect width="100%" height="100%" fill="url(#grid)" />
                </svg>
            </div>

            {/* Bottom fade to white for seamless card transition */}
            <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-white/20 to-transparent" />

            <div className="relative px-5 pt-14 pb-7">
                {/* Meta: dates */}
                <div className="flex items-center gap-1.5 text-sm font-medium text-white/80 mb-2">
                    <Calendar className="h-3.5 w-3.5" />
                    <span>{dates}</span>
                </div>

                {/* Destination title */}
                <h1 className="text-3xl font-black text-white tracking-tight mb-1.5 leading-tight">
                    {destination}
                </h1>

                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-sm text-white/70">
                        <MapPin className="h-3.5 w-3.5" />
                        <span>AI-curated trip</span>
                    </div>

                    {/* Share button */}
                    <div className="relative">
                        <button
                            onClick={() => setShowShareMenu(!showShareMenu)}
                            className="p-2.5 bg-white/15 backdrop-blur-md rounded-full hover:bg-white/25 transition-all border border-white/20"
                        >
                            <Share2 className="h-4 w-4 text-white" />
                        </button>

                        {showShareMenu && (
                            <div className="absolute right-0 bottom-full mb-2 bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden z-50 min-w-[190px]"
                                style={{ boxShadow: "0 20px 60px rgba(0,0,0,0.15)" }}>
                                <button
                                    onClick={() => { onCopyItinerary?.(); setShowShareMenu(false); }}
                                    className="w-full px-4 py-3.5 flex items-center gap-3 hover:bg-slate-50 transition-colors text-slate-700 text-sm font-semibold"
                                >
                                    <Copy className="h-4 w-4 text-indigo-500" />
                                    Copy Itinerary
                                </button>
                                <button
                                    onClick={() => { onDownloadPDF?.(); setShowShareMenu(false); }}
                                    className="w-full px-4 py-3.5 flex items-center gap-3 hover:bg-slate-50 transition-colors text-slate-700 text-sm font-semibold border-t border-slate-100"
                                >
                                    <FileDown className="h-4 w-4 text-indigo-500" />
                                    Download as PDF
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
