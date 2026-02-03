import { ChevronRight } from "lucide-react";

interface ItineraryItem {
    type: string;
    data: {
        title?: string;
        time?: string;
        location?: string;
        price?: any;
    };
}

interface ComingUpNextProps {
    items: ItineraryItem[];
}

export function ComingUpNext({ items }: ComingUpNextProps) {
    if (items.length === 0) return null;

    return (
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm mb-6 text-gray-900">
            <h3 className="font-bold text-lg mb-4">Coming Up Next</h3>

            <div className="space-y-4">
                {items.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-4 p-3 hover:bg-gray-50 rounded-xl transition-colors cursor-pointer group border border-transparent hover:border-gray-100">
                        <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden flex items-center justify-center text-2xl">
                            {/* Simple categorization based on title/type */}
                            {item.type === 'meal' ? '🍽️' : '📍'}
                        </div>
                        <div className="flex-1">
                            <h4 className="font-bold text-gray-900">{item.data.title || "Next Stop"}</h4>
                            <p className="text-xs text-gray-500">
                                {item.data.time || "TBD"} • {item.data.location || "Location TBD"}
                            </p>
                        </div>
                        <ChevronRight size={20} className="text-gray-300 group-hover:text-gray-500" />
                    </div>
                ))}
            </div>
        </div>
    );
}
