import { NextRequest, NextResponse } from "next/server";

/**
 * POST /api/travel-duration
 * Uses Google Maps Distance Matrix API to return real travel durations
 * for multiple transport modes between two locations.
 *
 * Body: { origin: string, destination: string }
 * Returns: { durations: { mode: string, durationText: string, durationSecs: number }[] }
 */

const GOOGLE_MAPS_KEY = process.env.GOOGLE_MAPS_API_KEY ?? "";

// Maps our internal transport type to Google DM API travel_mode
const MODE_MAP: Record<string, string> = {
    train: "transit",
    bus: "transit",
    cab: "driving",
    walk: "walking",
    flight: "driving",  // flights have no DM equivalent — use driving as estimate
};

interface ModeResult {
    type: string;
    durationText: string;
    durationSecs: number;
}

async function fetchDuration(
    origin: string,
    destination: string,
    travelMode: string,
    transitMode?: string   // "rail" | "bus" for transit sub-mode
): Promise<{ durationText: string; durationSecs: number } | null> {
    if (!GOOGLE_MAPS_KEY) return null;

    let url =
        `https://maps.googleapis.com/maps/api/distancematrix/json` +
        `?origins=${encodeURIComponent(origin)}` +
        `&destinations=${encodeURIComponent(destination)}` +
        `&mode=${travelMode}` +
        `&language=en` +
        `&key=${GOOGLE_MAPS_KEY}`;

    if (travelMode === "transit" && transitMode) {
        url += `&transit_mode=${transitMode}`;
    }

    const res = await fetch(url, { next: { revalidate: 3600 } }); // cache 1h
    const data = await res.json();

    const element = data?.rows?.[0]?.elements?.[0];
    if (!element || element.status !== "OK") return null;

    return {
        durationText: element.duration.text,          // e.g. "23 mins"
        durationSecs: element.duration.value,         // e.g. 1380
    };
}

export async function POST(req: NextRequest) {
    try {
        const { origin, destination, types } = await req.json();
        // types: array like ["train","cab","walk"] — what modes to query

        if (!GOOGLE_MAPS_KEY) {
            return NextResponse.json(
                { error: "GOOGLE_MAPS_API_KEY not configured", durations: [] },
                { status: 200 }
            );
        }

        if (!origin || !destination) {
            return NextResponse.json({ error: "Missing origin or destination", durations: [] }, { status: 200 });
        }

        const requestedTypes: string[] = types ?? ["train", "cab", "walk"];

        // De-duplicate travel modes so we don't call the API twice for train+bus (both transit)
        const modeSet = new Set<string>();
        const fetches: Promise<ModeResult | null>[] = [];

        for (const type of requestedTypes) {
            const gmMode = MODE_MAP[type] ?? "driving";
            const transitMode = (type === "train") ? "rail" : (type === "bus") ? "bus" : undefined;
            const cacheKey = `${gmMode}-${transitMode ?? ""}`;

            if (modeSet.has(cacheKey)) {
                // Reuse already-queued result — push a null and we'll fill from sibling
                fetches.push(Promise.resolve(null));
                continue;
            }
            modeSet.add(cacheKey);

            fetches.push(
                fetchDuration(origin, destination, gmMode, transitMode).then(r =>
                    r ? { type, durationText: r.durationText, durationSecs: r.durationSecs } : null
                )
            );
        }

        const results = await Promise.all(fetches);

        // Map results back to each requested type
        // (for dupes, find the nearest sibling result with the same mode)
        const durations: ModeResult[] = requestedTypes.map((type, i) => {
            if (results[i]) return results[i]!;
            // Find the first non-null result with the same GM mode
            const gmMode = MODE_MAP[type] ?? "driving";
            const sibling = results.find((r, j) =>
                r && j !== i && (MODE_MAP[requestedTypes[j]] ?? "driving") === gmMode
            );
            return sibling
                ? { type, durationText: sibling.durationText, durationSecs: sibling.durationSecs }
                : { type, durationText: "–", durationSecs: 0 };
        });

        return NextResponse.json({ durations, origin, destination });

    } catch (err) {
        console.error("Travel duration API error:", err);
        return NextResponse.json({ error: "Failed to fetch durations", durations: [] }, { status: 500 });
    }
}
