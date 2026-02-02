"use client";

import { Sparkles, Lightbulb, TrendingUp, Heart, Star } from "lucide-react";
import { useState, useEffect } from "react";

interface Suggestion {
    title: string;
    description: string;
    icon: string;
}

interface AISuggestionsProps {
    itinerary: any[];
    budgetChange: number;
    paceChange?: string;
    destination: string;
}

export function AISuggestions({ itinerary, budgetChange, paceChange, destination }: AISuggestionsProps) {
    const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchSuggestions();
    }, [budgetChange, paceChange]);

    const fetchSuggestions = async () => {
        setLoading(true);
        try {
            const response = await fetch('/api/generate-suggestions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    itinerary,
                    budgetChange,
                    paceChange,
                    destination
                }),
            });

            if (response.ok) {
                const data = await response.json();
                setSuggestions(data.suggestions || []);
            }
        } catch (error) {
            console.error('Failed to fetch suggestions:', error);
        } finally {
            setLoading(false);
        }
    };

    const getIcon = (iconName: string) => {
        switch (iconName) {
            case 'lightbulb': return Lightbulb;
            case 'trending-up': return TrendingUp;
            case 'heart': return Heart;
            case 'star': return Star;
            default: return Sparkles;
        }
    };

    if (loading) {
        return (
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-2xl border border-blue-100 mt-8">
                <p className="text-blue-600 text-sm">Generating AI suggestions...</p>
            </div>
        );
    }

    if (suggestions.length === 0) return null;

    return (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-2xl border border-blue-100 mt-8">
            <div className="flex items-start gap-4">
                <div className="bg-blue-600 text-white p-2 rounded-lg shrink-0">
                    <Sparkles size={20} />
                </div>
                <div className="flex-1">
                    <h3 className="font-bold text-blue-900 mb-3">AI Suggestions</h3>
                    <div className="space-y-3">
                        {suggestions.map((suggestion, idx) => {
                            const Icon = getIcon(suggestion.icon);
                            return (
                                <div key={idx} className="flex items-start gap-2">
                                    <Icon size={16} className="text-blue-600 mt-0.5 shrink-0" />
                                    <div>
                                        <p className="text-sm font-semibold text-blue-900">{suggestion.title}</p>
                                        <p className="text-xs text-blue-800/70">{suggestion.description}</p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
}
