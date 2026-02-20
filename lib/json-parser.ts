/**
 * lib/json-parser.ts
 * Defensive JSON parsing for all AI-generated responses.
 *
 * Problem: LLMs sometimes prepend natural language ("I'm sorry, here is...")
 * or wrap JSON in markdown fences (```json ... ```) even when told not to.
 * A bare JSON.parse() then throws SyntaxError and crashes the worker.
 *
 * Solution:
 *  1. Strip markdown code fences
 *  2. Use regex to extract the first top-level { } or [ ] block
 *  3. Parse the extracted string
 *  4. On any failure, return a typed fallback so callers never crash
 */

// ─── Array parser ─────────────────────────────────────────────────────────────

export interface ParseArrayResult<T> {
    data: T[];
    ok: boolean;
    raw?: string;
}

/**
 * Safely parse an AI response that should be a JSON array.
 * Falls back to [] on any failure.
 */
export function safeParseArray<T = any>(raw: string | null | undefined): ParseArrayResult<T> {
    if (!raw) return { data: [], ok: false };

    try {
        const cleaned = extractJson(raw, "array");
        const parsed = JSON.parse(cleaned);
        if (Array.isArray(parsed)) return { data: parsed as T[], ok: true };

        // Model returned an object with an array inside (e.g. { itinerary: [...] })
        const firstArray = Object.values(parsed).find(v => Array.isArray(v));
        if (firstArray) return { data: firstArray as T[], ok: true };

        return { data: [], ok: false, raw };
    } catch {
        return { data: [], ok: false, raw: raw.slice(0, 200) };
    }
}

// ─── Object parser ────────────────────────────────────────────────────────────

export interface ParseObjectResult<T extends Record<string, any>> {
    data: T | null;
    ok: boolean;
    raw?: string;
}

/**
 * Safely parse an AI response that should be a JSON object.
 * Falls back to null on failure.
 */
export function safeParseObject<T extends Record<string, any> = Record<string, any>>(
    raw: string | null | undefined
): ParseObjectResult<T> {
    if (!raw) return { data: null, ok: false };

    try {
        const cleaned = extractJson(raw, "object");
        const parsed = JSON.parse(cleaned);
        if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
            return { data: parsed as T, ok: true };
        }
        return { data: null, ok: false, raw };
    } catch {
        return { data: null, ok: false, raw: raw.slice(0, 200) };
    }
}

// ─── Core extractor ───────────────────────────────────────────────────────────

/**
 * Strip markdown fences and extract the first JSON block from a string.
 * @param type - "array" to search for [...], "object" for {...}
 */
export function extractJson(raw: string, type: "array" | "object" = "object"): string {
    // 1. Remove markdown code fences (```json ... ``` or ``` ... ```)
    let s = raw
        .replace(/```json\s*/gi, "")
        .replace(/```\s*/g, "")
        .trim();

    // 2. Extract the outermost JSON container via regex
    if (type === "array") {
        const match = s.match(/\[[\s\S]*\]/);
        if (match) return match[0];
    } else {
        const match = s.match(/\{[\s\S]*\}/);
        if (match) return match[0];
    }

    // 3. If the cleaned string starts with the right bracket, return as-is
    if (type === "array" && s.startsWith("[")) return s;
    if (type === "object" && s.startsWith("{")) return s;

    // 4. Nothing found — return the cleaned string and let JSON.parse throw
    return s;
}

// ─── Itinerary-specific fallback ──────────────────────────────────────────────

export const ITINERARY_FALLBACK = {
    error: "REGEN_REQUIRED",
    items: [] as any[],
    status: 500,
} as const;

/**
 * Parse an itinerary response specifically.
 * Returns { itinerary: [...] } or ITINERARY_FALLBACK.
 */
export function parseItineraryResponse(raw: string | null | undefined): {
    itinerary: any[];
    error?: string;
    status?: number;
} {
    const { data, ok } = safeParseArray(raw);
    if (ok && data.length > 0) return { itinerary: data };

    console.error("[json-parser] Failed to parse itinerary. Raw snippet:", raw?.slice(0, 300));
    return { ...ITINERARY_FALLBACK, itinerary: ITINERARY_FALLBACK.items };
}
