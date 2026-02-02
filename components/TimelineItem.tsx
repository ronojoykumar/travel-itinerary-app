import { LucideIcon, Plane, Train, Bed, Utensils, Camera, MapPin } from "lucide-react";

interface TimelineItemProps {
    type: "flight" | "train" | "hotel" | "activity" | "food";
    time: string;
    title: string;
    description?: string;
    price?: string; // e.g. "$120"
    duration?: string;
    isHighlight?: boolean; // For the blue/purple gradient cards
}

export function TimelineItem({ type, time, title, description, price, duration, isHighlight }: TimelineItemProps) {

    const getIcon = () => {
        switch (type) {
            case "flight": return Plane;
            case "train": return Train;
            case "hotel": return Bed;
            case "food": return Utensils;
            case "activity": return Camera;
            default: return MapPin;
        }
    };

    const Icon = getIcon();

    if (isHighlight) {
        return (
            <div className="flex gap-4 mb-6 relative">
                <div className="flex flex-col items-center">
                    <div className="w-3 h-3 bg-primary rounded-full z-10"></div>
                    <div className="w-0.5 h-full bg-gray-200 absolute top-3"></div>
                </div>
                <div className="flex-1">
                    <div className="text-xs text-gray-500 mb-1 font-mono">{time}</div>
                    <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-5 text-white shadow-lg cursor-pointer hover:shadow-xl transition-shadow">
                        <div className="flex justify-between items-start mb-2">
                            <div className="flex items-center gap-2 bg-white/20 px-2 py-1 rounded text-xs">
                                <Icon size={14} />
                                <span className="capitalize">{type}</span>
                            </div>
                        </div>
                        <h3 className="text-lg font-bold mb-1">{title}</h3>
                        {description && <p className="text-blue-100 text-sm mb-3">{description}</p>}

                        <div className="flex justify-between items-center text-sm border-t border-white/20 pt-3 mt-1">
                            <div className="opacity-90">{duration}</div>
                            <div className="font-bold bg-white text-blue-600 px-3 py-1 rounded-full text-xs">{price}</div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="flex gap-4 mb-6 relative group">
            <div className="flex flex-col items-center">
                <div className="w-3 h-3 bg-gray-300 rounded-full z-10 group-hover:bg-primary transition-colors"></div>
                {/* Line connection logic would happen in parent or via absolute positioning, simplified here */}
                <div className="w-0.5 h-full bg-gray-200 absolute top-3"></div>
            </div>
            <div className="flex-1">
                <div className="text-xs text-gray-500 mb-1 font-mono">{time}</div>
                <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm hover:border-gray-300 transition-colors">
                    <div className="flex justify-between items-start">
                        <div className="flex gap-3">
                            <div className="w-10 h-10 bg-gray-50 rounded-lg flex items-center justify-center text-gray-600">
                                <Icon size={20} />
                            </div>
                            <div>
                                <h3 className="font-bold text-gray-900">{title}</h3>
                                {description && <p className="text-sm text-gray-500">{description}</p>}
                            </div>
                        </div>
                        {price && <div className="text-sm font-semibold text-gray-900">{price}</div>}
                    </div>
                    {duration && (
                        <div className="mt-2 pl-[52px] text-xs text-gray-400 flex gap-4">
                            <span>{duration}</span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
