"use client";

import { Calendar, MapPin, Share2, Copy, FileDown } from "lucide-react"
import Image from "next/image"
import { useState } from "react"

interface ItineraryHeroProps {
    destination: string
    dates: string
    imageSrc: string
    onCopyItinerary?: () => void
    onDownloadPDF?: () => void
}

export function ItineraryHero({ destination, dates, imageSrc, onCopyItinerary, onDownloadPDF }: ItineraryHeroProps) {
    const [showShareMenu, setShowShareMenu] = useState(false);

    return (
        <div className="relative h-[250px] w-full overflow-hidden">
            <Image
                src={imageSrc}
                alt={destination}
                fill
                className="object-cover"
                priority
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />

            <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                <div className="flex justify-between items-end">
                    <div>
                        <div className="flex items-center gap-2 text-sm font-medium text-white/90 mb-2">
                            <Calendar className="h-4 w-4" />
                            <span>{dates}</span>
                        </div>
                        <h1 className="text-3xl font-bold mb-1">{destination}</h1>
                        <div className="flex items-center gap-2 text-sm text-white/80">
                            <MapPin className="h-4 w-4" />
                            <span>Multi-city Trip</span>
                        </div>
                    </div>

                    <div className="relative">
                        <button
                            onClick={() => setShowShareMenu(!showShareMenu)}
                            className="p-2 bg-white/10 backdrop-blur-md rounded-full hover:bg-white/20 transition-colors"
                        >
                            <Share2 className="h-5 w-5 text-white" />
                        </button>

                        {showShareMenu && (
                            <div className="absolute right-0 bottom-full mb-2 bg-white rounded-lg shadow-xl border border-slate-200 overflow-hidden z-50 min-w-[180px]">
                                <button
                                    onClick={() => {
                                        onCopyItinerary?.();
                                        setShowShareMenu(false);
                                    }}
                                    className="w-full px-4 py-3 flex items-center gap-3 hover:bg-slate-50 transition-colors text-slate-700 text-sm font-medium"
                                >
                                    <Copy className="h-4 w-4" />
                                    Copy Itinerary
                                </button>
                                <button
                                    onClick={() => {
                                        onDownloadPDF?.();
                                        setShowShareMenu(false);
                                    }}
                                    className="w-full px-4 py-3 flex items-center gap-3 hover:bg-slate-50 transition-colors text-slate-700 text-sm font-medium border-t border-slate-100"
                                >
                                    <FileDown className="h-4 w-4" />
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
