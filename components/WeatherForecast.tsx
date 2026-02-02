"use client";

import { CloudRain, CloudSun, Sun, Cloud } from "lucide-react";
import { useState, useEffect } from "react";

interface WeatherForecastProps {
    destinations: string[];
    startDate: string;
    endDate: string;
}

interface DayWeather {
    date: string;
    temp: string;
    condition: string;
}

export function WeatherForecast({ destinations, startDate, endDate }: WeatherForecastProps) {
    const [forecast, setForecast] = useState<DayWeather[]>([]);

    useEffect(() => {
        generateForecast();
    }, []);

    const generateForecast = () => {
        // Generate simple forecast for trip days
        const start = new Date(startDate);
        const end = new Date(endDate);
        const days: DayWeather[] = [];

        let currentDate = new Date(start);
        while (currentDate <= end) {
            const dateStr = currentDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
            // Simple mock weather - in production, use a weather API
            const temp = Math.floor(Math.random() * 10) + 10; // 10-20°C
            const conditions = ['Sunny', 'Partly Cloudy', 'Cloudy', 'Light Rain'];
            const condition = conditions[Math.floor(Math.random() * conditions.length)];

            days.push({
                date: dateStr,
                temp: `${temp}°C / ${Math.floor(temp * 9 / 5 + 32)}°F`,
                condition
            });

            currentDate.setDate(currentDate.getDate() + 1);
        }

        setForecast(days.slice(0, 5)); // Show max 5 days
    };

    const getWeatherIcon = (condition: string) => {
        if (condition.includes('Rain')) return CloudRain;
        if (condition.includes('Cloudy')) return Cloud;
        if (condition.includes('Partly')) return CloudSun;
        return Sun;
    };

    return (
        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm h-full">
            <div className="flex items-center gap-3 mb-6">
                <div className="bg-blue-50 text-blue-500 p-2 rounded-lg">
                    <CloudSun size={24} />
                </div>
                <div>
                    <h3 className="font-bold text-lg">Weather Forecast</h3>
                    <p className="text-gray-500 text-sm">{destinations[0]}</p>
                </div>
            </div>

            <div className="space-y-4 mb-6">
                {forecast.map((day, idx) => {
                    const Icon = getWeatherIcon(day.condition);
                    return (
                        <div key={idx} className="flex justify-between items-center text-sm">
                            <span className="text-gray-600 font-medium">Day {idx + 1} ({day.date})</span>
                            <div className="flex items-center gap-2">
                                <Icon size={16} className={day.condition.includes('Rain') ? 'text-gray-400' : day.condition === 'Sunny' ? 'text-amber-500' : 'text-amber-400'} />
                                <span className="font-bold">{day.temp}</span>
                            </div>
                        </div>
                    );
                })}
            </div>

            <div className="bg-gray-50 text-gray-500 text-xs p-3 rounded-lg text-center">
                Pack layers - temperatures vary throughout the day
            </div>
        </div>
    );
}
