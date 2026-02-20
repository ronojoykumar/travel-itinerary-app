import { NextRequest, NextResponse } from "next/server";

// ── City → lat/lon lookup (covers popular trip destinations) ─────────────────
const CITY_COORDS: Record<string, { lat: number; lon: number; tz: string }> = {
    // Japan
    tokyo: { lat: 35.6762, lon: 139.6503, tz: "Asia/Tokyo" },
    osaka: { lat: 34.6937, lon: 135.5023, tz: "Asia/Tokyo" },
    kyoto: { lat: 35.0116, lon: 135.7681, tz: "Asia/Tokyo" },
    hiroshima: { lat: 34.3853, lon: 132.4553, tz: "Asia/Tokyo" },
    nara: { lat: 34.6851, lon: 135.8048, tz: "Asia/Tokyo" },
    narita: { lat: 35.7763, lon: 140.3929, tz: "Asia/Tokyo" },
    yokohama: { lat: 35.4437, lon: 139.6380, tz: "Asia/Tokyo" },
    sapporo: { lat: 43.0618, lon: 141.3545, tz: "Asia/Tokyo" },
    fukuoka: { lat: 33.5904, lon: 130.4017, tz: "Asia/Tokyo" },
    // South Korea
    seoul: { lat: 37.5665, lon: 126.9780, tz: "Asia/Seoul" },
    busan: { lat: 35.1796, lon: 129.0756, tz: "Asia/Seoul" },
    incheon: { lat: 37.4563, lon: 126.7052, tz: "Asia/Seoul" },
    jeju: { lat: 33.4996, lon: 126.5312, tz: "Asia/Seoul" },
    // South-East Asia
    singapore: { lat: 1.3521, lon: 103.8198, tz: "Asia/Singapore" },
    bangkok: { lat: 13.7563, lon: 100.5018, tz: "Asia/Bangkok" },
    phuket: { lat: 7.8804, lon: 98.3923, tz: "Asia/Bangkok" },
    bali: { lat: -8.4095, lon: 115.1889, tz: "Asia/Makassar" },
    // Middle East
    dubai: { lat: 25.2048, lon: 55.2708, tz: "Asia/Dubai" },
    // Europe
    paris: { lat: 48.8566, lon: 2.3522, tz: "Europe/Paris" },
    london: { lat: 51.5074, lon: -0.1278, tz: "Europe/London" },
    rome: { lat: 41.9028, lon: 12.4964, tz: "Europe/Rome" },
    barcelona: { lat: 41.3851, lon: 2.1734, tz: "Europe/Madrid" },
    amsterdam: { lat: 52.3676, lon: 4.9041, tz: "Europe/Amsterdam" },
    // Americas
    "new york": { lat: 40.7128, lon: -74.0060, tz: "America/New_York" },
    "los angeles": { lat: 34.0522, lon: -118.2437, tz: "America/Los_Angeles" },
    "san francisco": { lat: 37.7749, lon: -122.4194, tz: "America/Los_Angeles" },
    miami: { lat: 25.7617, lon: -80.1918, tz: "America/New_York" },
    // Oceania
    sydney: { lat: -33.8688, lon: 151.2093, tz: "Australia/Sydney" },
    melbourne: { lat: -37.8136, lon: 144.9631, tz: "Australia/Melbourne" },
    // India
    mumbai: { lat: 19.0760, lon: 72.8777, tz: "Asia/Kolkata" },
    delhi: { lat: 28.7041, lon: 77.1025, tz: "Asia/Kolkata" },
    goa: { lat: 15.2993, lon: 74.1240, tz: "Asia/Kolkata" },
};

// Country-name → capital city (fallback when no specific city is mentioned)
const COUNTRY_TO_CAPITAL: Record<string, string> = {
    "japan": "tokyo",
    "south korea": "seoul",
    "korea": "seoul",
    "singapore": "singapore",
    "thailand": "bangkok",
    "uae": "dubai",
    "united arab emirates": "dubai",
    "france": "paris",
    "uk": "london",
    "united kingdom": "london",
    "england": "london",
    "australia": "sydney",
    "india": "delhi",
    "china": "beijing",
    "indonesia": "bali",
    "malaysia": "singapore",
    "vietnam": "bangkok",
    "usa": "new york",
    "united states": "new york",
    "italy": "rome",
    "spain": "barcelona",
    "netherlands": "amsterdam",
};

function resolveCity(destination: string): { lat: number; lon: number; tz: string } | null {
    const d = destination.toLowerCase();
    // 1. Direct city-name match
    for (const [key, coords] of Object.entries(CITY_COORDS)) {
        if (d.includes(key)) return coords;
    }
    // 2. Country-name → capital fallback
    for (const [country, capital] of Object.entries(COUNTRY_TO_CAPITAL)) {
        if (d.includes(country)) return CITY_COORDS[capital] ?? null;
    }
    return null;
}

function wmoToCondition(code: number): { label: string; emoji: string } {
    if (code === 0) return { label: "Clear sky", emoji: "☀️" };
    if (code <= 2) return { label: "Partly cloudy", emoji: "🌤️" };
    if (code === 3) return { label: "Overcast", emoji: "☁️" };
    if (code >= 51 && code <= 57) return { label: "Drizzle", emoji: "🌦️" };
    if (code >= 61 && code <= 67) return { label: "Rain", emoji: "🌧️" };
    if (code >= 71 && code <= 77) return { label: "Snow", emoji: "❄️" };
    if (code >= 80 && code <= 82) return { label: "Rain showers", emoji: "⛈️" };
    if (code >= 85 && code <= 86) return { label: "Snow showers", emoji: "🌨️" };
    if (code >= 95) return { label: "Thunderstorm", emoji: "⛈️" };
    return { label: "Cloudy", emoji: "🌥️" };
}

function shiftDateByYears(iso: string, years: number): string {
    const d = new Date(iso + "T12:00:00");
    d.setFullYear(d.getFullYear() + years);
    return d.toISOString().split("T")[0];
}

function buildForecast(data: any, originalDates: string[]): any[] {
    return data.daily.time.map((date: string, i: number) => {
        const maxC = Math.round(data.daily.temperature_2m_max[i]);
        const minC = Math.round(data.daily.temperature_2m_min[i]);
        const code = data.daily.weathercode?.[i] ?? data.daily.weather_code?.[i] ?? 0;
        // Archive API uses precipitation_sum, not probability
        const rain = data.daily.precipitation_probability_max?.[i]
            ?? (data.daily.precipitation_sum?.[i] > 0 ? Math.min(100, Math.round(data.daily.precipitation_sum[i] * 15)) : 0);
        const { label, emoji } = wmoToCondition(code);
        // For historical fallback, use the original (future) date for display
        const displayDate = originalDates[i] ?? date;
        return {
            date: displayDate,
            dayLabel: new Date(displayDate + "T12:00:00").toLocaleDateString("en-IN", {
                weekday: "short", day: "numeric", month: "short"
            }),
            maxC, minC,
            maxF: Math.round(maxC * 9 / 5 + 32),
            minF: Math.round(minC * 9 / 5 + 32),
            condition: label,
            emoji,
            rainChance: rain,
        };
    });
}

export async function POST(req: NextRequest) {
    try {
        const { destinations, startDate, endDate } = await req.json();

        const parseDate = (raw: string): string => {
            if (!raw) return new Date().toISOString().split("T")[0];
            if (raw.includes("-")) return raw.split("T")[0];
            const [m, d, y] = raw.split("/");
            return `${y}-${m.padStart(2, "0")}-${d.padStart(2, "0")}`;
        };
        const start = parseDate(startDate);
        const end = parseDate(endDate);

        const primary = destinations?.[0] ?? "";
        const coords = resolveCity(primary);

        if (!coords) {
            return NextResponse.json({ error: "Unknown destination", forecast: [] }, { status: 200 });
        }

        // ── Check if trip is within 16-day forecast window ────────────────
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const startDt = new Date(start + "T00:00:00");
        const daysAway = Math.round((startDt.getTime() - today.getTime()) / 86400000);
        const useArchive = daysAway > 16;

        // Generate list of original future dates for display labels
        const originalDates: string[] = [];
        const cur = new Date(start + "T00:00:00");
        const endDt = new Date(end + "T00:00:00");
        while (cur <= endDt) {
            originalDates.push(cur.toISOString().split("T")[0]);
            cur.setDate(cur.getDate() + 1);
        }

        let fetchUrl: string;
        if (useArchive) {
            // Shift back 1 year for historical data
            const histStart = shiftDateByYears(start, -1);
            const histEnd = shiftDateByYears(end, -1);
            fetchUrl = `https://archive-api.open-meteo.com/v1/archive?` +
                `latitude=${coords.lat}&longitude=${coords.lon}` +
                `&daily=temperature_2m_max,temperature_2m_min,weather_code,precipitation_sum` +
                `&start_date=${histStart}&end_date=${histEnd}` +
                `&timezone=${encodeURIComponent(coords.tz)}` +
                `&temperature_unit=celsius`;
        } else {
            fetchUrl = `https://api.open-meteo.com/v1/forecast?` +
                `latitude=${coords.lat}&longitude=${coords.lon}` +
                `&daily=temperature_2m_max,temperature_2m_min,weathercode,precipitation_probability_max` +
                `&start_date=${start}&end_date=${end}` +
                `&timezone=${encodeURIComponent(coords.tz)}` +
                `&temperature_unit=celsius`;
        }

        const res = await fetch(fetchUrl, { next: { revalidate: 3600 } });
        const data = await res.json();

        if (!data.daily?.time) {
            return NextResponse.json({ error: "No weather data available", forecast: [] }, { status: 200 });
        }

        const forecast = buildForecast(data, originalDates);

        return NextResponse.json({
            forecast,
            destination: primary,
            isHistorical: useArchive,
            historicalYear: useArchive ? new Date(start + "T00:00:00").getFullYear() - 1 : null,
        });

    } catch (err) {
        console.error("Weather API error:", err);
        return NextResponse.json({ error: "Failed to fetch weather", forecast: [] }, { status: 500 });
    }
}
