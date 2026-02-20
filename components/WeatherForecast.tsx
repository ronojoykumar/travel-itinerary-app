"use client";

import { useState, useEffect } from "react";
import { CloudRain, CloudSun, Sun, Cloud, Umbrella, Thermometer, ChevronLeft, ChevronRight } from "lucide-react";

interface WeatherForecastProps {
    destinations: string[];
    startDate: string;
    endDate: string;
}

interface DayForecast {
    date: string;
    dayLabel: string;
    maxC: number;
    minC: number;
    condition: string;
    emoji: string;
    rainChance: number;
}

interface DestForecast {
    destination: string;
    displayName: string;
    forecast: DayForecast[];
    isHistorical?: boolean;
    historicalYear?: number | null;
    error?: string;
}

function ConditionIcon({ condition, size = 16 }: { condition: string; size?: number }) {
    const c = condition.toLowerCase();
    const cls = `shrink-0`; const s = size;
    if (c.includes("rain") || c.includes("drizzle") || c.includes("thunder"))
        return <CloudRain size={s} className={cls} />;
    if (c.includes("partly") || c.includes("shower"))
        return <CloudSun size={s} className={cls} />;
    if (c.includes("cloud") || c.includes("overcast"))
        return <Cloud size={s} className={cls} />;
    return <Sun size={s} className={cls} />;
}

function iconColor(condition: string): string {
    const c = condition.toLowerCase();
    if (c.includes("rain") || c.includes("thunder")) return "#74B9FF";
    if (c.includes("cloud") || c.includes("overcast")) return "#A0AEC0";
    return "#F6AD55";
}

export function WeatherForecast({ destinations, startDate, endDate }: WeatherForecastProps) {
    const [destForecasts, setDestForecasts] = useState<DestForecast[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeIdx, setActiveIdx] = useState(0);

    useEffect(() => {
        fetchAll();
    }, []);

    const fetchAll = async () => {
        setLoading(true);
        // Deduplicate destinations
        const unique = Array.from(new Set(destinations.filter(Boolean)));
        const results: DestForecast[] = await Promise.all(
            unique.map(async (dest) => {
                const displayName = dest.split(",")[0].trim();
                try {
                    const res = await fetch("/api/weather-forecast", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                            destinations: [dest],
                            startDate,
                            endDate,
                        }),
                    });
                    const data = await res.json();
                    if (data.forecast?.length) {
                        return {
                            destination: dest,
                            displayName,
                            forecast: data.forecast,
                            isHistorical: data.isHistorical ?? false,
                            historicalYear: data.historicalYear ?? null,
                        };
                    }
                    return { destination: dest, displayName, forecast: [], error: data.error ?? "No forecast" };
                } catch {
                    return { destination: dest, displayName, forecast: [], error: "Network error" };
                }
            })
        );
        setDestForecasts(results);
        setLoading(false);
    };

    const active = destForecasts[activeIdx];
    const avgMax = active?.forecast.length
        ? Math.round(active.forecast.reduce((s, d) => s + d.maxC, 0) / active.forecast.length)
        : null;
    const maxRain = active?.forecast.length
        ? Math.max(...active.forecast.map(d => d.rainChance))
        : null;

    return (
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm h-full text-gray-900 flex flex-col">
            {/* Blue gradient header */}
            <div className="px-5 py-4 shrink-0"
                style={{ background: "linear-gradient(135deg,#74B9FF 0%,#0984e3 100%)" }}>
                <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                        <CloudSun className="h-5 w-5 text-white" />
                        <div>
                            <p className="font-bold text-white text-sm">Weather Forecast</p>
                            <p className="text-white/70 text-xs">
                                {loading ? "Loading…" : active?.displayName ?? destinations[0]?.split(",")[0]}
                            </p>
                        </div>
                    </div>
                    {avgMax !== null && (
                        <div className="text-right">
                            <p className="text-2xl font-black text-white">{avgMax}°C</p>
                            <p className="text-white/70 text-[10px]">avg high</p>
                        </div>
                    )}
                </div>

                {/* Summary chips */}
                {!loading && avgMax !== null && maxRain !== null && (
                    <div className="flex gap-2 mt-2">
                        <span className="flex items-center gap-1 bg-white/20 px-2 py-1 rounded-full text-white text-[11px] font-semibold">
                            <Thermometer className="h-3 w-3" />
                            {Math.round(avgMax * 9 / 5 + 32)}°F avg
                        </span>
                        {maxRain > 0 && (
                            <span className="flex items-center gap-1 bg-white/20 px-2 py-1 rounded-full text-white text-[11px] font-semibold">
                                <Umbrella className="h-3 w-3" />
                                Up to {maxRain}% rain
                            </span>
                        )}
                    </div>
                )}

                {/* Destination tabs (only when multiple) */}
                {!loading && destForecasts.length > 1 && (
                    <div className="flex items-center gap-1 mt-3 overflow-x-auto no-scrollbar">
                        {destForecasts.map((df, i) => (
                            <button
                                key={df.destination}
                                onClick={() => setActiveIdx(i)}
                                className="shrink-0 px-3 py-1 rounded-full text-[11px] font-bold transition-all"
                                style={{
                                    background: i === activeIdx ? "#fff" : "rgba(255,255,255,0.2)",
                                    color: i === activeIdx ? "#0984e3" : "#fff",
                                }}
                            >
                                {df.displayName}
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {/* Forecast body */}
            <div className="p-4 flex-1 overflow-hidden flex flex-col">
                {loading && (
                    <div className="space-y-2.5">
                        {[1, 2, 3, 4, 5].map(i => (
                            <div key={i} className="h-9 rounded-xl bg-gray-100 animate-pulse" />
                        ))}
                    </div>
                )}

                {!loading && active?.error && (
                    <div className="text-center py-6">
                        <p className="text-gray-400 text-sm">{active.error}</p>
                        <button onClick={fetchAll} className="mt-2 text-xs text-blue-500 hover:underline">Retry</button>
                    </div>
                )}

                {!loading && !active?.error && active?.forecast.length > 0 && (
                    <>
                        <div className="space-y-1 overflow-y-auto flex-1 pr-0.5">
                            {active.forecast.map((day, idx) => (
                                <div key={day.date}
                                    className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-gray-50 transition-colors">
                                    {/* Day badge */}
                                    <div className="w-6 h-6 rounded-lg flex items-center justify-center shrink-0 text-[10px] font-black"
                                        style={{ background: "#EDE9FF", color: "#6C5CE7" }}>
                                        {idx + 1}
                                    </div>
                                    {/* Label */}
                                    <div className="flex-1 min-w-0">
                                        <p className="text-xs font-semibold text-slate-700 truncate">{day.dayLabel}</p>
                                        <p className="text-[10px] text-slate-400">{day.condition}</p>
                                    </div>
                                    {/* Rain chance */}
                                    {day.rainChance > 20 && (
                                        <span className="text-[10px] text-blue-400 font-semibold flex items-center gap-0.5 shrink-0">
                                            <Umbrella className="h-2.5 w-2.5" />{day.rainChance}%
                                        </span>
                                    )}
                                    {/* Icon */}
                                    <span style={{ color: iconColor(day.condition) }}>
                                        <ConditionIcon condition={day.condition} size={15} />
                                    </span>
                                    {/* Temp */}
                                    <div className="text-right shrink-0">
                                        <span className="text-sm font-black text-slate-900">{day.maxC}°</span>
                                        <span className="text-xs text-slate-400 ml-1">/ {day.minC}°C</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <p className={`text-[10px] text-center mt-3 shrink-0 px-2 py-1.5 rounded-lg ${active.isHistorical
                                ? "bg-amber-50 text-amber-600 font-medium"
                                : "text-gray-400"
                            }`}>
                            {active.isHistorical
                                ? `📅 No forecast available yet — showing ${active.historicalYear ?? "last year"}'s data for the same dates as a reference`
                                : "Live data via Open-Meteo · updated hourly"}
                        </p>
                    </>
                )}
            </div>
        </div>
    );
}
