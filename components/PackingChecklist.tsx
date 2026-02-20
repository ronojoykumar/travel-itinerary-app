"use client";

import { useState, useEffect } from "react";
import { CheckCircle2, Circle, Download } from "lucide-react";

interface ChecklistItem {
    id: number;
    label: string;
    checked: boolean;
}

interface PackingChecklistProps {
    destinations: string[];
    startDate: string;
    endDate: string;
    tripType: string;
    interests: string[];
}

export function PackingChecklist({ destinations, startDate, endDate, tripType, interests }: PackingChecklistProps) {
    const [items, setItems] = useState<ChecklistItem[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchChecklist();
    }, []);

    const fetchChecklist = async () => {
        setLoading(true);
        try {
            const response = await fetch('/api/generate-checklist', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    destinations,
                    startDate,
                    endDate,
                    tripType,
                    interests
                }),
            });

            if (response.ok) {
                const data = await response.json();
                // Flatten categories into items — max 20 most important
                let id = 1;
                const allItems: ChecklistItem[] = [];
                data.categories?.forEach((category: any) => {
                    category.items.forEach((item: string) => {
                        allItems.push({ id: id++, label: item, checked: false });
                    });
                });
                setItems(allItems.slice(0, 20)); // cap at 20
            }
        } catch (error) {
            console.error('Failed to fetch checklist:', error);
        } finally {
            setLoading(false);
        }
    };

    const toggleItem = (id: number) => {
        setItems(items.map(item =>
            item.id === id ? { ...item, checked: !item.checked } : item
        ));
    };

    const exportToPDF = () => {
        // Simple implementation using window.print
        // Create a printable version
        const printWindow = window.open('', '_blank');
        if (!printWindow) return;

        const checkedItems = items.filter(i => i.checked);
        const uncheckedItems = items.filter(i => !i.checked);

        printWindow.document.write(`
            <html>
                <head>
                    <title>Packing Checklist - ${destinations.join(", ")}</title>
                    <style>
                        body { font-family: Arial, sans-serif; padding: 40px; }
                        h1 { color: #1e40af; }
                        .section { margin: 20px 0; }
                        .item { padding: 8px 0; border-bottom: 1px solid #e5e7eb; }
                        .checked { text-decoration: line-through; color: #9ca3af; }
                    </style>
                </head>
                <body>
                    <h1>Packing Checklist</h1>
                    <p><strong>Destination:</strong> ${destinations.join(", ")}</p>
                    <p><strong>Dates:</strong> ${startDate} - ${endDate}</p>
                    
                    <div class="section">
                        <h2>Packed (${checkedItems.length})</h2>
                        ${checkedItems.map(item => `<div class="item checked">✓ ${item.label}</div>`).join('')}
                    </div>
                    
                    <div class="section">
                        <h2>To Pack (${uncheckedItems.length})</h2>
                        ${uncheckedItems.map(item => `<div class="item">☐ ${item.label}</div>`).join('')}
                    </div>
                </body>
            </html>
        `);
        printWindow.document.close();
        printWindow.print();
    };

    const packedCount = items.filter(i => i.checked).length;

    if (loading) {
        return (
            <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm mb-6">
                <p className="text-gray-500">Generating personalized packing checklist...</p>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm mb-6 text-gray-900">
            <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-3">
                    <div className="bg-blue-100 text-blue-600 p-2 rounded-full">
                        <CheckCircle2 size={24} />
                    </div>
                    <div>
                        <h3 className="font-bold text-lg">Packing Checklist</h3>
                        <p className="text-gray-500 text-sm">{packedCount} of {items.length} items packed</p>
                    </div>
                </div>
                <button
                    onClick={exportToPDF}
                    className="flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-gray-900 border border-gray-200 px-3 py-1.5 rounded-lg transition-colors"
                >
                    <Download size={14} />
                    Export
                </button>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
                {items.map((item) => (
                    <div
                        key={item.id}
                        onClick={() => toggleItem(item.id)}
                        className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 cursor-pointer transition-colors"
                    >
                        {item.checked ? (
                            <div className="bg-blue-600 text-white rounded p-0.5">
                                <CheckCircle2 size={16} />
                            </div>
                        ) : (
                            <div className="text-gray-300">
                                <Circle size={20} />
                            </div>
                        )}
                        <span className={`text-sm font-medium ${item.checked ? "text-gray-400 line-through" : "text-gray-700"}`}>
                            {item.label}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
}
