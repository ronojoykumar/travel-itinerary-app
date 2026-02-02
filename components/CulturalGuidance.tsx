"use client";

import { Lightbulb, Check, X } from "lucide-react";
import { useState, useEffect } from "react";

interface CulturalGuidanceProps {
    destination: string;
}

export function CulturalGuidance({ destination }: CulturalGuidanceProps) {
    const [dos, setDos] = useState<string[]>([]);
    const [donts, setDonts] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchCulturalGuidance();
    }, []);

    const fetchCulturalGuidance = async () => {
        setLoading(true);
        try {
            const response = await fetch('/api/generate-safety-culture', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ destination }),
            });

            if (response.ok) {
                const data = await response.json();
                setDos(data.culturalGuidance?.dos || []);
                setDonts(data.culturalGuidance?.donts || []);
            }
        } catch (error) {
            console.error('Failed to fetch cultural guidance:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm mt-6 mb-8">
                <p className="text-gray-500 text-sm">Loading cultural guidance...</p>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm mt-6 mb-8">
            <div className="flex items-center gap-3 mb-6">
                <div className="bg-purple-100 text-purple-600 p-2 rounded-lg">
                    <Lightbulb size={24} />
                </div>
                <div>
                    <h3 className="font-bold text-lg">Cultural Guidance</h3>
                    <p className="text-gray-500 text-sm">Essential etiquette for your trip</p>
                </div>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
                <div>
                    <h4 className="flex items-center gap-2 font-bold text-green-600 mb-4">
                        <Check size={18} /> Do
                    </h4>
                    <ul className="space-y-3 text-sm text-gray-600">
                        {dos.map((item, idx) => (
                            <li key={idx} className="flex gap-2 items-start">
                                <span className="w-1.5 h-1.5 bg-gray-300 rounded-full mt-1.5 shrink-0"></span>
                                {item}
                            </li>
                        ))}
                    </ul>
                </div>

                <div>
                    <h4 className="flex items-center gap-2 font-bold text-red-500 mb-4">
                        <X size={18} /> Don't
                    </h4>
                    <ul className="space-y-3 text-sm text-gray-600">
                        {donts.map((item, idx) => (
                            <li key={idx} className="flex gap-2 items-start">
                                <span className="w-1.5 h-1.5 bg-gray-300 rounded-full mt-1.5 shrink-0"></span>
                                {item}
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    );
}
