import { Bot, ArrowLeft, LogOut } from "lucide-react";
import Link from "next/link";

interface ActiveTripHeaderProps {
    dayNumber: number;
    title: string;
    date: string;
    onNavigate: () => void;
    onEmergency: () => void;
    onLogout: () => void;
}

export function ActiveTripHeader({ dayNumber, title, date, onNavigate, onEmergency, onLogout }: ActiveTripHeaderProps) {
    return (
        <header className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 pb-12 rounded-b-[2rem] shadow-lg relative z-10">
            <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-2">
                    <Link href="/briefing" className="bg-white/20 p-1.5 rounded-full hover:bg-white/30 transition-colors">
                        <ArrowLeft size={16} />
                    </Link>
                    <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse ml-2"></span>
                    <span className="text-xs font-bold uppercase tracking-wider opacity-90">Live Trip Mode</span>
                </div>
                <button
                    onClick={onLogout}
                    className="bg-white/20 p-1.5 rounded-full hover:bg-white/30 transition-colors text-white"
                    title="Logout"
                >
                    <LogOut size={16} />
                </button>
            </div>

            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-2xl font-bold mb-1">Day {dayNumber} - {title}</h1>
                    <p className="text-purple-100 text-sm">{date}</p>
                </div>
                <Link href="/chat" className="bg-white text-blue-600 px-4 py-2 rounded-full text-xs font-bold flex items-center gap-2 shadow-md hover:bg-gray-100 transition-colors">
                    <Bot size={14} />
                    AI Assistant
                </Link>
            </div>

            {/* Quick Actions Row */}
            <div className="absolute -bottom-6 left-0 w-full px-4">
                <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-2 flex justify-between">
                    <button
                        onClick={onNavigate}
                        className="flex-1 py-2 text-center text-xs font-bold text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                    >
                        Navigate
                    </button>
                    <div className="w-px bg-gray-100 my-1"></div>
                    <a
                        href="https://translate.google.com"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 py-2 text-center text-xs font-bold text-gray-700 hover:bg-gray-50 rounded-lg transition-colors block leading-[inherit] flex items-center justify-center"
                    >
                        Translate
                    </a>
                    <div className="w-px bg-gray-100 my-1"></div>
                    <Link
                        href="/chat?q=Is this a fair price?"
                        className="flex-1 py-2 text-center text-xs font-bold text-gray-700 hover:bg-gray-50 rounded-lg transition-colors block leading-[inherit] flex items-center justify-center"
                    >
                        Fair Price?
                    </Link>
                    <div className="w-px bg-gray-100 my-1"></div>
                    <button
                        onClick={onEmergency}
                        className="flex-1 py-2 text-center text-xs font-bold text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    >
                        Emergency
                    </button>
                </div>
            </div>
        </header>
    );
}
