import Link from "next/link";
import { Bot } from "lucide-react";

interface HeaderProps {
    hideCta?: boolean;
}

export function Header({ hideCta = false }: HeaderProps) {
    return (
        <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
            <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                <Link href="/" className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-white">
                        <Bot size={20} />
                    </div>
                    <span className="text-xl font-bold tracking-tight">TripPilot AI</span>
                </Link>

                {!hideCta && (
                    <Link
                        href="/login"
                        className="bg-primary text-white px-4 py-2 rounded-full text-sm font-medium hover:bg-primary/90 transition-colors"
                    >
                        Start Planning &rarr;
                    </Link>
                )}
            </div>
        </header>
    );
}
