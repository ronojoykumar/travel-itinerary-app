import { Plane, ArrowRight, Clock } from "lucide-react"

interface TransportItemProps {
    type: "flight" | "train" | "bus"
    from: string
    to: string
    duration: string
    departureTime: string
    arrivalTime: string
    provider: string
    price: string
}

export function TransportItem({ type, from, to, duration, departureTime, arrivalTime, provider, price }: TransportItemProps) {
    return (
        <div className="flex gap-4 relative pl-2">
            <div className="absolute left-[3.25rem] top-8 bottom-[-2rem] w-0.5 bg-slate-100" />

            <div className="w-12 text-xs font-medium text-slate-500 pt-1 shrink-0 text-right">
                {departureTime}
            </div>

            <div className="relative z-10 flex items-center justify-center w-6 h-6 -ml-1.5 bg-indigo-50 rounded-full ring-4 ring-white shrink-0 text-indigo-600">
                <Plane className="h-3.5 w-3.5" />
            </div>

            <div className="flex-1 bg-indigo-50/50 p-4 rounded-xl border border-indigo-100 border-dashed mb-6">
                <div className="flex justify-between items-center mb-3">
                    <div className="flex items-center gap-2">
                        <span className="font-semibold text-indigo-900">{provider}</span>
                    </div>
                    <span className="font-bold text-slate-900">{price}</span>
                </div>

                <div className="flex items-center justify-between text-sm">
                    <div className="text-center">
                        <div className="font-bold text-slate-900">{departureTime}</div>
                        <div className="text-xs text-slate-500">{from}</div>
                    </div>

                    <div className="flex-1 px-4 flex flex-col items-center">
                        <div className="text-[10px] text-slate-500 mb-1">{duration}</div>
                        <div className="w-full h-px bg-indigo-200 relative flex items-center justify-center">
                            <div className="w-1 h-1 rounded-full bg-indigo-400 absolute left-0" />
                            <ArrowRight className="h-3 w-3 text-indigo-400 absolute right-0 -mr-1" />
                        </div>
                    </div>

                    <div className="text-center">
                        <div className="font-bold text-slate-900">{arrivalTime}</div>
                        <div className="text-xs text-slate-500">{to}</div>
                    </div>
                </div>
            </div>
        </div>
    )
}
