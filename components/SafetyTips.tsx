"use client";

import { AlertTriangle } from "lucide-react";
import { useState, useEffect } from "react";

interface SafetyTipsProps {
    destination: string;
}

export function SafetyTips({ destination }: SafetyTipsProps) {
    const [tips, setTips] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchSafetyTips();
    }, []);

    const fetchSafetyTips = async () => {
        setLoading(true);
        try {
            const response = await fetch('/api/generate-safety-culture', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ destination }),
            });

            if (response.ok) {
                const data = await response.json();
                setTips(data.safetyTips || []);
            }
        } catch (error) {
            console.error('Failed to fetch safety tips:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm h-full">
                <p className="text-gray-500 text-sm">Loading safety tips...</p>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm h-full">
            <div className="flex items-center gap-3 mb-6">
                <div className="bg-yellow-50 text-yellow-600 p-2 rounded-lg">
                    <AlertTriangle size={24} />
                </div>
                <div>
                    <h3 className="font-bold text-lg">Safety Tips</h3>
                    <p className="text-gray-500 text-sm">Stay safe in {destination}</p>
                </div>
            </div>

            <ul className="space-y-3 text-sm text-gray-600 list-disc pl-4 leading-relaxed">
                {tips.map((tip, idx) => (
                    <li key={idx}>{tip}</li>
                ))}
            </ul>
        </div>
    );
}
