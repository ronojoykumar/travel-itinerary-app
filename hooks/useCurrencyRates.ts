"use client";

import { useState, useEffect } from "react";

export type ExchangeRates = Record<string, number>;

interface RateState {
    rates: ExchangeRates;
    loading: boolean;
    error: boolean;
    fetchedAt: string | null;
}

const FALLBACK_RATES: ExchangeRates = { USD: 84.25 };

let _rateCache: RateState | null = null;

export function useCurrencyRates(): RateState {
    const [state, setState] = useState<RateState>(
        _rateCache ?? { rates: FALLBACK_RATES, loading: true, error: false, fetchedAt: null }
    );

    useEffect(() => {
        if (_rateCache && !_rateCache.loading) {
            setState(_rateCache);
            return;
        }

        fetch("/api/exchange-rates")
            .then((r) => r.json())
            .then((data) => {
                const next: RateState = {
                    // Only keep the USD→INR rate — everything else is unused
                    rates: { USD: data.rates?.USD ?? 84.25 },
                    loading: false,
                    error: false,
                    fetchedAt: data.fetchedAt,
                };
                _rateCache = next;
                setState(next);
            })
            .catch(() => {
                const next: RateState = {
                    rates: FALLBACK_RATES,
                    loading: false,
                    error: true,
                    fetchedAt: null,
                };
                _rateCache = next;
                setState(next);
            });
    }, []);

    return state;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

/**
 * All AI-generated prices are in USD.
 * Simply multiply by the live USD→INR rate.
 */
export function toINR(priceUsd: number, rates: ExchangeRates): number {
    const rate = rates["USD"] ?? 84.25;
    return Math.round(priceUsd * rate);
}

/** Format a number as ₹ in the en-IN locale (e.g. ₹12,450) */
export function formatINR(amount: number): string {
    return new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(amount);
}
