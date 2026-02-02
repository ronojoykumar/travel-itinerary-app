"use client";

import { Train, Car, Footprints, Sparkles, CheckCircle2 } from "lucide-react";
import { useState } from "react";

interface TransportOptionsProps {
    destination: string;
}

export function TransportOptions({ destination }: TransportOptionsProps) {
    const [selected, setSelected] = useState<string | null>(null);

    const options = [
        {
            id: 'metro',
            type: 'Metro',
            icon: Train,
            label: 'Metro',
            provider: 'Tokyo Metro',
            duration: '15 min',
            price: '$2',
            frequency: 'Every 5 min',
            aiPick: true,
            color: 'blue'
        },
        {
            id: 'taxi',
            type: 'Taxi',
            icon: Car,
            label: 'Taxi',
            provider: 'Taxi/Uber',
            duration: '12 min',
            price: '$8-12',
            frequency: 'Available now',
            aiPick: false,
            color: 'gray'
        },
        {
            id: 'walk',
            type: 'Walk',
            icon: Footprints,
            label: 'Walk',
            provider: 'Walking',
            duration: '40 min',
            price: 'Free',
            frequency: 'Start anytime',
            aiPick: false,
            color: 'gray'
        }
    ];

    return (
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm mb-6">
            <div className="flex items-center gap-3 mb-6">
                <div className="bg-cyan-100 text-cyan-600 p-2 rounded-lg">
                    <Train size={24} />
                </div>
                <div>
                    <h3 className="font-bold text-lg">Transport to Next Location</h3>
                    <p className="text-gray-500 text-sm">Options for getting to {destination}</p>
                </div>
            </div>

            <div className="flex gap-4 overflow-x-auto pb-2 snap-x">
                {options.map((option) => {
                    const isSelected = selected === option.id;
                    const Icon = option.icon;
                    return (
                        <div
                            key={option.id}
                            onClick={() => setSelected(option.id)}
                            className={`min-w-[200px] rounded-xl p-4 relative snap-center cursor-pointer transition-all border-2 ${isSelected
                                    ? 'border-blue-600 bg-blue-50/50'
                                    : option.aiPick
                                        ? 'border-blue-200 bg-blue-50 shadow-sm'
                                        : 'border-gray-100 bg-white hover:border-gray-200'
                                }`}
                        >
                            {option.aiPick && (
                                <div className="absolute top-0 right-0 bg-blue-500 text-white text-[10px] font-bold px-2 py-1 rounded-bl-lg rounded-tr-lg flex items-center gap-1">
                                    <Sparkles size={10} /> AI Pick
                                </div>
                            )}

                            {isSelected && (
                                <div className="absolute top-2 right-2 text-blue-600">
                                    <CheckCircle2 size={20} />
                                </div>
                            )}

                            <div className="flex items-center gap-2 mb-3">
                                <div className={`p-1.5 rounded-lg ${isSelected ? 'bg-blue-200 text-blue-700' : 'bg-gray-100 text-gray-700'}`}>
                                    <Icon size={16} />
                                </div>
                                <span className="font-bold text-sm">{option.label}</span>
                            </div>
                            <div className="text-xs text-gray-500 mb-4">{option.provider}</div>

                            <div className="space-y-1 text-sm mb-4">
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Duration:</span>
                                    <span className="font-bold">{option.duration}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Price:</span>
                                    <span className={`font-bold ${option.price === 'Free' ? 'text-green-600' : 'text-blue-600'}`}>{option.price}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Next:</span>
                                    <span className="font-medium">{option.frequency}</span>
                                </div>
                            </div>

                            <button className={`w-full py-2 rounded-lg text-xs font-bold transition-colors ${isSelected
                                    ? 'bg-blue-600 text-white'
                                    : 'border border-gray-200 text-gray-600 hover:bg-gray-50'
                                }`}>
                                {isSelected ? 'Selected' : `Select ${option.type}`}
                            </button>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
