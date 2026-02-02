"use client";

import { useState } from "react";

export function TripTypeSelector({ selected, onSelect }: { selected: string, onSelect: (type: string) => void }) {
    return (
        <div className="mb-6">
            <label className="block text-sm font-bold mb-2">Trip Type</label>
            <div className="flex bg-gray-100 p-1 rounded-xl">
                {["Weekend", "Multi-City"].map((type) => (
                    <button
                        key={type}
                        onClick={() => onSelect(type)}
                        className={`flex-1 py-3 rounded-lg text-sm font-bold transition-all ${selected === type
                            ? "bg-blue-600 text-white shadow-sm"
                            : "text-gray-500 hover:text-gray-700"
                            }`}
                    >
                        {type}
                    </button>
                ))}
            </div>
        </div>
    );
}
