import Link from "next/link";
import { ArrowRight } from "lucide-react";

export function FooterCTA() {
    return (
        <section className="py-32 bg-gradient-to-br from-primary via-purple-600 to-secondary text-white text-center">
            <div className="container mx-auto px-4">
                <h2 className="text-4xl md:text-5xl font-bold mb-6">Ready to Start Your Adventure?</h2>
                <p className="text-xl text-purple-100 max-w-2xl mx-auto mb-10">
                    Let AI plan your perfect trip in minutes. Join thousands of happy travelers.
                </p>

                <Link
                    href="/login"
                    className="inline-flex items-center gap-2 bg-white text-primary px-8 py-4 rounded-xl font-bold text-lg hover:bg-gray-50 transition-colors shadow-lg"
                >
                    Build My Trip Now
                    <ArrowRight size={20} />
                </Link>
            </div>
        </section>
    );
}
