"use client";

import { MapPin, Lightbulb } from "lucide-react";
import { useState, useEffect } from "react";

interface LocationTipsProps {
    location: string;
    destination: string;
    interests: string[];
}

export function LocationTips({ location, destination, interests }: LocationTipsProps) {
    const [tips, setTips] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (location && destination) {
            fetchTips();
        }
    }, [location, destination]);

    const fetchTips = async () => {
        setLoading(true);
        try {
            const response = await fetch('/api/generate-location-tips', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    location,
                    destination,
                    interests
                }),
            });

            if (response.ok) {
                const data = await response.json();
                setTips(data.tips || []);
            }
        } catch (error) {
            console.error('Failed to fetch location tips:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm mb-6 min-h-[200px] flex items-center justify-center">
                <p className="text-gray-500 text-sm">Getting local tips for {location}...</p>
            </div>
        );
    }

    return (
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm mb-6">
            <div className="flex items-center gap-3 mb-6">
                <div className="bg-purple-100 text-purple-600 p-2 rounded-lg">
                    <MapPin size={24} />
                </div>
                <div>
                    <h3 className="font-bold text-lg">Tips for This Location</h3>
                    <p className="text-gray-500 text-sm">AI-powered contextual guidance for {location}</p>
                </div>
            </div>

            <div className="space-y-2">
                {tips.map((tip, idx) => (
                    <div key={idx} className="bg-purple-50 text-purple-900 text-sm p-3 rounded-lg flex items-start gap-2">
                        <Lightbulb size={16} className="shrink-0 mt-0.5 text-purple-600" />
                        <span>{tip}</span>
                    </div>
                ))}
                {tips.length === 0 && (
                    <p className="text-gray-500 text-sm italic">No specific tips found for this location.</p>
                )}
            </div>
        </div>
    );
}
