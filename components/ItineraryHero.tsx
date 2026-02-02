import { Map, Calendar, Users } from "lucide-react";

export function ItineraryHero() {
    return (
        <div className="relative h-64 md:h-80 w-full overflow-hidden">
            {/* Background Image Placeholder - using gradient/color for now */}
            <div className="absolute inset-0 bg-gradient-to-r from-gray-900 via-purple-900 to-gray-900">
                {/* In a real app, <Image /> would go here */}
                <div className="absolute inset-0 bg-black/40" />
            </div>

            <div className="absolute bottom-0 left-0 w-full p-6 text-white bg-gradient-to-t from-black/80 to-transparent">
                <div className="container mx-auto max-w-2xl">
                    <div className="inline-flex items-center gap-1 bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-xs font-medium mb-3">
                        <span className="w-2 h-2 rounded-full bg-green-400"></span>
                        AI Optimized
                    </div>
                    <h1 className="text-3xl md:text-4xl font-bold mb-2">Tokyo Weekend Adventure</h1>
                    <div className="flex items-center gap-4 text-sm text-gray-200">
                        <div className="flex items-center gap-1">
                            <Map size={14} />
                            Tokyo, Japan
                        </div>
                        <div className="flex items-center gap-1">
                            <Calendar size={14} />
                            Feb 14-17, 2026
                        </div>
                        <div className="flex items-center gap-1">
                            <Users size={14} />
                            2 Travelers
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
