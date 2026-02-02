"use client"

import { cn } from "@/lib/utils"
import { motion } from "framer-motion"

interface DaySelectorProps {
    days: { date: string; day: string }[]
    selectedDay: number
    onSelect: (index: number) => void
}

export function DaySelector({ days, selectedDay, onSelect }: DaySelectorProps) {
    return (
        <div className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-gray-100 overflow-x-auto no-scrollbar py-3 px-4">
            <div className="flex gap-3 min-w-max">
                {days.map((day, index) => {
                    const isSelected = selectedDay === index
                    return (
                        <button
                            key={index}
                            onClick={() => onSelect(index)}
                            className={cn(
                                "relative flex flex-col items-center justify-center min-w-[4.5rem] py-2 px-3 rounded-2xl transition-all duration-300",
                                isSelected
                                    ? "bg-indigo-600 text-white shadow-lg shadow-indigo-200 ring-2 ring-indigo-100 ring-offset-1"
                                    : "bg-white text-slate-600 hover:bg-slate-50 border border-slate-100"
                            )}
                        >
                            <span className={cn("text-xs font-medium mb-0.5", isSelected ? "text-white/80" : "text-slate-400")}>
                                {day.day}
                            </span>
                            <span className="text-lg font-bold leading-none">{day.date}</span>

                            {isSelected && (
                                <motion.div
                                    layoutId="activeDayIndicator"
                                    className="absolute -bottom-1 w-1 h-1 bg-white rounded-full"
                                />
                            )}
                        </button>
                    )
                })}
            </div>
        </div>
    )
}
