import { Clock, MapPin, DollarSign, Star } from "lucide-react"

interface TimelineItemProps {
    time: string
    title: string
    description?: string
    location: string
    price?: string
    rating?: number
    category: "food" | "activity" | "relax" | "transport"
    image?: string
}

export function TimelineItem({ time, title, description, location, price, rating, category }: TimelineItemProps) {
    const getCategoryColor = (cat: string) => {
        switch (cat) {
            case "food": return "bg-orange-100 text-orange-600 border-orange-200"
            case "activity": return "bg-indigo-100 text-indigo-600 border-indigo-200"
            case "relax": return "bg-teal-100 text-teal-600 border-teal-200"
            case "transport": return "bg-slate-100 text-slate-600 border-slate-200"
            default: return "bg-slate-100 text-slate-600 border-slate-200"
        }
    }

    return (
        <div className="flex gap-4 relative pl-2">
            {/* Timeline Line */}
            <div className="absolute left-[3.25rem] top-8 bottom-[-2rem] w-0.5 bg-slate-100 last:bottom-0" />

            {/* Time */}
            <div className="w-12 text-xs font-medium text-slate-500 pt-1 shrink-0 text-right">
                {time}
            </div>

            {/* Node */}
            <div className={`relative z-10 w-3 h-3 rounded-full mt-1.5 ring-4 ring-white shrink-0 ${category === "activity" ? "bg-indigo-500" :
                    category === "food" ? "bg-orange-500" : "bg-teal-500"
                }`} />

            {/* Card */}
            <div className="flex-1 bg-white p-4 rounded-xl border border-slate-100 shadow-sm mb-6 hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-2">
                    <div>
                        <div className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider mb-1 ${getCategoryColor(category)}`}>
                            {category}
                        </div>
                        <h3 className="font-semibold text-slate-900 leading-tight">{title}</h3>
                    </div>
                    {rating && (
                        <div className="flex items-center gap-1 bg-slate-50 px-1.5 py-0.5 rounded-md">
                            <Star className="h-3 w-3 text-amber-400 fill-amber-400" />
                            <span className="text-xs font-medium text-slate-700">{rating}</span>
                        </div>
                    )}
                </div>

                {description && <p className="text-sm text-slate-600 mb-2 line-clamp-2">{description}</p>}

                <div className="flex items-center gap-4 text-xs text-slate-500 mt-3 pt-3 border-t border-slate-50">
                    <div className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        <span>{location}</span>
                    </div>
                    {price && (
                        <div className="flex items-center gap-1">
                            <DollarSign className="h-3 w-3" />
                            <span>{price}</span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
