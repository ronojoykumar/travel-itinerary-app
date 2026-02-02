"use client";

import { X, Check, ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";

interface FinalizePreviewModalProps {
    isOpen: boolean;
    onClose: () => void;
    originalItinerary: any[];
    updatedItinerary: any[];
    originalBudget: number;
    newBudget: number;
    onConfirm: () => void;
}

export function FinalizePreviewModal({
    isOpen,
    onClose,
    originalItinerary,
    updatedItinerary,
    originalBudget,
    newBudget,
    onConfirm
}: FinalizePreviewModalProps) {
    if (!isOpen) return null;

    // Calculate costs
    const calculateCost = (itinerary: any[]) => {
        let total = 0;
        itinerary.forEach(item => {
            if (item.type === "activity" && item.data.price) {
                total += typeof item.data.price === 'number' ? item.data.price : parseFloat(item.data.price);
            }
            if (item.type === "meal" && item.data.price) {
                total += item.data.price;
            }
        });
        return Math.round(total);
    };

    const originalCost = calculateCost(originalItinerary);
    const newCost = calculateCost(updatedItinerary);
    const costDiff = newCost - originalCost;

    // Group by day
    const groupByDay = (itinerary: any[]) => {
        const groups: Record<number, any[]> = {};
        itinerary.forEach(item => {
            if (!groups[item.day]) groups[item.day] = [];
            groups[item.day].push(item);
        });
        return groups;
    };

    const dayGroups = groupByDay(updatedItinerary);

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col">
                {/* Header */}
                <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                    <div>
                        <h2 className="text-2xl font-bold">Preview Your Updated Itinerary</h2>
                        <p className="text-gray-600 text-sm">Review changes before finalizing</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                        <X size={24} />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6">
                    {/* Cost Comparison */}
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-xl mb-6">
                        <div className="flex justify-between items-center">
                            <div>
                                <p className="text-sm text-gray-600">Original Cost</p>
                                <p className="text-2xl font-bold text-gray-900">${originalCost}</p>
                            </div>
                            <ArrowRight className="text-gray-400" />
                            <div>
                                <p className="text-sm text-gray-600">New Cost</p>
                                <p className="text-2xl font-bold text-blue-600">${newCost}</p>
                            </div>
                            <div className="text-right">
                                <p className="text-sm text-gray-600">Difference</p>
                                <p className={`text-lg font-bold ${costDiff >= 0 ? 'text-red-600' : 'text-green-600'}`}>
                                    {costDiff >= 0 ? '+' : ''}{costDiff}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Day-by-day Summary */}
                    <div className="space-y-4">
                        {Object.keys(dayGroups).sort((a, b) => Number(a) - Number(b)).map(dayNum => (
                            <div key={dayNum} className="border border-gray-200 rounded-xl p-4">
                                <h3 className="font-bold text-lg mb-3">Day {dayNum}</h3>
                                <div className="space-y-2">
                                    {dayGroups[Number(dayNum)].map((item, idx) => {
                                        if (item.type === "activity") {
                                            return (
                                                <div key={idx} className="flex justify-between items-start text-sm">
                                                    <div>
                                                        <p className="font-medium">{item.data.title}</p>
                                                        <p className="text-xs text-gray-500">{item.data.time}</p>
                                                    </div>
                                                    <p className="font-semibold text-blue-600">${item.data.price}</p>
                                                </div>
                                            );
                                        }
                                        if (item.type === "meal") {
                                            return (
                                                <div key={idx} className="flex justify-between items-start text-sm">
                                                    <div>
                                                        <p className="font-medium capitalize">{item.data.mealType} - {item.data.place}</p>
                                                        <p className="text-xs text-gray-500">{item.data.location}</p>
                                                    </div>
                                                    <p className="font-semibold text-orange-600">${item.data.price}</p>
                                                </div>
                                            );
                                        }
                                        return null;
                                    })}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-gray-100 flex gap-3">
                    <button
                        onClick={onClose}
                        className="flex-1 py-3 border border-gray-200 rounded-xl font-medium hover:bg-gray-50 transition-colors"
                    >
                        Go Back
                    </button>
                    <button
                        onClick={onConfirm}
                        className="flex-1 py-3 bg-primary text-white rounded-xl font-bold hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
                    >
                        <Check size={20} />
                        Confirm & Continue
                    </button>
                </div>
            </div>
        </div>
    );
}
