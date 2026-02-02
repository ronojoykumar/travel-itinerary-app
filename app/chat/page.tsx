"use client";

import { MessageBubble } from "@/components/MessageBubble";
import { SuggestionChips } from "@/components/SuggestionChips";
import { ArrowLeft, Send, Sparkles, Mic, Camera, Phone } from "lucide-react";
import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { useTrip } from "@/hooks/useTrip";

interface Message {
    role: "user" | "ai";
    content: string;
    time: string;
    isRich?: boolean;
}

export default function ChatPage() {
    const { tripData, isLoaded } = useTrip();
    const [inputValue, setInputValue] = useState("");
    const [messages, setMessages] = useState<Message[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    useEffect(() => {
        if (isLoaded && tripData && messages.length === 0) {
            // Generate dynamic opening message
            const destination = tripData.destinations?.[0] || "your destination";
            const openingMessage = `Hi! I’m your TripPilot AI assistant 👋\nI’ll be with you throughout your trip to ${destination}, helping you navigate your itinerary, timings, food, transport, and any on-the-go changes.\n\nYour itinerary includes cultural sites, food spots, and local experiences. What would you like help with right now?`;

            setMessages([{
                role: "ai",
                content: openingMessage,
                time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                isRich: true
            }]);
        }
    }, [isLoaded, tripData]);

    const handleSendMessage = async (text: string) => {
        if (!text.trim()) return;

        const userMessage: Message = {
            role: "user",
            content: text,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };

        setMessages(prev => [...prev, userMessage]);
        setInputValue("");
        setIsLoading(true);

        try {
            // Prepare context for API
            const apiMessages = messages.concat(userMessage).map(m => ({
                role: m.role === 'ai' ? 'assistant' : 'user',
                content: m.content
            }));

            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    messages: apiMessages,
                    tripData
                }),
            });

            if (response.ok) {
                const data = await response.json();
                const aiMessage: Message = {
                    role: "ai",
                    content: data.message,
                    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                    isRich: true
                };
                setMessages(prev => [...prev, aiMessage]);
            }
        } catch (error) {
            console.error("Failed to send message:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleChipClick = (text: string) => {
        handleSendMessage(text);
    };

    if (!isLoaded) return <div className="min-h-screen bg-gray-50 flex items-center justify-center">Loading...</div>;

    return (
        <div className="flex flex-col h-screen bg-gray-50">
            {/* Header */}
            <header className="bg-white border-b border-gray-100 p-4 flex items-center gap-4 sticky top-0 z-10 shadow-sm">
                <Link href="/live" className="text-gray-500 hover:text-gray-900 transition-colors">
                    <ArrowLeft size={20} />
                </Link>
                <div className="flex-1">
                    <h1 className="font-bold text-lg flex items-center gap-2">
                        TripPilot AI
                        <Sparkles size={14} className="text-blue-500" />
                    </h1>
                    <p className="text-xs text-gray-500">
                        {tripData?.destinations?.[0] ? `Guide for ${tripData.destinations[0]}` : 'Your Trip Companion'}
                    </p>
                </div>
                <button className="bg-orange-50 text-orange-600 px-3 py-2 rounded-lg text-xs font-bold border border-orange-100 flex items-center gap-2 hover:bg-orange-100 transition-colors">
                    <Phone size={14} />
                    <span className="hidden sm:inline">Human Agent</span>
                </button>
            </header>

            {/* Chat Area */}
            <main className="flex-1 overflow-y-auto p-4 pb-40">
                {messages.map((msg, idx) => (
                    <MessageBubble
                        key={idx}
                        role={msg.role}
                        time={msg.time}
                        content={msg.content}
                        isRich={msg.isRich}
                    />
                ))}

                {isLoading && (
                    <div className="flex gap-3 mb-6">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 text-white flex items-center justify-center shrink-0">
                            <Sparkles size={16} className="animate-pulse" />
                        </div>
                        <div className="bg-white border border-gray-100 px-4 py-3 rounded-2xl rounded-tl-none shadow-sm">
                            <div className="flex gap-1">
                                <span className="w-2 h-2 bg-gray-300 rounded-full animate-bounce"></span>
                                <span className="w-2 h-2 bg-gray-300 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                                <span className="w-2 h-2 bg-gray-300 rounded-full animate-bounce [animation-delay:0.4s]"></span>
                            </div>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </main>

            {/* Input Area */}
            <div className="fixed bottom-0 left-0 right-0 bg-gray-50 pt-2 pb-6 z-20">
                <div className="container max-w-4xl mx-auto">
                    <SuggestionChips onSelect={handleChipClick} />

                    <div className="px-4 mt-2">
                        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm flex items-center p-2 gap-2">
                            <button className="p-2 text-gray-400 hover:text-blue-600 transition-colors">
                                <Camera size={20} />
                            </button>
                            <input
                                type="text"
                                placeholder="Ask about your trip..."
                                className="flex-1 bg-transparent px-3 py-2 outline-none text-sm"
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage(inputValue)}
                            />
                            <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
                                <Mic size={20} />
                            </button>
                            <button
                                onClick={() => handleSendMessage(inputValue)}
                                disabled={!inputValue.trim() || isLoading}
                                className="bg-blue-600 text-white p-2 rounded-xl hover:bg-blue-700 transition-colors shadow disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <Send size={18} />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
