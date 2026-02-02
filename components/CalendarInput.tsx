"use client";

import { useState, useEffect, useRef } from "react";
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from "lucide-react";

interface CalendarInputProps {
    label: string;
    value: string; // Format: "MM/DD/YYYY"
    onChange: (date: string) => void;
}

export function CalendarInput({ label, value, onChange }: CalendarInputProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [currentDate, setCurrentDate] = useState(new Date()); // Tracks the month being viewed
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Parse initial value string to setting selected date
    useEffect(() => {
        if (value) {
            const date = new Date(value);
            if (!isNaN(date.getTime())) {
                setSelectedDate(date);
                setCurrentDate(date);
            }
        }
    }, [value]);

    // Handle outside click to close
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const months = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];

    const getDaysInMonth = (year: number, month: number) => {
        return new Date(year, month + 1, 0).getDate();
    };

    const getFirstDayOfMonth = (year: number, month: number) => {
        return new Date(year, month, 1).getDay();
    };

    const handlePrevMonth = (e: React.MouseEvent) => {
        e.stopPropagation();
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    };

    const handleNextMonth = (e: React.MouseEvent) => {
        e.stopPropagation();
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
    };

    const handleDayClick = (day: number) => {
        const newDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
        setSelectedDate(newDate);
        onChange(newDate.toLocaleDateString('en-US')); // Format: MM/DD/YYYY
        setIsOpen(false);
    };

    const renderCalendarDays = () => {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();
        const daysInMonth = getDaysInMonth(year, month);
        const firstDay = getFirstDayOfMonth(year, month);

        const days = [];

        // Empty slots for previous month
        for (let i = 0; i < firstDay; i++) {
            days.push(<div key={`empty-${i}`} className="h-8 w-8"></div>);
        }

        // Days of current month
        for (let day = 1; day <= daysInMonth; day++) {
            const dateToCheck = new Date(year, month, day);
            const isSelected = selectedDate &&
                dateToCheck.getDate() === selectedDate.getDate() &&
                dateToCheck.getMonth() === selectedDate.getMonth() &&
                dateToCheck.getFullYear() === selectedDate.getFullYear();

            days.push(
                <button
                    key={day}
                    onClick={() => handleDayClick(day)}
                    className={`h-8 w-8 text-xs font-medium rounded-full flex items-center justify-center transition-colors
              ${isSelected
                            ? "bg-blue-600 text-white"
                            : "text-gray-700 hover:bg-gray-100"}`}
                >
                    {day}
                </button>
            );
        }
        return days;
    };

    return (
        <div className="relative" ref={dropdownRef}>
            <label className="block text-sm font-bold mb-2">{label}</label>
            <div
                onClick={() => setIsOpen(!isOpen)}
                className="relative cursor-pointer"
            >
                <CalendarIcon size={18} className="absolute left-3 top-3.5 text-gray-400" />
                <input
                    type="text"
                    readOnly
                    value={value}
                    className="w-full bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-xl focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 p-3 pointer-events-none"
                />
            </div>

            {isOpen && (
                <div className="absolute top-full left-0 mt-2 bg-white rounded-xl shadow-xl border border-gray-100 p-4 z-50 w-72 animate-in fade-in zoom-in-95 duration-200">
                    <div className="flex justify-between items-center mb-4">
                        <span className="font-bold text-sm">
                            {months[currentDate.getMonth()]} {currentDate.getFullYear()}
                        </span>
                        <div className="flex gap-1">
                            <button onClick={handlePrevMonth} className="p-1 hover:bg-gray-100 rounded text-gray-500">
                                <ChevronLeft size={16} />
                            </button>
                            <button onClick={handleNextMonth} className="p-1 hover:bg-gray-100 rounded text-gray-500">
                                <ChevronRight size={16} />
                            </button>
                        </div>
                    </div>

                    <div className="grid grid-cols-7 gap-1 mb-2">
                        {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map(d => (
                            <div key={d} className="h-8 w-8 flex items-center justify-center text-[10px] font-bold text-gray-400">
                                {d}
                            </div>
                        ))}
                        {renderCalendarDays()}
                    </div>

                    <div className="flex justify-between border-t border-gray-100 pt-3 mt-2">
                        <button
                            onClick={() => {
                                setSelectedDate(null);
                                onChange("");
                                setIsOpen(false);
                            }}
                            className="text-xs font-bold text-blue-600 hover:text-blue-700"
                        >
                            Clear
                        </button>
                        <button
                            onClick={() => {
                                const today = new Date();
                                setSelectedDate(today);
                                setCurrentDate(today);
                                onChange(today.toLocaleDateString('en-US'));
                                setIsOpen(false);
                            }}
                            className="text-xs font-bold text-blue-600 hover:text-blue-700"
                        >
                            Today
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
