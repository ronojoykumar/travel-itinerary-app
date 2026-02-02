"use client";

import { RefreshCw, Clock, DollarSign } from "lucide-react";
import { useState, useEffect } from "react";

interface Activity {
    title: string;
    description?: string;
    location?: string;
    category: string;
    time: string;
    price: number;
    rating?: number;
}

interface ActivitySwapCardProps {
    activity: Activity;
    destination: string;
    interests: string[];
    budget: number;
    onSwap?: (newActivity: Activity) => void;
}

export function ActivitySwapCard({ activity, destination, interests, budget, onSwap }: ActivitySwapCardProps) {
    const [alternatives, setAlternatives] = useState<Activity[]>([]);
    const [currentActivity, setCurrentActivity] = useState(activity);
    const [isFlipping, setIsFlipping] = useState(false);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchAlternatives();
    }, []);

    const fetchAlternatives = async () => {
        setLoading(true);
        try {
            const response = await fetch('/api/generate-alternatives', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    activity: currentActivity,
                    destination,
                    interests,
                    budget
                }),
            });

            if (response.ok) {
                const data = await response.json();
                setAlternatives(data.alternatives || []);
            }
        } catch (error) {
            console.error('Failed to fetch alternatives:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSwap = () => {
        if (alternatives.length === 0) return;

        setIsFlipping(true);
        setTimeout(() => {
            const nextAlternative = alternatives[0];
            setCurrentActivity(nextAlternative);
            setAlternatives([...alternatives.slice(1), currentActivity]);
            onSwap?.(nextAlternative);
            setIsFlipping(false);
        }, 300);
    };

    return (
        <div className={`bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-between h-full transition-transform duration-300 ${isFlipping ? 'scale-95 opacity-50' : 'scale-100 opacity-100'}`}>
            <div>
                <h4 className="font-bold text-md mb-2">{currentActivity.title}</h4>
                {currentActivity.description && (
                    <p className="text-xs text-gray-600 mb-2">{currentActivity.description}</p>
                )}
                <div className="flex items-center gap-3 text-xs text-gray-500 mb-3">
                    <span className="bg-gray-100 px-2 py-1 rounded-md capitalize">{currentActivity.category}</span>
                    <span className="flex items-center gap-1">
                        <Clock size={12} />
                        {currentActivity.time}
                    </span>
                </div>
                <div className="text-blue-600 font-bold text-lg mb-4 flex items-center">
                    <DollarSign size={18} />
                    {currentActivity.price}
                </div>
            </div>

            <button
                onClick={handleSwap}
                disabled={loading || alternatives.length === 0}
                className="w-full py-2.5 border border-gray-200 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
                <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
                {loading ? 'Loading...' : 'Swap Activity'}
            </button>
        </div>
    );
}
