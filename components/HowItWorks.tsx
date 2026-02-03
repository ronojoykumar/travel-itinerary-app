import { Calendar, Plane, MapPin } from "lucide-react";

export function HowItWorks() {
    const steps = [
        {
            icon: Calendar,
            title: "Plan",
            description: "Tell us your preferences, budget, and interests. Our AI builds a personalized itinerary in seconds.",
            tag: "AI-Powered Optimization",
            color: "bg-blue-50 text-blue-600",
            step: "Step 1"
        },
        {
            icon: Plane,
            title: "Book",
            description: "Book flights, hotels, and activities directly through our platform with best value recommendations.",
            tag: "Best Prices",
            color: "bg-pink-50 text-pink-600",
            step: "Step 2"
        },
        {
            icon: MapPin,
            title: "Travel Assist",
            description: "Get real-time navigation, translation, and local tips throughout your journey with our live assistant.",
            tag: "24/7 Support",
            color: "bg-green-50 text-green-600",
            step: "Step 3"
        }
    ];

    return (
        <section className="py-24 bg-white text-gray-900">
            <div className="container mx-auto px-4">
                <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-4xl font-bold mb-4">How TripPilot Works</h2>
                    <p className="text-gray-600 max-w-xl mx-auto">Three simple steps to your perfect journey</p>
                </div>

                <div className="grid md:grid-cols-3 gap-8">
                    {steps.map((item, index) => (
                        <div key={index} className="relative p-8 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                            <div className="absolute top-8 right-8 bg-gray-900 text-white text-xs font-bold px-3 py-1 rounded-full">
                                {item.step}
                            </div>

                            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 ${item.color}`}>
                                <item.icon size={28} />
                            </div>

                            <h3 className="text-xl font-bold mb-3">{item.title}</h3>
                            <p className="text-gray-600 mb-6 leading-relaxed">{item.description}</p>

                            <div className="inline-block bg-gray-50 text-gray-600 text-xs font-semibold px-3 py-1 rounded-md">
                                {item.tag}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
