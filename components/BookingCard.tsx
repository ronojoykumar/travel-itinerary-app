import { Star, ExternalLink, Plane, Building, Ticket } from "lucide-react";
import Image from "next/image";

interface BookingCardProps {
    type: "flight" | "hotel" | "activity";
    providerName: string;
    providerLogo?: string; // Placeholder for now
    rating: number;
    price: string;
    priceSubtext?: string; // e.g. "/night"
    badge?: "Best Value" | "Most Popular";
    linkUrl?: string;
    // Specific prop for Flight/Hotel/Activity specific details could go here, keeping it simple for UI demo
    title?: string;
}

export function BookingCard({ type, providerName, rating, price, priceSubtext, badge, title }: BookingCardProps) {

    const getIcon = () => {
        switch (type) {
            case "flight": return Plane;
            case "hotel": return Building;
            case "activity": return Ticket;
            default: return ExternalLink;
        }
    };

    const Icon = getIcon();

    return (
        <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden">
            {badge && (
                <div className={`absolute top-0 left-0 px-3 py-1 text-[10px] font-bold uppercase tracking-wide text-white rounded-br-xl
          ${badge === "Best Value" ? "bg-blue-600" : "bg-purple-600"}`}>
                    {badge}
                </div>
            )}

            <div className="flex justify-between items-start mb-4 mt-2">
                <div className="flex items-center gap-3">
                    {/* Logo Placeholder */}
                    <div className="w-10 h-10 bg-gray-50 rounded-lg flex items-center justify-center text-gray-400">
                        <Icon size={20} />
                    </div>
                    <div>
                        <div className="font-bold text-gray-900">{providerName}</div>
                        <div className="flex items-center text-xs text-amber-500 font-bold">
                            <Star size={10} className="fill-current mr-1" />
                            {rating}
                        </div>
                    </div>
                </div>
            </div>

            {title && <div className="text-sm text-gray-500 mb-4 font-medium">{title}</div>}

            <div className="mb-4">
                <span className="text-2xl font-bold text-blue-600">{price}</span>
                {priceSubtext && <span className="text-gray-400 text-sm font-medium">{priceSubtext}</span>}
            </div>

            <button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-xl font-bold text-sm transition-colors flex items-center justify-center gap-2">
                Book Now
                <ExternalLink size={14} />
            </button>
        </div>
    );
}
