import { NextResponse } from 'next/server';

// Uses frankfurter.app – a free, no-key-required exchange rate API
// backed by the European Central Bank dataset.
// Rates are cached for 1 hour to avoid hitting it on every render.

let cachedRates: Record<string, number> | null = null;
let cacheTime = 0;
const CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour

async function fetchRates(): Promise<Record<string, number>> {
    const now = Date.now();
    if (cachedRates && now - cacheTime < CACHE_TTL_MS) {
        return cachedRates;
    }

    // Fetch rates relative to USD so all source currencies can be normalised
    // to USD first, then USD → INR.
    // Also fetch INR relative to USD directly.
    const res = await fetch(
        'https://api.frankfurter.app/latest?from=USD&to=INR,JPY,KRW,EUR,GBP,AED,SGD,THB,CNY,AUD,CAD',
        { next: { revalidate: 3600 } }
    );

    if (!res.ok) {
        throw new Error(`Frankfurter API error: ${res.status}`);
    }

    const json = await res.json();
    // json.rates = { INR: 84.25, JPY: 149.2, KRW: 1345, ... } all relative to 1 USD
    cachedRates = json.rates as Record<string, number>;
    cacheTime = now;
    return cachedRates;
}

export async function GET() {
    try {
        const rates = await fetchRates();

        // Build a convenience map: how many INR per 1 unit of each currency
        // e.g. JPY_to_INR = INR_per_USD / JPY_per_USD = 84.25 / 149.2 ≈ 0.565
        const inrPerUsd = rates['INR'] ?? 84;
        const inrRates: Record<string, number> = { USD: inrPerUsd };

        for (const [currency, perUsd] of Object.entries(rates)) {
            if (currency !== 'INR') {
                inrRates[currency] = inrPerUsd / perUsd;
            }
        }

        return NextResponse.json({
            base: 'INR',
            rates: inrRates,          // e.g. { USD: 84.25, JPY: 0.565, KRW: 0.063, ... }
            fetchedAt: new Date().toISOString(),
        });
    } catch (error: any) {
        console.error('Exchange rate fetch failed:', error);
        // Return sensible fallback rates so the app never crashes
        return NextResponse.json({
            base: 'INR',
            rates: {
                USD: 84.25,
                JPY: 0.565,
                KRW: 0.063,
                EUR: 91.5,
                GBP: 106.8,
                AED: 22.95,
                SGD: 62.4,
                THB: 2.45,
                CNY: 11.6,
                AUD: 54.2,
                CAD: 61.8,
            },
            fetchedAt: new Date().toISOString(),
            fallback: true,
        });
    }
}
