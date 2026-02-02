"use client";

import { AlertCircle } from "lucide-react";
import { useState, useEffect } from "react";

interface EmergencyContactsProps {
    destination: string;
}

export function EmergencyContacts({ destination }: EmergencyContactsProps) {
    const [numbers, setNumbers] = useState({ police: '110', ambulance: '119', fire: '119' });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (destination) {
            fetchNumbers();
        }
    }, [destination]);

    const fetchNumbers = async () => {
        setLoading(true);
        try {
            const response = await fetch('/api/generate-safety-culture', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ destination }),
            });

            if (response.ok) {
                const data = await response.json();
                if (data.emergencyNumbers) {
                    setNumbers(data.emergencyNumbers);
                }
            }
        } catch (error) {
            console.error('Failed to fetch emergency numbers:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div id="emergency-contacts" className="bg-red-50 border border-red-100 rounded-xl p-4 flex items-center justify-between mb-8 transition-colors hover:bg-red-100/50">
            <div className="flex items-center gap-3">
                <AlertCircle size={20} className="text-red-500 shrink-0" />
                <div>
                    <div className="text-xs font-bold text-red-800">Emergency Contacts ({destination})</div>
                    <div className="text-[10px] text-red-600 font-medium">
                        Police: {numbers.police} | Ambulance/Fire: {numbers.ambulance}
                    </div>
                </div>
            </div>
        </div>
    );
}
