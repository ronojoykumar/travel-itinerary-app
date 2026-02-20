"use client";

import { useState, useCallback, useEffect } from "react";
import { ArrowLeft, Sparkles } from "lucide-react";
import Link from "next/link";
import { useTrip } from "@/hooks/useTrip";
import { useCurrencyRates } from "@/hooks/useCurrencyRates";
import { BookingDayAccordion } from "@/components/booking/BookingDayAccordion";
import { GrandTotalBar } from "@/components/booking/GrandTotalBar";

// ─── City / Country detection ─────────────────────────────────────────────────

const COUNTRY_CITY_MAP = [
    { country: "JP", cities: ["tokyo", "shinjuku", "shibuya", "akihabara", "asakusa", "narita", "haneda", "roppongi", "osaka", "kyoto", "hiroshima", "nara", "yokohama", "harajuku", "ginza"] },
    { country: "KR", cities: ["seoul", "hongdae", "gangnam", "myeongdong", "insadong", "incheon", "busan", "daegu", "jeju"] },
    { country: "SG", cities: ["singapore", "marina", "orchard", "sentosa", "changi"] },
    { country: "TH", cities: ["bangkok", "phuket", "chiangmai", "pattaya", "sukhumvit", "suvarnabhumi"] },
    { country: "AE", cities: ["dubai", "abu dhabi", "sharjah", "deira", "marina"] },
    { country: "FR", cities: ["paris", "lyon", "marseille", "nice", "bordeaux"] },
    { country: "GB", cities: ["london", "manchester", "edinburgh", "birmingham", "heathrow"] },
    { country: "AU", cities: ["sydney", "melbourne", "brisbane", "perth", "cairns"] },
    { country: "US", cities: ["new york", "manhattan", "los angeles", "chicago", "san francisco", "miami", "las vegas"] },
    { country: "IN", cities: ["mumbai", "delhi", "bangalore", "hyderabad", "chennai", "kolkata", "goa"] },
    { country: "CN", cities: ["beijing", "shanghai", "shenzhen", "guangzhou", "hong kong"] },
];

function detectCountryFromText(text: string): string | null {
    const t = text.toLowerCase();
    for (const { country, cities } of COUNTRY_CITY_MAP) {
        if (cities.some(c => t.includes(c))) return country;
    }
    return null;
}

function detectCityFromText(text: string): string | null {
    const CITY_NAMES: Record<string, string> = {
        tokyo: "Tokyo", shinjuku: "Tokyo", shibuya: "Tokyo", akihabara: "Tokyo",
        asakusa: "Tokyo", narita: "Narita", haneda: "Tokyo", harajuku: "Tokyo",
        roppongi: "Tokyo", ginza: "Tokyo",
        osaka: "Osaka", kyoto: "Kyoto", hiroshima: "Hiroshima", nara: "Nara",
        yokohama: "Yokohama",
        seoul: "Seoul", hongdae: "Seoul", gangnam: "Seoul", myeongdong: "Seoul",
        insadong: "Seoul", incheon: "Incheon", busan: "Busan", jeju: "Jeju",
        singapore: "Singapore", changi: "Singapore",
        bangkok: "Bangkok", phuket: "Phuket",
        dubai: "Dubai", "abu dhabi": "Abu Dhabi",
        paris: "Paris", London: "London",
        sydney: "Sydney", melbourne: "Melbourne",
    };
    const t = text.toLowerCase();
    for (const [key, city] of Object.entries(CITY_NAMES)) {
        if (t.includes(key)) return city;
    }
    return null;
}

function detectCityFromItems(items: any[], fallback: string): string {
    for (const item of items) {
        const texts = [
            item.data?.location, item.data?.place,
            item.data?.from, item.data?.to, item.data?.title,
        ].filter(Boolean).join(" ");
        const city = detectCityFromText(texts);
        if (city) return city;
    }
    return fallback;
}

function findHotelNameFromItems(items: any[], city: string): string {
    const hotelRx = /check.?in|hotel|ryokan|hostel|inn|lodge|resort|accommodation|airbnb|capsule|guesthouse/i;
    for (const item of items) {
        const title: string = item.data?.title ?? "";
        if (item.type === "activity" && hotelRx.test(title)) {
            // Strip "Check in at …" prefix
            const cleaned = title.replace(/^check.?in\s+(at\s+|to\s+)?/i, "").trim();
            if (cleaned.length > 3) return cleaned;
        }
    }
    // Fallback: "Accommodation in {city}"
    return `Accommodation in ${city}`;
}

function isInterCountry(from: string, to: string): boolean {
    const fc = detectCountryFromText(from);
    const tc = detectCountryFromText(to);
    if (!fc || !tc) return false;
    return fc !== tc;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function addDays(iso: string, n: number): string {
    const d = new Date(iso);
    d.setDate(d.getDate() + n);
    return d.toISOString().split("T")[0];
}

function toIsoDate(raw: string): string {
    if (!raw) return new Date().toISOString().split("T")[0];
    if (raw.includes("-")) return raw.split("T")[0];
    const [m, d, y] = raw.split("/");
    return `${y}-${m.padStart(2, "0")}-${d.padStart(2, "0")}`;
}

function getDateLabel(iso: string): string {
    return new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short" });
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function BookingPage() {
    const { tripData, isLoaded } = useTrip();
    const { rates, loading: ratesLoading } = useCurrencyRates();

    const [flightSelections, setFlightSelections] = useState<Record<string, any>>({});
    const [hotelSelections, setHotelSelections] = useState<Record<string, any>>({});
    const [transportSelections, setTransportSelections] = useState<Record<string, any>>({});
    const [activitySelections, setActivitySelections] = useState<Record<string, string>>({});
    const [activityPrices, setActivityPrices] = useState<Record<string, number>>({});
    const [activityUrls, setActivityUrls] = useState<Record<string, string>>({});

    // ── Auto-select best value on load ──────────────────────────────────────
    useEffect(() => {
        if (!tripData?.itinerary || !isLoaded) return;

        const startIso = toIsoDate(tripData.startDate);
        const endIso = toIsoDate(tripData.endDate);
        const count = Math.max(1, Math.round(
            (new Date(endIso).getTime() - new Date(startIso).getTime()) / 86400000
        ) + 1);

        const autoFlights: Record<string, any> = {};
        const autoHotels: Record<string, any> = {};
        const autoTransports: Record<string, any> = {};
        const autoActivities: Record<string, string> = {};
        const autoPrices: Record<string, number> = {};
        const autoUrls: Record<string, string> = {};
        const hotelRx = /check.?in|check.?out|accommodation/i;

        Array.from({ length: count }, (_, i) => {
            const isoDate = addDays(startIso, i);
            const dayNum = i + 1;
            const items = tripData.itinerary.filter((it: any) => it.day === dayNum);
            const fb = tripData.destinations[Math.min(i, tripData.destinations.length - 1)]
                ?.split(",")[0]?.trim() ?? "Destination";
            const cityName = detectCityFromItems(items, fb);
            const enc = encodeURIComponent(cityName);
            const nextDate = addDays(isoDate, 1);

            // Best hotel: Agoda
            autoHotels[isoDate] = {
                name: "Agoda",
                pricePerNightUsd: 85,
                totalUsd: 85,
                url: `https://www.agoda.com/search?city=${enc}&checkIn=${isoDate}&checkOut=${nextDate}&rooms=1&adults=1`,
            };

            // Transport
            const tItem = items.find((it: any) => it.type === "transportOptions");
            if (tItem) {
                const from = tItem.data?.from ?? "";
                const to = tItem.data?.to ?? "";
                const modes = (tItem.data?.options ?? []).map((o: any) => o.type as string);
                const inter = isInterCountry(from, to) || isInterCountry(cityName, to);

                if (inter) {
                    autoFlights[isoDate] = {
                        name: "Google Flights",
                        priceUsd: 420,
                        url: `https://www.google.com/travel/flights?q=${encodeURIComponent(`flights from ${from} to ${to}`)}&hl=en`,
                    };
                } else if (modes.includes("train")) {
                    autoTransports[isoDate] = {
                        name: "12Go Asia",
                        priceUsd: 18,
                        url: `https://12go.asia/en/travel/${encodeURIComponent(from)}/${encodeURIComponent(to)}`,
                    };
                } else if (modes.includes("bus")) {
                    autoTransports[isoDate] = {
                        name: "12Go Asia",
                        priceUsd: 12,
                        url: `https://12go.asia/en/travel/${encodeURIComponent(from)}/${encodeURIComponent(to)}`,
                    };
                } else if (modes.includes("cab")) {
                    autoTransports[isoDate] = {
                        name: "Grab",
                        priceUsd: 30,
                        url: `https://www.grab.com/sg/transport/`,
                    };
                }
            }

            // Activities: Klook
            items
                .filter((it: any) => it.type === "activity" && it.data?.title && !hotelRx.test(it.data.title))
                .forEach((it: any) => {
                    const title = it.data.title;
                    const priceUsd = parseFloat(String(it.data.price ?? "25").replace(/[^0-9.]/g, "")) || 25;
                    const url = `https://www.klook.com/en-US/search/?query=${encodeURIComponent(`${title} ${cityName}`)}`;
                    autoActivities[title] = "Klook";
                    autoPrices[title] = priceUsd;
                    autoUrls[title] = url;
                });
        });

        // Spread: auto loses to existing manual picks
        setFlightSelections(prev => ({ ...autoFlights, ...prev }));
        setHotelSelections(prev => ({ ...autoHotels, ...prev }));
        setTransportSelections(prev => ({ ...autoTransports, ...prev }));
        setActivitySelections(prev => ({ ...autoActivities, ...prev }));
        setActivityPrices(prev => ({ ...autoPrices, ...prev }));
        setActivityUrls(prev => ({ ...autoUrls, ...prev }));
    }, [tripData, isLoaded]); // run once when data loads

    // ── Toggle handlers (deselect if already selected) ──────────────────────
    const handleFlightSelect = useCallback((dayKey: string, provider: any) => {
        setFlightSelections(prev => {
            if (!provider || prev[dayKey]?.name === provider.name) {
                const { [dayKey]: _, ...rest } = prev; return rest;
            }
            return { ...prev, [dayKey]: provider };
        });
    }, []);

    const handleHotelSelect = useCallback((dayKey: string, provider: any) => {
        setHotelSelections(prev => {
            if (!provider || prev[dayKey]?.name === provider.name) {
                const { [dayKey]: _, ...rest } = prev; return rest;
            }
            return { ...prev, [dayKey]: provider };
        });
    }, []);

    const handleTransportSelect = useCallback((dayKey: string, provider: any) => {
        setTransportSelections(prev => {
            if (!provider || prev[dayKey]?.name === provider.name) {
                const { [dayKey]: _, ...rest } = prev; return rest;
            }
            return { ...prev, [dayKey]: provider };
        });
    }, []);

    const handleActivitySelect = useCallback((title: string, providerName: string | null, priceUsd: number, url: string) => {
        setActivitySelections(prev => {
            if (!providerName) {
                const { [title]: _, ...rest } = prev; return rest;
            }
            return { ...prev, [title]: providerName };
        });
        if (providerName) {
            setActivityPrices(prev => ({ ...prev, [title]: priceUsd }));
            setActivityUrls(prev => ({ ...prev, [title]: url }));
        }
    }, []);

    const handleBookAll = useCallback(() => {
        const urls: string[] = [
            ...Object.values(flightSelections).map((s: any) => s?.url).filter(Boolean),
            ...Object.values(hotelSelections).map((s: any) => s?.url).filter(Boolean),
            ...Object.values(transportSelections).map((s: any) => s?.url).filter(Boolean),
            ...Object.entries(activitySelections).map(([title]) => activityUrls[title]).filter(Boolean),
        ];
        urls.forEach(url => window.open(url, "_blank", "noopener,noreferrer"));
    }, [flightSelections, hotelSelections, transportSelections, activitySelections, activityUrls]);

    if (!isLoaded || !tripData) {
        return (
            <div className="min-h-screen flex items-center justify-center" style={{ background: "#F8F9FA" }}>
                <div className="flex flex-col items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl animate-pulse bg-violet-100" />
                    <p className="text-slate-400 text-sm">Loading trip…</p>
                </div>
            </div>
        );
    }

    // ── Build day list ───────────────────────────────────────────────────────
    const startIso = toIsoDate(tripData.startDate);
    const endIso = toIsoDate(tripData.endDate);
    const dayCount = Math.max(1, Math.round(
        (new Date(endIso).getTime() - new Date(startIso).getTime()) / 86400000
    ) + 1);

    const days = Array.from({ length: dayCount }, (_, i) => {
        const isoDate = addDays(startIso, i);
        const dayNum = i + 1;
        const items = tripData.itinerary?.filter((item: any) => item.day === dayNum) || [];

        // Detect actual city from this day's location data
        const fallbackDest = tripData.destinations[Math.min(i, tripData.destinations.length - 1)]
            ?.split(",")[0]?.trim() ?? "Destination";
        const cityName = detectCityFromItems(items, fallbackDest);

        // Find hotel name from item titles
        const hotelName = findHotelNameFromItems(items, cityName);

        // Activities (exclude check-in entries)
        const hotelRx = /check.?in|check.?out|accommodation/i;
        const activities = items
            .filter((it: any) => it.type === "activity" && it.data?.title && !hotelRx.test(it.data.title))
            .map((it: any) => ({
                title: it.data.title,
                location: detectCityFromText(it.data.location ?? "") ?? cityName,
                priceUsd: parseFloat(String(it.data.price ?? "25").replace(/[^0-9.]/g, "")) || 25,
            }));

        // Transport on this day
        const transportItem = items.find((it: any) => it.type === "transportOptions");
        const from = transportItem?.data?.from ?? "";
        const to = transportItem?.data?.to ?? "";

        // Detect transport modes offered in itinerary
        const transportModes: ("train" | "cab" | "bus")[] = transportItem?.data?.options
            ?.map((o: any) => o.type as "train" | "cab" | "bus") ?? [];

        // Only show flights for international legs
        const interCountry = transportItem
            ? isInterCountry(from, to) || isInterCountry(cityName, to)
            : false;

        return {
            dayNum, isoDate, date: getDateLabel(isoDate), cityName, hotelName,
            isInterCountry: interCountry, transportModes,
            transportFrom: from || undefined, transportTo: to || undefined, activities
        };
    });

    const primaryDest = tripData.destinations.map((d: string) => d.split(",")[0].trim()).join(" & ");

    return (
        <div className="min-h-screen pb-28 text-slate-900" style={{ background: "#F8F9FA" }}>
            {/* Hero */}
            <div className="relative overflow-hidden px-5 pt-10 pb-8"
                style={{ background: "linear-gradient(135deg,#6C5CE7 0%,#a78bfa 60%,#f093fb 100%)" }}>
                <div className="absolute -top-16 -right-16 w-64 h-64 bg-white/10 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute -bottom-10 -left-10 w-48 h-48 bg-pink-400/20 rounded-full blur-2xl pointer-events-none" />

                <Link href="/itinerary" className="inline-flex items-center gap-1.5 text-white/70 hover:text-white text-sm mb-6 transition-colors">
                    <ArrowLeft className="h-4 w-4" /> Back to Itinerary
                </Link>

                <div className="flex items-center gap-3 mb-1">
                    <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                        <Sparkles className="h-5 w-5 text-white" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-black text-white leading-tight">Booking Command Center</h1>
                        <p className="text-white/70 text-sm">{primaryDest} · {dayCount} day{dayCount !== 1 ? "s" : ""}</p>
                    </div>
                </div>

                <div className="mt-4 flex gap-2 flex-wrap">
                    {[
                        { label: `${dayCount} days`, icon: "📅" },
                        { label: `${tripData.destinations.length} destination${tripData.destinations.length !== 1 ? "s" : ""}`, icon: "🌏" },
                        { label: "Select · Book All", icon: "🔗" },
                    ].map(c => (
                        <div key={c.label} className="flex items-center gap-1.5 bg-white/15 backdrop-blur-sm px-3 py-1.5 rounded-full text-white text-xs font-semibold border border-white/20">
                            <span>{c.icon}</span><span>{c.label}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Day accordion list */}
            <div className="max-w-2xl mx-auto px-4 pt-6">
                <p className="text-xs text-slate-400 font-medium mb-4 px-1">
                    Select your provider per day — prices shown in <strong className="text-violet-600">₹</strong>. Tap again to deselect.{" "}
                    <strong className="text-violet-600">Book All</strong> opens everything at once.
                </p>

                {ratesLoading && (
                    <div className="flex items-center gap-2 text-xs text-slate-400 mb-3 px-1 animate-pulse">
                        <span>↻</span> Fetching live ₹ rates…
                    </div>
                )}

                {days.map(d => (
                    <BookingDayAccordion
                        key={d.isoDate}
                        dayNumber={d.dayNum}
                        date={d.date}
                        isoDate={d.isoDate}
                        nextIsoDate={addDays(d.isoDate, 1)}
                        cityName={d.cityName}
                        hotelName={d.hotelName}
                        isInterCountry={d.isInterCountry}
                        transportModes={d.transportModes}
                        transportFrom={d.transportFrom}
                        transportTo={d.transportTo}
                        activities={d.activities}
                        rates={rates}
                        flightSelection={flightSelections}
                        hotelSelection={hotelSelections}
                        transportSelection={transportSelections}
                        activitySelection={activitySelections}
                        activityUrls={activityUrls}
                        onFlightSelect={handleFlightSelect}
                        onHotelSelect={handleHotelSelect}
                        onTransportSelect={handleTransportSelect}
                        onActivitySelect={handleActivitySelect}
                    />
                ))}
            </div>

            <GrandTotalBar
                flightSelections={{ ...flightSelections, ...transportSelections }}
                hotelSelections={hotelSelections}
                activitySelections={activitySelections}
                activityPrices={activityPrices}
                activityUrls={activityUrls}
                budget={tripData.budget || 2000}
                rates={rates}
                onBookAll={handleBookAll}
            />
        </div>
    );
}
