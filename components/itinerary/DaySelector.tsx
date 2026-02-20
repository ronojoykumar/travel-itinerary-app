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
        <div className="sticky top-0 z-20 bg-white/80 backdrop-blur-xl border-b border-slate-100/80 overflow-x-auto no-scrollbar">
            <div className="flex gap-2 min-w-max px-4 py-3">
                {days.map((day, index) => {
                    const isSelected = selectedDay === index
                    return (
                        <button
                            key={index}
                            onClick={() => onSelect(index)}
                            className={cn(
                                "relative flex flex-col items-center justify-center min-w-[4rem] py-2.5 px-4 rounded-2xl transition-all duration-300 select-none",
                                isSelected
                                    ? "text-white"
                                    : "text-slate-500 hover:text-slate-800 hover:bg-slate-50"
                            )}
                            style={isSelected ? {
                                background: "linear-gradient(135deg, #6C5CE7 0%, #a78bfa 100%)",
                                boxShadow: "0 4px 20px rgba(108, 92, 231, 0.35), 0 0 0 1px rgba(108,92,231,0.15)",
                            } : {}}
                        >
                            <span className={cn(
                                "text-[10px] font-semibold uppercase tracking-widest mb-0.5",
                                isSelected ? "text-white/70" : "text-slate-400"
                            )}>
                                {day.day}
                            </span>
                            <span className="text-base font-bold leading-none">{day.date}</span>

                            {/* Animated bottom dot indicator */}
                            {isSelected && (
                                <motion.div
                                    layoutId="dayPill"
                                    className="absolute -bottom-1.5 w-1 h-1 rounded-full bg-violet-500"
                                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                                />
                            )}
                        </button>
                    )
                })}
            </div>
        </div>
    )
}
