import { ArrowRight, Sparkles } from "lucide-react";
import Link from "next/link";

export function Hero() {
    return (
        <section className="relative pt-32 pb-20 overflow-hidden bg-gradient-to-br from-primary via-purple-600 to-secondary text-white min-h-[80vh] flex items-center">
            <div className="container mx-auto px-4 text-center relative z-10">

                <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-1.5 rounded-full mb-8 border border-white/20">
                    <Sparkles size={14} className="text-yellow-300" />
                    <span className="text-sm font-medium">Powered by Advanced AI</span>
                </div>

                <h1 className="text-5xl md:text-7xl font-bold mb-6 tracking-tight leading-tight">
                    Your AI Travel <br />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-purple-200">
                        Co-Pilot
                    </span>
                </h1>

                <p className="text-xl md:text-2xl text-purple-100 max-w-2xl mx-auto mb-10 leading-relaxed">
                    Plan, book, and travel with one intelligent itinerary.
                    <br className="hidden md:block" />
                    Your perfect trip, optimized in minutes.
                </p>

                <div className="flex flex-col md:flex-row items-center justify-center gap-4 max-w-xl mx-auto">
                    <Link
                        href="/login"
                        className="w-full md:w-auto bg-white text-primary px-8 py-4 rounded-xl font-bold text-lg hover:bg-gray-50 transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
                    >
                        Build My Trip
                    </Link>
                    <input
                        type="text"
                        placeholder="Where to? (e.g. Tokyo)"
                        className="w-full md:w-auto flex-1 bg-white/10 backdrop-blur-md border border-white/20 rounded-xl px-6 py-4 text-white placeholder:text-purple-200 focus:outline-none focus:bg-white/20 transition-all"
                    />
                </div>

                <div className="mt-16 grid grid-cols-3 gap-8 max-w-md mx-auto text-center">
                    <div>
                        <div className="text-3xl font-bold">50K+</div>
                        <div className="text-purple-200 text-sm">Trips Planned</div>
                    </div>
                    <div>
                        <div className="text-3xl font-bold">150+</div>
                        <div className="text-purple-200 text-sm">Destinations</div>
                    </div>
                    <div>
                        <div className="text-3xl font-bold">4.9★</div>
                        <div className="text-purple-200 text-sm">User Rating</div>
                    </div>
                </div>
            </div>

            {/* Abstract Background Shapes */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-purple-500/30 rounded-full blur-[100px]" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-pink-500/30 rounded-full blur-[100px]" />
            </div>
        </section>
    );
}
