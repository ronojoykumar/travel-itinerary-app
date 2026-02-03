"use client";

import { useState, useEffect } from "react";
import { DollarSign } from "lucide-react";

interface BudgetSliderProps {
    initialValue?: number;
    onChange?: (value: number) => void;
}

export function BudgetSlider({ initialValue = 1500, onChange }: BudgetSliderProps) {
    const [budget, setBudget] = useState(initialValue);

    useEffect(() => {
        setBudget(initialValue);
    }, [initialValue]);

    const handleChange = (value: number) => {
        setBudget(value);
        onChange?.(value);
    };

    return (
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm text-gray-900">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h3 className="font-bold text-lg">Adjust Budget</h3>
                    <p className="text-gray-500 text-sm">Modify your spending limit</p>
                </div>
                <div className="text-2xl font-bold text-primary flex items-center">
                    <DollarSign size={20} className="mt-1" />
                    {budget}
                </div>
            </div>

            <input
                type="range"
                min="500"
                max="5000"
                step="100"
                value={budget}
                onChange={(e) => handleChange(Number(e.target.value))}
                className="w-full h-3 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary"
            />

            <div className="flex justify-between text-xs text-gray-400 mt-2 font-medium">
                <span>$500</span>
                <span>$5,000</span>
            </div>
        </div>
    );
}
