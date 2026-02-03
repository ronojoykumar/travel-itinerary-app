"use client";

import { useState, useEffect } from "react";

interface TripPaceSliderProps {
    initialValue?: number;
    onChange?: (value: number) => void;
}

export function TripPaceSlider({ initialValue = 2, onChange }: TripPaceSliderProps) {
    const [pace, setPace] = useState(initialValue); // 1 = Relaxed, 2 = Moderate, 3 = Packed

    useEffect(() => {
        setPace(initialValue);
    }, [initialValue]);

    const getPaceLabel = (val: number) => {
        if (val === 1) return "Relaxed";
        if (val === 2) return "Moderate";
        return "Packed";
    };

    const handleChange = (value: number) => {
        setPace(value);
        onChange?.(value);
    };

    return (
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm mt-6 text-gray-900">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h3 className="font-bold text-lg">Trip Pace</h3>
                    <p className="text-gray-500 text-sm">Adjust activity density</p>
                </div>
                <div className="bg-gray-100 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide">
                    {getPaceLabel(pace)}
                </div>
            </div>

            <input
                type="range"
                min="1"
                max="3"
                step="1"
                value={pace}
                onChange={(e) => handleChange(Number(e.target.value))}
                className="w-full h-3 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-gray-900"
                style={{
                    background: `linear-gradient(to right, #111827 ${(pace - 1) * 50}%, #e5e7eb ${(pace - 1) * 50}%)`
                }}
            />

            <div className="flex justify-between text-xs text-gray-400 mt-2 font-medium">
                <span>Relaxed</span>
                <span>Moderate</span>
                <span>Packed</span>
            </div>
        </div>
    );
}
