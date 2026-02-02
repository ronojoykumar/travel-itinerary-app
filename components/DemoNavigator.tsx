"use client";

import { useState } from "react";
import Link from "next/link";
import { LayoutGrid, X } from "lucide-react";
import { usePathname } from "next/navigation";

export function DemoNavigator() {
    const [isOpen, setIsOpen] = useState(true); // Default open as per screenshot
    const pathname = usePathname();

    const pages = [
        { name: "1. Home", path: "/" },
        { name: "2. Trip Set Up", path: "/setup" },
        { name: "3. AI Processing", path: "/processing" },
        { name: "4. Itinerary (Timeline)", path: "/itinerary" },
        { name: "5. Booking Partners", path: "/booking" },
        { name: "6. Customize", path: "/customize" },
        { name: "7. Pre-Trip Briefing", path: "/briefing" },
        { name: "8. Live Trip Mode", path: "/live" },
        { name: "9. AI Chat Assistant", path: "/chat" },
    ];

    if (!isOpen) {
        return (
            <button
                onClick={() => setIsOpen(true)}
                className="fixed top-4 right-4 z-50 bg-white p-3 rounded-full shadow-lg border border-gray-200 hover:bg-gray-50"
            >
                <LayoutGrid size={20} />
            </button>
        );
    }

    return (
        <div className="fixed top-4 right-4 z-50 w-72 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden font-sans">
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-4 text-white flex justify-between items-center">
                <div>
                    <div className="font-bold text-sm">Demo Navigator</div>
                    <div className="text-[10px] opacity-80">Click to jump to any screen</div>
                </div>
                <button onClick={() => setIsOpen(false)} className="hover:bg-white/20 p-1 rounded">
                    <X size={16} />
                </button>
            </div>

            <div className="p-2 bg-gray-50 max-h-[80vh] overflow-y-auto">
                <div className="space-y-1">
                    {pages.map((page) => (
                        <Link
                            key={page.path}
                            href={page.path}
                            className={`block px-4 py-3 rounded-lg text-sm font-medium transition-colors ${pathname === page.path
                                ? "bg-purple-600 text-white shadow-md"
                                : "bg-white text-gray-600 hover:bg-gray-100 border border-gray-100"
                                }`}
                        >
                            {page.name}
                            {pathname === page.path && <span className="float-right text-[10px] bg-white/20 px-2 py-0.5 rounded-full ml-2">Active</span>}
                        </Link>
                    ))}
                </div>
            </div>

            <div className="p-3 bg-white text-center border-t border-gray-100 text-xs text-gray-400">
                💡 Hide panel before screenshots
            </div>
        </div>
    );
}
