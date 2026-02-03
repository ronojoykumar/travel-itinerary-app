"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Loader2, Plane, Map as MapIcon, Calendar, CheckCircle } from "lucide-react"
import { useTrip } from "@/hooks/useTrip"

export default function ProcessingPage() {
    const { tripData, saveTrip, isLoaded } = useTrip()
    const router = useRouter()
    const [step, setStep] = useState(0)

    const steps = [
        { text: "Analyzing your preferences...", icon: MapIcon },
        { text: "Finding the best flights...", icon: Plane },
        { text: "Curating daily activities...", icon: Calendar },
        { text: "Finalizing your itinerary...", icon: CheckCircle },
    ]

    useEffect(() => {
        // Animation Interval
        const interval = setInterval(() => {
            setStep((prev) => {
                if (prev >= steps.length - 1) {
                    clearInterval(interval)
                    return prev
                }
                return prev + 1
            })
        }, 1500)

        return () => clearInterval(interval)
    }, [])

    useEffect(() => {
        if (!isLoaded || !tripData) return;

        const generate = async () => {
            try {
                const response = await fetch('/api/generate-itinerary', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(tripData),
                });

                if (!response.ok) {
                    const errorText = await response.text();
                    console.error("API Error Response:", errorText);
                    alert(`Failed to generate itinerary: ${response.status} ${response.statusText}`);
                    router.push("/itinerary");
                    return;
                }

                const data = await response.json();
                if (data.itinerary) {
                    saveTrip({ itinerary: data.itinerary });
                    router.push("/itinerary");
                } else {
                    console.error("No itinerary returned");
                    alert("No itinerary was generated. Using fallback.");
                    router.push("/itinerary"); // fallback
                }
            } catch (error) {
                console.error("Failed to generate:", error);
                alert(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
                router.push("/itinerary"); // fallback
            }
        };

        generate();

    }, [isLoaded, tripData, router])

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4 text-slate-900">
            <div className="max-w-md w-full text-center space-y-8">

                {/* Animated Icon */}
                <div className="relative flex justify-center items-center h-32 w-32 mx-auto">
                    <motion.div
                        className="absolute inset-0 border-4 border-indigo-100 rounded-full"
                        animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0, 0.5] }}
                        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                    />
                    <motion.div
                        className="absolute inset-2 border-4 border-indigo-200 rounded-full"
                        animate={{ scale: [1, 1.1, 1], opacity: [0.8, 0.2, 0.8] }}
                        transition={{ duration: 2, delay: 0.2, repeat: Infinity, ease: "easeInOut" }}
                    />
                    <div className="relative bg-white p-4 rounded-full shadow-lg z-10">
                        <Loader2 className="h-10 w-10 text-indigo-600 animate-spin" />
                    </div>
                </div>

                {/* Text Steps */}
                <div className="space-y-4">
                    <h2 className="text-2xl font-bold text-slate-800">Building your trip...</h2>
                    <div className="space-y-2">
                        {steps.map((s, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{
                                    opacity: i === step ? 1 : i < step ? 0.5 : 0.2,
                                    y: 0,
                                    scale: i === step ? 1.05 : 1
                                }}
                                className={`flex items-center justify-center gap-2 text-sm font-medium transition-colors duration-300 ${i === step ? "text-indigo-600" : "text-slate-400"
                                    }`}
                            >
                                <s.icon className={`h-4 w-4 ${i === step ? "animate-bounce" : ""}`} />
                                {s.text}
                            </motion.div>
                        ))}
                    </div>
                </div>

                {/* Tip Card */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1 }}
                    className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 max-w-xs mx-auto mt-8"
                >
                    <div className="flex items-start gap-3">
                        <div className="bg-amber-100 p-2 rounded-full text-amber-600 shrink-0">
                            <span className="text-xs font-bold">TIP</span>
                        </div>
                        <p className="text-xs text-slate-600 text-left">
                            "We're checking 500+ local activities to match your interests in culture and food."
                        </p>
                    </div>
                </motion.div>

            </div>
        </div>
    )
}
