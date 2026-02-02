"use client";

import { useState, useEffect } from "react";

export type TripData = {
    tripType: string;
    destinations: string[];
    startDate: string;
    endDate: string;
    budget: number;
    interests: string[];
    itinerary: any[]; // Storing the full schedule array
};

const DEFAULT_TRIP: TripData = {
    tripType: "Weekend",
    destinations: ["Tokyo, Japan"],
    startDate: "02/14/2026",
    endDate: "02/17/2026",
    budget: 1500,
    interests: ["Food", "Culture"],
    itinerary: [],
};

export function useTrip() {
    const [tripData, setTripData] = useState<TripData>(DEFAULT_TRIP);
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        const saved = localStorage.getItem("tripData");
        if (saved) {
            try {
                setTripData(JSON.parse(saved));
            } catch (e) {
                console.error("Failed to parse trip data", e);
            }
        }
        setIsLoaded(true);
    }, []);

    const saveTrip = (data: Partial<TripData>) => {
        const newData = { ...tripData, ...data };
        setTripData(newData);
        localStorage.setItem("tripData", JSON.stringify(newData));
    };

    return { tripData, saveTrip, isLoaded };
}
