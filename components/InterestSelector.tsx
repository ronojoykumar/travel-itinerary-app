"use client";

import { useState } from "react";

export function InterestSelector({ selected, onToggle }: { selected: string[], onToggle: (interest: string) => void }) {
    const interests = [
        "Food", "Culture", "Adventure", "Relaxation",
        "Shopping", "Nightlife", "Nature", "History"
    ];

    return (
        <div className="mb-8">
            <label className="block text-sm font-bold mb-3">Interests</label>
            <div className="flex flex-wrap gap-2">
                {interests.map((interest) => {
                    const isSelected = selected.includes(interest);
                    return (
                        <button
                            key={interest}
                            onClick={() => onToggle(interest)}
                            className={`px-4 py-2 rounded-full text-sm font-medium border transition-colors ${isSelected
                                ? "bg-blue-600 text-white border-blue-600"
                                : "bg-white text-gray-600 border-gray-200 hover:border-gray-300"
                                }`}
                        >
                            {interest}
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
