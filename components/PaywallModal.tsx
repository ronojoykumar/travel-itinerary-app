"use client";

import { useState } from "react";
import { X, Lock, Sparkles, CheckCircle2, Tag } from "lucide-react";

const SECRET_CODE = "Alohomora";

interface PaywallModalProps {
    onUnlock: () => void;
}

export function PaywallModal({ onUnlock }: PaywallModalProps) {
    const [coupon, setCoupon] = useState("");
    const [couponStatus, setCouponStatus] = useState<"idle" | "success" | "error">("idle");
    const [couponMessage, setCouponMessage] = useState("");

    const handleApplyCoupon = () => {
        if (coupon.trim() === SECRET_CODE) {
            setCouponStatus("success");
            setCouponMessage("Coupon applied! You have unlimited access.");
            // Store bypass in sessionStorage and unlock after a short delay
            setTimeout(() => {
                sessionStorage.setItem("paywall_bypass", "true");
                onUnlock();
            }, 1200);
        } else {
            setCouponStatus("error");
            setCouponMessage("Invalid coupon code. Please try again.");
        }
    };

    const handleStripeCheckout = () => {
        // TODO: Replace with your Stripe Checkout URL or API call
        // e.g. router.push('/api/create-checkout-session')
        alert("Payment integration coming soon! Add your Stripe keys to activate.");
    };

    return (
        <>
            {/* Backdrop */}
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
                {/* Modal */}
                <div className="bg-white w-full sm:max-w-md sm:rounded-3xl rounded-t-3xl overflow-hidden shadow-2xl animate-in slide-in-from-bottom-4 duration-300">
                    {/* Gradient header */}
                    <div className="bg-gradient-to-br from-violet-600 via-purple-600 to-pink-500 px-6 pt-8 pb-10 text-center relative">
                        <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mx-auto mb-4">
                            <Lock size={24} className="text-white" />
                        </div>
                        <h2 className="text-2xl font-bold text-white mb-1">Unlock Unlimited Adventures!</h2>
                        <p className="text-white/80 text-sm">
                            You've used your 5 free itineraries this month. Upgrade to keep planning!
                        </p>
                    </div>

                    <div className="px-6 py-6 -mt-4">
                        {/* Pricing card */}
                        <div className="bg-white border-2 border-indigo-100 rounded-2xl p-5 mb-5 shadow-sm">
                            <div className="flex items-center justify-between mb-3">
                                <div>
                                    <p className="font-bold text-gray-900 text-lg">TripPilot Pro</p>
                                    <p className="text-gray-500 text-sm">Unlimited itineraries every month</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-2xl font-bold text-indigo-600">$9.99</p>
                                    <p className="text-gray-400 text-xs">/month</p>
                                </div>
                            </div>

                            <div className="space-y-2 mb-5">
                                {["Unlimited AI itineraries", "Save & revisit all past trips", "Priority AI responses", "Cancel anytime"].map((feature) => (
                                    <div key={feature} className="flex items-center gap-2">
                                        <CheckCircle2 size={16} className="text-indigo-500 shrink-0" />
                                        <span className="text-sm text-gray-700">{feature}</span>
                                    </div>
                                ))}
                            </div>

                            <button
                                onClick={handleStripeCheckout}
                                className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3.5 rounded-xl font-bold text-base hover:opacity-90 transition-opacity shadow-lg shadow-indigo-200 flex items-center justify-center gap-2"
                            >
                                <Sparkles size={18} />
                                Start Planning — $9.99/month
                            </button>
                        </div>

                        {/* Coupon code section */}
                        <div>
                            <p className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-1.5">
                                <Tag size={14} className="text-gray-500" />
                                Have a coupon code?
                            </p>
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={coupon}
                                    onChange={(e) => {
                                        setCoupon(e.target.value);
                                        setCouponStatus("idle");
                                        setCouponMessage("");
                                    }}
                                    onKeyDown={(e) => e.key === "Enter" && handleApplyCoupon()}
                                    placeholder="Enter code..."
                                    className="flex-1 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-indigo-400 transition-all"
                                />
                                <button
                                    onClick={handleApplyCoupon}
                                    className="bg-indigo-600 text-white px-4 py-2.5 rounded-xl font-semibold text-sm hover:bg-indigo-700 transition-colors shrink-0"
                                >
                                    Apply
                                </button>
                            </div>

                            {couponStatus !== "idle" && (
                                <div className={`mt-2.5 px-4 py-2.5 rounded-xl text-sm font-medium ${couponStatus === "success"
                                        ? "bg-green-50 text-green-700 border border-green-200"
                                        : "bg-red-50 text-red-700 border border-red-200"
                                    }`}>
                                    {couponMessage}
                                </div>
                            )}
                        </div>

                        <p className="text-center text-xs text-gray-400 mt-5">
                            Secure payment powered by Stripe · Cancel anytime
                        </p>
                    </div>
                </div>
            </div>
        </>
    );
}
